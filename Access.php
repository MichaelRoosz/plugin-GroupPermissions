<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access\RolesProvider;
use Piwik\Container\StaticContainer;
use Piwik\Log\LoggerInterface;
use Piwik\Plugins\GroupPermissions\Dao\Rows;

class Access extends \Piwik\Access {
    /**
     * @param string $login
     *
     * @return array<array{
     *   idsite: int,
     *   access: string
     * }>
     */
    public function getRawSitesWithSomeViewAccess($login) {
        // Matomo's own rows; empty for logins without a user row (e.g. a deleted user)
        $userRights = array_map(static function (array $row): array {
            return [
                'idsite' => Rows::int($row, 'idsite'),
                'access' => Rows::string($row, 'access'),
            ];
        }, Rows::list(parent::getRawSitesWithSomeViewAccess($login)));

        // groups never grant access to the anonymous user (core only allows "view" for anonymous, a group could
        // grant "admin" to every visitor)
        if (strcasecmp((string) $login, 'anonymous') === 0) {
            return $userRights;
        }

        try {
            $model = new Model();
            // like Matomo, nothing for logins without a user row: memberships left behind by a deleted user never
            // grant access (only checked when there are no direct rows, which already imply an existing user)
            if (!$userRights && $model->getUserLogin((string) $login) === null) {
                return [];
            }
            $groupRights = $model->getPermissionsOfUser($login);
            if (!$groupRights) {
                return $userRights;
            }
            $groupCapabilities = $model->getCapabilitiesOfUser($login);
        } catch (\Throwable $e) {
            // e.g. while the database update of this plugin is still pending (missing tables or columns): fall back
            // to the access granted directly, never more
            $logger = StaticContainer::get(LoggerInterface::class);
            if ($logger instanceof LoggerInterface) {
                $logger->warning(
                    'GroupPermissions: could not load the group permissions of {login}, only direct access applies: {message}',
                    ['login' => $login, 'message' => $e->getMessage()]
                );
            }

            return $userRights;
        }

        // the access table contains roles (view, write, admin) and capabilities (e.g. tagmanager_write), each
        // as a separate row. Combine them: per website the highest role wins, capabilities are added up.
        $roles = [];
        $capabilities = [];
        foreach ($userRights as $userRight) {
            $idSite = $userRight['idsite'];
            if ($this->isRole($userRight['access'])) {
                $roles[$idSite] = isset($roles[$idSite])
                    ? $this->getHigherPermission($roles[$idSite], $userRight['access'])
                    : $userRight['access'];
            } else {
                $capabilities[$idSite][$userRight['access']] = true;
            }
        }

        foreach ($groupRights as $groupRight) {
            $idSite = $groupRight['idsite'];
            $roles[$idSite] = isset($roles[$idSite])
                ? $this->getHigherPermission($roles[$idSite], $groupRight['access'])
                : $groupRight['access'];
        }

        foreach ($groupCapabilities as $groupCapability) {
            $capabilities[$groupCapability['idsite']][$groupCapability['capability']] = true;
        }

        $sites = [];
        foreach ($roles as $idSite => $access) {
            $sites[] = [
                'idsite' => $idSite,
                'access' => $access,
            ];
        }

        // like in Matomo core, a capability only applies to websites the user has a role for
        foreach ($capabilities as $idSite => $siteCapabilities) {
            if (!isset($roles[$idSite])) {
                continue;
            }
            foreach (array_keys($siteCapabilities) as $capability) {
                $sites[] = [
                    'idsite' => $idSite,
                    'access' => (string) $capability,
                ];
            }
        }

        return $sites;
    }

    public function getHigherPermission(string $permission1, string $permission2): string {
        if ($permission1 === 'admin' || $permission2 === 'admin') {
            return 'admin';
        } elseif ($permission1 === 'write' || $permission2 === 'write') {
            return 'write';
        } elseif ($permission1 === 'view' || $permission2 === 'view') {
            return 'view';
        } else {
            return '';
        }
    }

    private function isRole(string $access): bool {
        $roleProvider = StaticContainer::get(RolesProvider::class);
        if ($roleProvider instanceof RolesProvider) {
            return $roleProvider->isValidRole($access);
        }

        return in_array($access, ['view', 'write', 'admin'], true);
    }
}
