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

class Group
{
    const TABLE = 'gpermissions_group';
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
                  `idgroup` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
                  `name` VARCHAR(64) NOT NULL DEFAULT '',
                  PRIMARY KEY(`idgroup`)");
    }

    public function uninstall()
    {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }
    
    public function createGroup($name)
    {
        $db = $this->getDb();
        $db->insert($this->tablePrefixed, array(
            'name' => $name
        ));

        return $db->lastInsertId();
    }
    
    public function getAllGroups()
    {
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT * FROM $table");
    }

    public function getGroupWithId($idGroup)
    {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchRow("SELECT * FROM $table WHERE idgroup = ?", array($idGroup));
    }
    
    public function getGroupWithName($name)
    {
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchRow("SELECT * FROM $table WHERE name = ?", array($name));
    }

    public function renameGroup($idGroup, $newName)
    {
        $idGroup = intval($idGroup);

        $db = $this->getDb();
        $db->update($this->tablePrefixed, array(
            'name' => $newName
        ), "idgroup = $idGroup");
    }
    
    public function deleteGroup($idGroup)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = array(intval($idGroup));
        $this->getDb()->query($query, $bind);   
    }
}
