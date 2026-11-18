#!/usr/bin/env bash
# Tests the plugin lifecycle on the running test instance (started by setup.sh / run.sh / start.sh):
#   deactivate -> group permissions no longer apply, data is kept
#   activate   -> group permissions apply again
#   update     -> updating from 5.2.1 creates the capability, automatic access, segment and external group tables
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

echo "==> Preparing a website and users that are deleted while the plugin is deactivated"
gone_site=$(su SitesManager.addSite --data-urlencode "siteName=Lifecycle gone $run_id" --data-urlencode "urls=https://gone-$run_id.example.org" \
    | sed -E 's/.*"value":([0-9]+).*/\1/')
su GroupPermissions.setGroupAccess --data-urlencode "name=$group" --data-urlencode "access=view" --data-urlencode "idSites=$gone_site" >/dev/null
gone_member="lifecycle_gone_$run_id"
reborn_member="lifecycle_reborn_$run_id"
for login in "$gone_member" "$reborn_member"; do
    su UsersManager.addUser --data-urlencode "userLogin=$login" --data-urlencode "password=lifecyclePass1!" \
        --data-urlencode "email=$login@example.org" --data-urlencode "passwordConfirmation=$SUPERUSER_PASSWORD" >/dev/null
    su GroupPermissions.addUserToGroup --data-urlencode "idGroup=$id_group" --data-urlencode "login=$login" >/dev/null
done
check "member sees both websites through the group" "$id_site,$gone_site" "$(member_sites)"

echo "==> Deactivating the plugin"
mexec ./console plugin:deactivate GroupPermissions >/dev/null
check "group access no longer applies" "" "$(member_sites)"
check "plugin API is gone" "1" "$(su GroupPermissions.getAllGroups | grep -c 'is not enabled' || true)"
check "group data is kept" "1" "$(sql "SELECT COUNT(*) FROM matomo_gpermissions_group WHERE name = '$group'")"
su SitesManager.deleteSite --data-urlencode "idSite=$gone_site" --data-urlencode "passwordConfirmation=$SUPERUSER_PASSWORD" >/dev/null
for login in "$gone_member" "$reborn_member"; do
    su UsersManager.deleteUser --data-urlencode "userLogin=$login" --data-urlencode "passwordConfirmation=$SUPERUSER_PASSWORD" >/dev/null
done
check "group access to the deleted website is left behind" "1" "$(sql "SELECT COUNT(*) FROM matomo_gpermissions_access WHERE idsite = $gone_site")"

echo "==> Activating the plugin again"
mexec ./console plugin:activate GroupPermissions >/dev/null
check "group access applies again" "$id_site" "$(member_sites)"
check "the overview does not count the deleted website" "1" "$(su GroupPermissions.getGroupsOverview --data-urlencode "filter_limit=-1" \
    | grep -cE "\"idGroup\":$id_group,\"name\":\"[^\"]*\",\"memberCount\":[0-9]+,\"siteCount\":1}" || true)"
check "group still has its member" "1" "$(su GroupPermissions.getMembersOfGroup --data-urlencode "idGroup=$id_group" | grep -c "\"$member\"")"
check "membership of a deleted user can be removed" "1" "$(su GroupPermissions.removeUserFromGroup --data-urlencode "idGroup=$id_group" \
    --data-urlencode "login=$gone_member" | grep -c '"success"' || true)"
check "membership of the deleted user is gone" "0" "$(sql "SELECT COUNT(*) FROM matomo_gpermissions_user WHERE login = '$gone_member'")"
su UsersManager.addUser --data-urlencode "userLogin=$reborn_member" --data-urlencode "password=lifecyclePass1!" \
    --data-urlencode "email=$reborn_member@example.org" --data-urlencode "passwordConfirmation=$SUPERUSER_PASSWORD" >/dev/null
check "a new user with the login of a deleted member is in no group" "0" "$(sql "SELECT COUNT(*) FROM matomo_gpermissions_user WHERE login = '$reborn_member'")"

echo "==> Creating a website without the automatic access table (e.g. update not run yet) does not fail"
sql "DROP TABLE matomo_gpermissions_autoaccess"
check "website is created" "1" "$(su SitesManager.addSite --data-urlencode "siteName=Lifecycle no table $run_id" \
    --data-urlencode "urls=https://no-table-$run_id.example.org" | grep -cE '"value":[0-9]+' || true)"

echo "==> Updating from version 5.2.1 (without the capability, automatic access, segment and external group tables and the synced column)"
sql "DROP TABLE matomo_gpermissions_capability"
sql "DROP TABLE matomo_gpermissions_segment"
sql "DROP TABLE matomo_gpermissions_external"
sql "ALTER TABLE matomo_gpermissions_user DROP COLUMN synced"
sql "UPDATE matomo_option SET option_value = '5.2.1' WHERE option_name = 'version_GroupPermissions'"
mexec ./console core:update --yes >/dev/null
check "capability table is created" "1" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_capability'" | wc -l)"
check "automatic access table is created" "1" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_autoaccess'" | wc -l)"
check "segment table is created" "1" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_segment'" | wc -l)"
check "external group table is created" "1" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_external'" | wc -l)"
check "existing memberships are not marked as synced" "0" "$(sql "SELECT synced FROM matomo_gpermissions_user WHERE login = '$member'")"
check "plugin version is updated" "5.3.0" "$(sql "SELECT option_value FROM matomo_option WHERE option_name = 'version_GroupPermissions'")"
check "group access still applies after the update" "$id_site" "$(member_sites)"

echo "==> Uninstalling the plugin"
tables_before=$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)
check "plugin tables exist while installed" "7" "$tables_before"
mexec ./console plugin:deactivate GroupPermissions >/dev/null
mexec ./console plugin:uninstall GroupPermissions >/dev/null
check "plugin tables are dropped" "0" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)"
check "member has no access" "" "$(member_sites)"

echo "==> Reinstalling the plugin"
./bin/setup.sh >/dev/null
check "plugin tables are created again" "7" "$(sql "SHOW TABLES LIKE 'matomo\\_gpermissions\\_%'" | wc -l)"
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
