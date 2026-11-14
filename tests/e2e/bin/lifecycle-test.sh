#!/usr/bin/env bash
# Tests the plugin lifecycle on the running test instance (started by setup.sh / run.sh / start.sh):
#   deactivate -> group permissions no longer apply, data is kept
#   activate   -> group permissions apply again
#   uninstall  -> plugin tables are dropped
#   reinstall  -> empty tables, everything works again
# Destructive for the plugin data of the instance; run.sh runs it after the Playwright specs.
set -euo pipefail

cd "$(dirname "$0")/.."

SUPERUSER_LOGIN=${SUPERUSER_LOGIN:-superuser}
SUPERUSER_PASSWORD=${SUPERUSER_PASSWORD:-superUserPass1!}

compose() { docker compose "$@"; }
mexec() { compose exec -T -u www-data matomo "$@"; }
sql() { compose exec -T db mariadb -umatomo -pmatomo matomo -N -e "$1"; }

failures=0
check() { # check <description> <expected> <actual>
    if [ "$2" = "$3" ]; then
        echo "  ok   $1"
    else
        echo "  FAIL $1: expected '$2', got '$3'"
        failures=$((failures + 1))
    fi
}

# api <method> [curl args...]: POST to the HTTP API from inside the Matomo container
api() {
    local method=$1; shift
    mexec curl -sS -X POST "http://localhost/index.php?module=API&format=json&method=$method" "$@"
}
token_for() {
    api UsersManager.createAppSpecificTokenAuth --data-urlencode "userLogin=$1" \
        --data-urlencode "passwordConfirmation=$2" --data-urlencode "description=lifecycle $(date +%s%N)" \
        | sed -E 's/.*"value":"([^"]+)".*/\1/'
}

run_id=$(date +%s)
su_token=$(token_for "$SUPERUSER_LOGIN" "$SUPERUSER_PASSWORD")
su() { api "$1" --data-urlencode "token_auth=$su_token" "${@:2}"; }

echo "==> Preparing a group with one member and view access to a new website"
id_site=$(su SitesManager.addSite --data-urlencode "siteName=Lifecycle $run_id" --data-urlencode "urls=https://lifecycle-$run_id.example.org" \
    | sed -E 's/.*"value":([0-9]+).*/\1/')
member="lifecycle_$run_id"
su UsersManager.addUser --data-urlencode "userLogin=$member" --data-urlencode "password=lifecyclePass1!" \
    --data-urlencode "email=$member@example.org" --data-urlencode "passwordConfirmation=$SUPERUSER_PASSWORD" >/dev/null
group="Lifecycle $run_id"
id_group=$(su GroupPermissions.createGroup --data-urlencode "groupName=$group" | sed -E 's/.*"idGroup":([0-9]+).*/\1/')
su GroupPermissions.addUserToGroup --data-urlencode "idGroup=$id_group" --data-urlencode "login=$member" >/dev/null
su GroupPermissions.setGroupAccess --data-urlencode "name=$group" --data-urlencode "access=view" --data-urlencode "idSites=$id_site" >/dev/null

member_token=$(token_for "$member" "lifecyclePass1!")
member_sites() {
    api SitesManager.getSitesIdWithAtLeastViewAccess --data-urlencode "token_auth=$member_token" | tr -d '[]" '
}
check "member sees the website through the group" "$id_site" "$(member_sites)"

echo "==> An anonymous membership (e.g. from an older plugin version) grants no access"
sql "INSERT INTO matomo_gpermissions_user (idgroup, login) VALUES ($id_group, 'anonymous')"
su GroupPermissions.setGroupAccess --data-urlencode "name=$group" --data-urlencode "access=admin" --data-urlencode "idSites=$id_site" >/dev/null
check "anonymous gets no access from groups" "" "$(api SitesManager.getSitesIdWithAtLeastViewAccess | tr -d '[]" ')"
sql "DELETE FROM matomo_gpermissions_user WHERE login = 'anonymous'"
su GroupPermissions.setGroupAccess --data-urlencode "name=$group" --data-urlencode "access=view" --data-urlencode "idSites=$id_site" >/dev/null

echo "==> Deactivating the plugin"
mexec ./console plugin:deactivate GroupPermissions >/dev/null
check "group access no longer applies" "" "$(member_sites)"
check "plugin API is gone" "1" "$(su GroupPermissions.getAllGroups | grep -c 'is not enabled' || true)"
check "group data is kept" "1" "$(sql "SELECT COUNT(*) FROM matomo_gpermissions_group WHERE name = '$group'")"

echo "==> Activating the plugin again"
mexec ./console plugin:activate GroupPermissions >/dev/null
check "group access applies again" "$id_site" "$(member_sites)"
check "group still has its member" "1" "$(su GroupPermissions.getMembersOfGroup --data-urlencode "idGroup=$id_group" | grep -c "\"$member\"")"

echo "==> Uninstalling the plugin"
tables_before=$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)
check "plugin tables exist while installed" "3" "$tables_before"
mexec ./console plugin:deactivate GroupPermissions >/dev/null
mexec ./console plugin:uninstall GroupPermissions >/dev/null
check "plugin tables are dropped" "0" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)"
check "member has no access" "" "$(member_sites)"

echo "==> Reinstalling the plugin"
./bin/setup.sh >/dev/null
check "plugin tables are created again" "3" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)"
su_token=$(token_for "$SUPERUSER_LOGIN" "$SUPERUSER_PASSWORD")
check "no groups after reinstall" "[]" "$(su GroupPermissions.getAllGroups)"
check "member has no access after reinstall" "" "$(member_sites)"
id_group=$(su GroupPermissions.createGroup --data-urlencode "groupName=$group" | sed -E 's/.*"idGroup":([0-9]+).*/\1/')
su GroupPermissions.addUserToGroup --data-urlencode "idGroup=$id_group" --data-urlencode "login=$member" >/dev/null
su GroupPermissions.setGroupAccess --data-urlencode "name=$group" --data-urlencode "access=view" --data-urlencode "idSites=$id_site" >/dev/null
check "groups work after reinstall" "$id_site" "$(member_sites)"

if [ "$failures" -gt 0 ]; then
    echo "==> $failures lifecycle check(s) failed" >&2
    exit 1
fi
echo "==> All lifecycle checks passed"
