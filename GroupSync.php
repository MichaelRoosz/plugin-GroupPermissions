<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

/**
 * Synchronizes the group memberships of a user with the groups of an external directory (LDAP, SAML IdP, ...).
 *
 * Groups can be mapped to external group names (see API::addExternalGroupMapping). The sync makes the user a
 * member of every group mapped to one of their external groups and removes them from groups they were added to
 * by an earlier sync but are no longer entitled to. Memberships added manually are never removed.
 *
 * External group names are compared case-insensitively. A mapped plain name like `Matomo Admins` also matches
 * distinguished names whose first component has this value (e.g. `CN=Matomo Admins,OU=Groups,DC=example,DC=com`).
 * A mapped DN only matches that DN: it pins the group to one location in the directory, so a plain name (e.g. sent
 * by an identity provider where users can name their own groups) never matches it.
 *
 * Callers are responsible for access checks.
 */
class GroupSync {
    /** @var Model */
    private $model;

    public function __construct(Model $model) {
        $this->model = $model;
    }

    /**
     * @param array<mixed> $externalGroups names or DNs of the external groups of the user
     *
     * @return array{added: array<int>, removed: array<int>} IDs of the groups the user was added to / removed from
     */
    public function syncUser(string $login, array $externalGroups): array {
        $result = ['added' => [], 'removed' => []];

        // memberships are stored with the login of the user table (e.g. `bob` when logging in as `BOB`); users
        // that do not exist get no memberships, and groups never apply to the anonymous user
        $login = $this->model->getUserLogin($login);
        if ($login === null || strcasecmp($login, 'anonymous') === 0) {
            return $result;
        }

        $targetGroups = $this->getMatchingGroups($externalGroups);
        $memberships = $this->model->getMembershipsOfUser($login);

        foreach ($targetGroups as $idGroup) {
            if (!array_key_exists($idGroup, $memberships)) {
                $result['added'][] = $idGroup;
            }
        }
        foreach ($memberships as $idGroup => $synced) {
            if ($synced && !in_array($idGroup, $targetGroups, true)) {
                $result['removed'][] = $idGroup;
            }
        }

        if (!$result['added'] && !$result['removed']) {
            return $result;
        }

        $apply = function () use ($login, $result): void {
            foreach ($result['added'] as $idGroup) {
                $this->model->addUserToGroup($idGroup, $login, true);
            }
            foreach ($result['removed'] as $idGroup) {
                $this->model->removeUserFromGroup($idGroup, $login);
            }

            GroupAccessUpdater::reloadAccess();
        };

        if ($result['removed']) {
            SiteAccessLoss::notifyAfter([$login], $apply);
        } else {
            $apply();
        }

        return $result;
    }

    /**
     * @param array<mixed> $externalGroups
     *
     * @return array<int> IDs of the groups mapped to one of the external groups
     */
    public function getMatchingGroups(array $externalGroups): array {
        $names = [];
        foreach ($externalGroups as $externalGroup) {
            if (is_string($externalGroup) && self::normalize($externalGroup) !== '') {
                $names[] = $externalGroup;
            }
        }

        if (!$names) {
            return [];
        }

        $idGroups = [];
        foreach ($this->model->getAllExternalGroupMappings() as $mapping) {
            foreach ($names as $name) {
                if (self::matches($mapping['external_group'], $name)) {
                    $idGroups[$mapping['idgroup']] = $mapping['idgroup'];

                    break;
                }
            }
        }

        return array_values($idGroups);
    }

    /**
     * Whether a mapped external group matches a group of the user: names are compared case-insensitively, and a
     * mapped plain name also matches a DN of the user whose first component has this value (e.g. the mapping
     * `Matomo Admins` matches `CN=Matomo Admins,OU=Groups,DC=example,DC=com`). A mapped DN only matches the same
     * DN (spaces around separators are ignored), never a plain name or a DN in another location, so
     * `CN=Admins,OU=Team A,...` matches neither `Admins` nor `CN=Admins,OU=Team B,...`.
     */
    public static function matches(string $mappedGroup, string $userGroup): bool {
        $mapped = self::normalize($mappedGroup);
        $user = self::normalize($userGroup);
        if ($mapped === '' || $user === '') {
            return false;
        }
        if ($mapped === $user) {
            return true;
        }

        $mappedFirstValue = self::getFirstValueOfDn($mapped);
        $userFirstValue = self::getFirstValueOfDn($user);
        if ($mappedFirstValue !== null && $userFirstValue !== null) {
            // spaces around the separators are not significant in DNs
            return self::compactDn($mapped) === self::compactDn($user);
        }
        if ($mappedFirstValue !== null) {
            // a mapped DN pins the group to one location in the directory
            return false;
        }
        if ($userFirstValue !== null) {
            return $userFirstValue === $mapped;
        }

        return false;
    }

    public static function normalize(string $name): string {
        return mb_strtolower(trim($name));
    }

    /**
     * Whether two mapped external groups are the same mapping: compared case-insensitively, and DNs also without the
     * spaces around their separators (like in matches), so `CN=A, OU=B` and `cn=a,ou=b` are one mapping. A DN and
     * the plain name of its first value are different mappings (a plain name matches DNs in any location).
     */
    public static function isSameMapping(string $group1, string $group2): bool {
        $name1 = self::normalize($group1);
        $name2 = self::normalize($group2);
        if ($name1 === $name2) {
            return true;
        }

        return self::getFirstValueOfDn($name1) !== null
            && self::getFirstValueOfDn($name2) !== null
            && self::compactDn($name1) === self::compactDn($name2);
    }

    private static function compactDn(string $dn): string {
        return (string) preg_replace('/\\s*([,=+])\\s*/u', '$1', $dn);
    }

    /**
     * The value of the first component of a distinguished name with at least two components (e.g.
     * `matomo admins` for `cn=matomo admins,ou=groups,dc=example,dc=com`), null for other names
     */
    private static function getFirstValueOfDn(string $name): ?string {
        // commas within values are escaped as "\," or "\2c"
        if (!preg_match('/^[a-z][a-z0-9-]*\s*=\s*((?:[^,\\\\]|\\\\.)+?)\s*,\s*[a-z][a-z0-9-]*\s*=/u', $name, $matches)) {
            return null;
        }

        // lowercased again after decoding: escapes like `\41` (`A`) or `\c3\89` (`É`) can decode to uppercase
        $firstValue = trim(mb_strtolower((string) preg_replace_callback('/\\\\([0-9a-f]{2}|.)/u', static function (array $m): string {
            return strlen($m[1]) === 2 && ctype_xdigit($m[1]) ? pack('H2', $m[1]) : $m[1];
        }, $matches[1])));

        return $firstValue !== '' ? $firstValue : null;
    }
}
