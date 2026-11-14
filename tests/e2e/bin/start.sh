#!/usr/bin/env bash
# Spawns a Matomo instance with the GroupPermissions plugin and some demo data to test manually.
#
#   tests/e2e/bin/start.sh            start (or reuse) the instance and add demo data
#   tests/e2e/bin/start.sh --fresh    discard the current instance first
#   tests/e2e/bin/teardown.sh         stop and discard everything
#
# Re-run start.sh after changing plugin files: it copies the plugin into the container again.
# Ports can be changed with MATOMO_PORT (default 8089) and MAILPIT_PORT (default 8025).
set -euo pipefail

cd "$(dirname "$0")/.."

if [ "${1:-}" = "--fresh" ]; then
    ./bin/teardown.sh
fi

./bin/setup.sh

SUPERUSER_LOGIN=${SUPERUSER_LOGIN:-superuser}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-superUserPass1!}
DEMO_PASSWORD=${DEMO_PASSWORD:-demoPass1!}

echo "==> Adding demo data"
docker compose exec -T -u www-data matomo bash -s -- "$SUPERUSER_LOGIN" "$SUPERUSER_PASSWORD" "$DEMO_PASSWORD" <<'SEED'
set -euo pipefail
su_login=$1; su_password=$2; demo_password=$3
api() {
    local method=$1; shift
    curl -fsS -X POST "http://localhost/index.php?module=API&format=json&method=$method" "$@"
}
token=$(api UsersManager.createAppSpecificTokenAuth --data-urlencode "userLogin=$su_login" \
    --data-urlencode "passwordConfirmation=$su_password" --data-urlencode "description=demo data $(date +%s)" \
    | sed -E 's/.*"value":"([^"]+)".*/\1/')
call() { api "$1" --data-urlencode "token_auth=$token" "${@:2}"; }

if call GroupPermissions.getAllGroups | grep -q '"Marketing"'; then
    echo "demo data already present"
    exit 0
fi

call SitesManager.addSite --data-urlencode "siteName=Shop" --data-urlencode "urls=https://shop.example.org" >/dev/null
call SitesManager.addSite --data-urlencode "siteName=Blog" --data-urlencode "urls=https://blog.example.org" >/dev/null

for user in alice bob carol dave; do
    call UsersManager.addUser --data-urlencode "userLogin=$user" --data-urlencode "password=$demo_password" \
        --data-urlencode "email=$user@example.org" --data-urlencode "passwordConfirmation=$su_password" >/dev/null
done

group() { call GroupPermissions.createGroup --data-urlencode "groupName=$1" | sed -E 's/.*"idGroup":([0-9]+).*/\1/'; }
member() { call GroupPermissions.addUserToGroup --data-urlencode "idGroup=$1" --data-urlencode "login=$2" >/dev/null; }
access() { call GroupPermissions.setGroupAccess --data-urlencode "name=$1" --data-urlencode "access=$2" --data-urlencode "idSites=$3" >/dev/null; }

marketing=$(group Marketing); sales=$(group Sales); admins=$(group "Web Admins")
member "$marketing" alice; member "$marketing" bob
member "$sales" bob; member "$sales" carol
member "$admins" dave
access Marketing view 1,3
access Sales write 2
access "Web Admins" admin all
echo "created sites Shop/Blog, users alice/bob/carol/dave and groups Marketing/Sales/Web Admins"
SEED

cat <<INFO

Matomo:   http://localhost:${MATOMO_PORT:-8089}
          super user: $SUPERUSER_LOGIN / $SUPERUSER_PASSWORD
          demo users: alice, bob, carol, dave / $DEMO_PASSWORD
Mailpit:  http://localhost:${MAILPIT_PORT:-8025}  (invitation emails end up here)

Stop with tests/e2e/bin/teardown.sh
INFO
