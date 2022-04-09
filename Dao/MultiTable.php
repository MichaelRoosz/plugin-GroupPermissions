<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */
namespace Piwik\Plugins\GroupPermissions\Dao;

use Piwik\Common;
use Piwik\Db;

class MultiTable
{
    private $tablePrefixedGroupPermission = '';
    private $tablePrefixedGroupUser = '';

    public function __construct()
    {
        $this->tablePrefixedGroupPermission = Common::prefixTable(GroupPermission::TABLE);
        $this->tablePrefixedGroupUser = Common::prefixTable(GroupUser::TABLE);
    }

    private function getDb()
    {
        return Db::get();
    }

    public function getPermissionsOfUser($login)
    {
        $tablePermission = $this->tablePrefixedGroupPermission;
        $tableUser = $this->tablePrefixedGroupUser;
        $sql = "SELECT ga.idsite, ga.access FROM $tablePermission as ga 
                INNER JOIN $tableUser AS gu 
                ON ga.idgroup = gu.idgroup 
                WHERE gu.login = ?";
        
        return $this->getDb()->fetchAll($sql, array($login));
    }    
}
