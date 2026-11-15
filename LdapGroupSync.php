<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Container\StaticContainer;
use Piwik\Log\LoggerInterface;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\LoginLdap\Ldap\Client as LdapClient;
use Piwik\Plugins\LoginLdap\Ldap\ServerInfo;
use Piwik\Plugins\LoginLdap\LdapInterop\UserMapper;
use Piwik\Plugins\LoginLdap\Model\LdapUsers;

/**
 * Reads the LDAP groups of a user through the LoginLdap plugin (using its server configuration) after an
 * LDAP user logged in, and synchronizes the group memberships with them (see GroupSync).
 *
 * LoginLdap does not provide an event with the LDAP entry of the user, so the groups are read with a separate
 * LDAP query:
 * - the values of an attribute of the user entry (by default `memberOf`, requested explicitly so operational
 *   attributes like the OpenLDAP memberOf overlay work), and/or
 * - the DNs of the entries matching a group search filter, e.g. `(&(objectClass=groupOfNames)(member=?))`,
 *   where `?` is replaced by the (escaped) DN of the user.
 */
class LdapGroupSync {
    /** @var SystemSettings */
    private $settings;

    /** @var GroupSync */
    private $groupSync;

    public function __construct(SystemSettings $settings, GroupSync $groupSync) {
        $this->settings = $settings;
        $this->groupSync = $groupSync;
    }

    public static function isAvailable(): bool {
        return PluginManager::getInstance()->isPluginActivated('LoginLdap')
            && class_exists(LdapUsers::class)
            && class_exists(UserMapper::class);
    }

    public function isEnabled(): bool {
        return self::isAvailable() && $this->settings->isLdapGroupSyncEnabled();
    }

    /**
     * Synchronizes the groups of a user if LDAP group sync is enabled and the user is an LDAP user. Errors are
     * logged and never break the login; memberships are not changed when the LDAP groups could not be read.
     */
    public function syncUserAfterLogin(string $login): void {
        if (!$this->isEnabled() || $login === '' || $login === 'anonymous') {
            return;
        }

        try {
            if (!UserMapper::makeConfigured()->isUserLdapUser($login)) {
                return;
            }

            $externalGroups = $this->getLdapGroupsOfUser($login);
            if ($externalGroups === null) {
                $this->getLogger()->info(
                    'GroupPermissions: user {login} was not found in LDAP, groups are not synchronized',
                    ['login' => $login]
                );

                return;
            }

            $result = $this->groupSync->syncUser($login, $externalGroups);
            $this->getLogger()->debug(
                'GroupPermissions: synchronized LDAP groups of {login}: added to {added}, removed from {removed}',
                ['login' => $login, 'added' => implode(',', $result['added']), 'removed' => implode(',', $result['removed'])]
            );
        } catch (\Throwable $e) {
            $this->getLogger()->warning(
                'GroupPermissions: could not synchronize the LDAP groups of {login}: {message}',
                ['login' => $login, 'message' => $e->getMessage()]
            );
        }
    }

    /**
     * @return array<string>|null DNs / values of the groups of the user, null if the user was not found
     */
    public function getLdapGroupsOfUser(string $login): ?array {
        $attribute = strtolower($this->settings->getLdapGroupAttribute());
        $groupFilter = $this->settings->getLdapGroupFilter();
        $groupBaseDn = $this->settings->getLdapGroupBaseDn();

        $result = LdapUsers::makeConfigured()->doWithClient(
            static function (LdapUsers $ldapUsers, LdapClient $client, ServerInfo $server) use ($login, $attribute, $groupFilter, $groupBaseDn) {
                $ldapUsers->bindAsAdmin($client, $server);

                [$filter, $bind] = $ldapUsers->getUserEntryQuery($login);
                $entries = $client->fetchAll($server->getBaseDn(), $filter, $bind, $attribute !== '' ? [$attribute] : ['1.1']);
                if (!is_array($entries) || !isset($entries[0]) || !is_array($entries[0])) {
                    return null;
                }

                $userEntry = $entries[0];
                $groups = $attribute !== '' ? self::getValues($userEntry[$attribute] ?? []) : [];

                $userDn = is_string($userEntry['dn'] ?? null) ? $userEntry['dn'] : '';
                if ($groupFilter !== '' && $userDn !== '') {
                    $groupEntries = $client->fetchAll(
                        $groupBaseDn !== '' ? $groupBaseDn : $server->getBaseDn(),
                        $groupFilter,
                        array_fill(0, substr_count($groupFilter, '?'), $userDn),
                        ['cn']
                    );
                    foreach (is_array($groupEntries) ? $groupEntries : [] as $groupEntry) {
                        if (is_array($groupEntry) && is_string($groupEntry['dn'] ?? null)) {
                            $groups[] = $groupEntry['dn'];
                        }
                    }
                }

                return $groups;
            }
        );

        if (!is_array($result)) {
            return null;
        }

        return array_values(array_filter($result, 'is_string'));
    }

    /**
     * LoginLdap returns a single value as string and multiple values as array
     *
     * @param mixed $value
     *
     * @return array<string>
     */
    private static function getValues($value): array {
        if (is_string($value)) {
            return [$value];
        }
        if (!is_array($value)) {
            return [];
        }

        return array_values(array_filter($value, 'is_string'));
    }

    private function getLogger(): LoggerInterface {
        $logger = StaticContainer::get(LoggerInterface::class);
        if (!($logger instanceof LoggerInterface)) {
            throw new \Exception('LoggerInterface not available');
        }

        return $logger;
    }
}
