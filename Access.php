<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Db;
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
        $sql = self::getSqlAccessSite('access, t2.idsite');
        $userRights = array_map(static function (array $row): array {
            return [
                'idsite' => Rows::int($row, 'idsite'),
                'access' => Rows::string($row, 'access'),
            ];
        }, Rows::list(Db::fetchAll($sql, [$login])));

        $model = new Model();
        $groupRights = $model->getPermissionsOfUser($login);

        if (!$userRights) {
            return $groupRights;
        }

        if (!$groupRights) {
            return $userRights;
        }

        $rights = [];
        foreach ($userRights as $userRight) {

            if (!isset($rights[$userRight['idsite']])) {
                $rights[$userRight['idsite']] = $userRight['access'];

                continue;
            }

            $rights[$userRight['idsite']] = $this->getHigherPermission($rights[$userRight['idsite']], $userRight['access']);
        }

        foreach ($groupRights as $groupRight) {

            if (!isset($rights[$groupRight['idsite']])) {
                $rights[$groupRight['idsite']] = $groupRight['access'];

                continue;
            }

            $rights[$groupRight['idsite']] = $this->getHigherPermission($rights[$groupRight['idsite']], $groupRight['access']);
        }

        $sites = [];
        foreach ($rights as $idsite => $access) {
            $sites[] = [
                'idsite' => $idsite,
                'access' => $access,
            ];
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
}
