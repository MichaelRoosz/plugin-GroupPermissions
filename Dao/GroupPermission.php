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
use Piwik\DbHelper;

class GroupPermission
{
    const TABLE = 'gpermissions_access';
    private $tablePrefixed = '';

    public function __construct()
    {
        $this->tablePrefixed = Common::prefixTable(self::TABLE);
    }

    private function getDb()
    {
        return Db::get();
    }

    public function install()
    {
        DbHelper::createTable(self::TABLE, "
                  `idgroup` int(10) UNSIGNED NOT NULL,
                  `idsite` int(10) UNSIGNED NOT NULL,
                  `access` VARCHAR(100) NOT NULL,
                  PRIMARY KEY(`idgroup`, `idsite`)");
    }

    public function uninstall()
    {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }
    
    public function createPermission($idGroup, $idSite, $access)
    {
        $db = $this->getDb();

        $query = 'INSERT INTO ' . $this->tablePrefixed
                . ' (idgroup,idsite,access) VALUES (?,?,?)'
                . ' ON DUPLICATE KEY UPDATE access=?';

        $db->query($query, array(
            $idGroup,
            $idSite,
            $access,
            $access
        ));
    }
    
    public function getPermissionsOfGroup($idGroup)
    {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT idsite, access FROM $table WHERE idgroup = ?", array($idGroup));
    }

    public function getPermissionsOfSite($idSite)
    {
        $idSite = intval($idSite);
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT idgroup, access FROM $table WHERE idsite = ?", array($idSite));
    }
    
    public function removePermission($idGroup, $idSite)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ? AND idSite = ?";
        $bind = array(intval($idGroup), intval($idSite));
        $this->getDb()->query($query, $bind);
    }

    public function removeAllPermissionsOfGroup($idGroup)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = array(intval($idGroup));
        $this->getDb()->query($query, $bind);
    }

    public function removeAllPermissionsForSite($idSite)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idSite = ?";
        $bind = array(intval($idSite));
        $this->getDb()->query($query, $bind);
    }
}
