#!/usr/bin/env bash
# Integration tests of the group sync with the login plugins LoginLdap, LoginOIDC, RebelOIDC and LoginSaml: starts
# an LDAP server, a mock OpenID Connect provider and a SAML identity provider, installs and configures the plugins
# in the running Matomo, runs specs-integrations/ and removes the plugins again (they change how users log in).
#
# LoginSaml is a paid plugin and cannot be downloaded: its specs only run when a (licensed) copy for Matomo 5 is
# found in LOGINSAML_DIR (default: tmp/5.5.11/LoginSaml in the repository, which git ignores).
# Run by bin/run.sh after a full run; needs a Matomo set up by bin/setup.sh. Extra arguments go to `playwright test`.
set -euo pipefail

cd "$(dirname "$0")/.."

# pinned releases of the login plugins
LOGINLDAP_REPO=matomo-org/plugin-LoginLdap
LOGINLDAP_TAG=${LOGINLDAP_TAG:-6.0.6}
LOGINOIDC_REPO=dominik-th/matomo-plugin-LoginOIDC
LOGINOIDC_TAG=${LOGINOIDC_TAG:-5.0.0}
REBELOIDC_REPO=Digitalist-Open-Cloud/Matomo-Plugin-RebelOIDC
REBELOIDC_TAG=${REBELOIDC_TAG:-5.1.6}
LOGINSAML_DIR=${LOGINSAML_DIR:-../../tmp/5.5.11/LoginSaml}
saml=0
if [ -f "$LOGINSAML_DIR/plugin.json" ]; then
    saml=1
else
    echo "==> No LoginSaml copy in $LOGINSAML_DIR, skipping the SAML specs"
fi

compose() { docker compose "$@"; }
mexec() { compose exec -T -u www-data matomo "$@"; }
sql() { compose exec -T db mariadb -umatomo -pmatomo matomo -N -e "$1"; }

# sets a system setting of a plugin (stored like Matomo's settings API does)
plugin_setting() {
    local plugin=$1 name=$2 value=$3
    sql "DELETE FROM matomo_plugin_setting WHERE plugin_name = '$plugin' AND setting_name = '$name' AND user_login = '';
         INSERT INTO matomo_plugin_setting (plugin_name, setting_name, setting_value, json_encoded, user_login)
         VALUES ('$plugin', '$name', '$value', 0, '')"
}

remove_plugins() {
    for plugin in LoginLdap LoginOIDC RebelOIDC LoginSaml; do
        mexec ./console plugin:deactivate "$plugin" >/dev/null 2>&1 || true
    done
    compose exec -T matomo rm -rf /var/www/html/plugins/LoginLdap /var/www/html/plugins/LoginOIDC \
        /var/www/html/plugins/RebelOIDC /var/www/html/plugins/LoginSaml
    mexec ./console config:delete --section=LoginLdap >/dev/null 2>&1 || true
    mexec ./console config:delete --section=LoginSaml >/dev/null 2>&1 || true
    mexec ./console cache:clear >/dev/null
}

echo "==> Starting the LDAP server and the OpenID Connect / SAML identity providers"
compose --profile integrations up -d ldap oidc saml

echo "==> Installing LoginLdap $LOGINLDAP_TAG, LoginOIDC $LOGINOIDC_TAG and RebelOIDC $REBELOIDC_TAG"
compose exec -T matomo bash -s -- "$LOGINLDAP_REPO" "$LOGINLDAP_TAG" "$LOGINOIDC_REPO" "$LOGINOIDC_TAG" \
    "$REBELOIDC_REPO" "$REBELOIDC_TAG" <<'INSTALL'
set -euo pipefail
install() {
    local name=$1 repo=$2 tag=$3 dest=/var/www/html/plugins/$1
    rm -rf "$dest" && mkdir -p "$dest"
    curl -fsSL "https://codeload.github.com/$repo/tar.gz/refs/tags/$tag" | tar -xz --strip-components=1 -C "$dest"
    chown -R www-data:www-data "$dest"
}
install LoginLdap "$1" "$2"
install LoginOIDC "$3" "$4"
install RebelOIDC "$5" "$6"
# neither OIDC plugin has a release for Matomo 6 yet: allow their Matomo 5 releases, the tests only need their login
# flow (callback action and ID token in the session), which this plugin integrates with
sed -i 's/<6\.0\.0-b1/<7.0.0-b1/' /var/www/html/plugins/LoginOIDC/plugin.json /var/www/html/plugins/RebelOIDC/plugin.json
INSTALL
trap remove_plugins EXIT

if [ "$saml" = 1 ]; then
    echo "==> Installing LoginSaml from $LOGINSAML_DIR"
    compose exec -T matomo rm -rf /var/www/html/plugins/LoginSaml
    compose cp "$LOGINSAML_DIR" matomo:/var/www/html/plugins/LoginSaml
    compose exec -T matomo bash -c 'find /var/www/html/plugins/LoginSaml -name "*:Zone.Identifier" -delete;
        chown -R www-data:www-data /var/www/html/plugins/LoginSaml'
fi

echo "==> Adding LDAP users and groups"
for _ in $(seq 1 60); do
    if compose exec -T ldap ldapsearch -x -H ldap://localhost -b dc=example,dc=org -D cn=admin,dc=example,dc=org -w admin \
        -s base >/dev/null 2>&1; then break; fi
    sleep 1
done
compose exec -T ldap ldapadd -c -x -H ldap://localhost -D cn=admin,dc=example,dc=org -w admin >/dev/null <<'LDIF' || true
dn: ou=people,dc=example,dc=org
objectClass: organizationalUnit
ou: people

dn: ou=groups,dc=example,dc=org
objectClass: organizationalUnit
ou: groups

dn: uid=ldapalice,ou=people,dc=example,dc=org
objectClass: inetOrgPerson
uid: ldapalice
cn: Alice LDAP
sn: LDAP
mail: ldapalice@example.org
userPassword: ldapPass1!

dn: uid=ldapbob,ou=people,dc=example,dc=org
objectClass: inetOrgPerson
uid: ldapbob
cn: Bob LDAP
sn: LDAP
mail: ldapbob@example.org
userPassword: ldapPass1!

dn: cn=Matomo Admins,ou=groups,dc=example,dc=org
objectClass: groupOfUniqueNames
cn: Matomo Admins
uniqueMember: uid=ldapalice,ou=people,dc=example,dc=org

dn: cn=Matomo Editors,ou=groups,dc=example,dc=org
objectClass: groupOfUniqueNames
cn: Matomo Editors
uniqueMember: uid=ldapalice,ou=people,dc=example,dc=org
uniqueMember: uid=ldapbob,ou=people,dc=example,dc=org
LDIF

echo "==> Configuring the plugins"
for plugin in LoginLdap LoginOIDC RebelOIDC; do
    mexec ./console plugin:activate "$plugin" >/dev/null
done
mexec ./console config:set --section=LoginLdap --key=serverUrl --value=ldap://ldap
mexec ./console config:set --section=LoginLdap --key=ldapPort --value=389
mexec ./console config:set --section=LoginLdap --key=baseDn --value=dc=example,dc=org
mexec ./console config:set --section=LoginLdap --key=adminUser --value=cn=admin,dc=example,dc=org
mexec ./console config:set --section=LoginLdap --key=adminPass --value=admin
mexec ./console config:set --section=LoginLdap --key=ldap_user_filter --value='(objectClass=inetOrgPerson)'
mexec ./console config:set --section=LoginLdap --key=enable_password_confirmation --value=0

for plugin in LoginOIDC RebelOIDC; do
    plugin_setting "$plugin" authorizeUrl http://oidc:8080/default/authorize
    plugin_setting "$plugin" tokenUrl http://oidc:8080/default/token
    plugin_setting "$plugin" clientId matomo
    plugin_setting "$plugin" clientSecret secret
    plugin_setting "$plugin" scope 'openid email profile'
    plugin_setting "$plugin" allowSignup 1
    plugin_setting "$plugin" authenticationName "$plugin login"
done
plugin_setting LoginOIDC userinfoUrl http://oidc:8080/default/userinfo
plugin_setting LoginOIDC userinfoId sub
plugin_setting RebelOIDC userInfoUrl http://oidc:8080/default/userinfo
plugin_setting RebelOIDC userInfoId sub

if [ "$saml" = 1 ]; then
    mexec ./console plugin:activate LoginSaml >/dev/null
    idp_cert=$(compose exec -T saml grep -v CERTIFICATE /var/www/simplesamlphp/cert/server.crt | tr -d '\r\n')
    saml_option() { mexec ./console config:set --section=LoginSaml --key="$1" --value="$2" >/dev/null; }
    saml_option status 1
    saml_option idp_entityid http://saml:8080/simplesaml/saml2/idp/metadata.php
    saml_option idp_sso http://saml:8080/simplesaml/saml2/idp/SSOService.php
    saml_option idp_x509cert "$idp_cert"
    saml_option advanced_spentityid matomo-e2e
    saml_option options_autocreate 1
    saml_option options_identify_field email
    saml_option attributemapping_username uid
    saml_option attributemapping_email email
    saml_option enable_password_confirmation 0
fi
mexec ./console cache:clear >/dev/null

echo "==> Running the integration specs"
docker compose --profile test run --rm -e HOST_UID="$(id -u)" -e HOST_GID="$(id -g)" -e LOGINSAML="$saml" playwright \
    bash -c 'npm ci --no-audit --no-fund --loglevel=error && npx playwright test --config playwright.integrations.config.ts "$@"; status=$?
             chown -R "$HOST_UID:$HOST_GID" screenshots test-results-integrations playwright-report-integrations .auth 2>/dev/null
             exit $status' -- "$@"
