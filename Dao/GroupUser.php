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

class GroupUser
{
    const TABLE = 'gpermissions_user';
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
                  `login` VARCHAR(100) NOT NULL,
                  PRIMARY KEY(`idgroup`, `login`)");
    }

    public function uninstall()
    {
        Db::query(sprintf('DROP TABLE IF EXISTS `%s`', $this->tablePrefixed));
    }

    public function addUserToGroup($idGroup, $login)
    {
        $db = $this->getDb();
        $db->insert($this->tablePrefixed, array(
            'idgroup' => $idGroup,
            'login' => $login
        ));
    }
    
    public function getMembersOfGroup($idGroup)
    {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT login FROM $table WHERE idgroup = ?", array($idGroup));
    }

    public function isUserInGroup($login, $idGroup)
    {
        $idGroup = intval($idGroup);
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT login FROM $table WHERE login = ? AND idgroup = ?", array($login, $idGroup));
    }

    public function getGroupsOfUser($login)
    {
        $table = $this->tablePrefixed;
        return $this->getDb()->fetchAll("SELECT idgroup FROM $table WHERE login = ?", array($login));
    }
    
    public function removeUserFromGroup($idGroup, $login)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ? AND login = ?";
        $bind = array(intval($idGroup), $login);
        $this->getDb()->query($query, $bind);
    }

    public function removeAllUsersOfGroup($idGroup)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE idgroup = ?";
        $bind = array(intval($idGroup));
        $this->getDb()->query($query, $bind);
    }

    public function removeUserFromAllGroups($login)
    {
        $table = $this->tablePrefixed;
        $query = "DELETE FROM $table WHERE login = ?";
        $bind = array($login);
        $this->getDb()->query($query, $bind);
    }
}
