#!/usr/bin/env bash
# Starts Matomo + MariaDB + Mailpit, installs Matomo (if needed) and activates the GroupPermissions plugin.
set -euo pipefail

cd "$(dirname "$0")/.."

SUPERUSER_LOGIN=${SUPERUSER_LOGIN:-superuser}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-superUserPass1!}
SUPERUSER_EMAIL=${SUPERUSER_EMAIL:-superuser@example.org}

compose() { docker compose "$@"; }
mexec() { compose exec -T -u www-data matomo "$@"; }

echo "==> Starting containers"
compose up -d --wait db mail matomo

echo "==> Waiting for Matomo to answer"
for _ in $(seq 1 60); do
    if mexec curl -fsS -o /dev/null http://localhost/; then break; fi
    sleep 1
done

echo "==> Copying plugin into Matomo"
compose exec -T matomo bash -c '
    set -e
    dest=/var/www/html/plugins/GroupPermissions
    rm -rf "$dest" && mkdir -p "$dest/vue"
    cd /plugin-src
    find . -maxdepth 1 -name "*.php" ! -name phpstan-bootstrap.php -exec cp {} "$dest/" \;
    cp -r plugin.json Updates \
        Dao Settings config javascripts lang stylesheets templates "$dest/"
    cp -r vue/dist "$dest/vue/dist"
    chown -R www-data:www-data "$dest"
'

is_installed() {
    # newer Matomo versions create config.ini.php on the first request, so check for the database section
    mexec grep -q '^\[database\]' /var/www/html/config/config.ini.php 2>/dev/null \
        && ! mexec grep -q installation_in_progress /var/www/html/config/config.ini.php
}

if is_installed; then
    echo "==> Matomo already installed"
else
    echo "==> Installing Matomo"
    mexec bash -s -- "$SUPERUSER_LOGIN" "$SUPERUSER_PASSWORD" "$SUPERUSER_EMAIL" <<'INSTALL'
set -euo pipefail
login=$1; password=$2; email=$3
jar=$(mktemp)
c() { curl -fsS -L -b "$jar" -c "$jar" -o /dev/null "$@"; }
base='http://localhost/index.php?module=Installation'
c "$base&action=welcome"
c "$base&action=systemCheck"
c "$base&action=databaseSetup" \
    --data-urlencode host=db --data-urlencode username=matomo --data-urlencode password=matomo \
    --data-urlencode dbname=matomo --data-urlencode tables_prefix=matomo_ \
    --data-urlencode adapter=PDO\\MYSQL --data-urlencode schema=Mysql --data-urlencode type=InnoDB
c "$base&action=tablesCreation"
c "$base&action=setupSuperUser" \
    --data-urlencode "login=$login" --data-urlencode "password=$password" \
    --data-urlencode "password_bis=$password" --data-urlencode "email=$email"
c "$base&action=firstWebsiteSetup" \
    --data-urlencode "siteName=Site One" --data-urlencode "url=https://one.example.org" \
    --data-urlencode timezone=UTC --data-urlencode ecommerce=0
c "$base&action=trackingCode&site_idSite=1&site_name=Site%20One"
c "$base&action=finished" --data-urlencode do_not_track=1 --data-urlencode anonymise_ip=1 \
    --data-urlencode submit=1 || true
rm -f "$jar"
INSTALL
    if ! is_installed; then
        echo "Matomo installation did not finish" >&2
        exit 1
    fi
fi

echo "==> Configuring Matomo for tests"
mexec ./console config:set --section=General --key=enable_trusted_host_check --value=0
mexec ./console config:set --section=General --key=force_ssl --value=0
mexec ./console config:set --section=mail --key=transport --value=smtp
mexec ./console config:set --section=mail --key=host --value=mail
mexec ./console config:set --section=mail --key=port --value=1025
mexec ./console config:set --section=mail --key=defaultHostnameIfEmpty --value=example.org
mexec ./console config:set --section=General --key=noreply_email_address --value=noreply@example.org
mexec ./console config:set --section=General --key=enable_marketplace --value=0
# avoid outgoing HTTP calls (update check, marketplace, ...) from slowing down page loads
mexec ./console config:set --section=General --key=enable_internet_features --value=0
mexec ./console config:set --section=General --key=enable_update_users_email --value=0 || true

# track one visit, otherwise the dashboard shows the "no data tracked yet" onboarding page
mexec curl -fsS -o /dev/null 'http://localhost/matomo.php?idsite=1&rec=1&url=https%3A%2F%2Fone.example.org%2F&action_name=Home'

echo "==> Activating TagManager (provides the capabilities groups can get)"
mexec ./console plugin:activate TagManager

echo "==> Activating GroupPermissions"
mexec ./console plugin:activate GroupPermissions
mexec ./console core:clear-caches

echo "==> Ready: http://localhost:${MATOMO_PORT:-8089} (login: $SUPERUSER_LOGIN / $SUPERUSER_PASSWORD)"
