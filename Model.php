<?php
/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */
namespace Piwik\Plugins\GroupPermissions;

use Piwik\Plugins\GroupPermissions\Dao\Group;
use Piwik\Plugins\GroupPermissions\Dao\GroupPermission;
use Piwik\Plugins\GroupPermissions\Dao\GroupUser;
use Piwik\Plugins\GroupPermissions\Dao\MultiTable;

class Model
{
    public function install()
    {
        $group = new Group();
        $group->install();

        $permission = new GroupPermission();
        $permission->install();
        
        $user = new GroupUser();
        $user->install();
    }

    public function uninstall()
    {
        $group = new Group();
        $group->uninstall();

        $permission = new GroupPermission();
        $permission->uninstall();
        
        $user = new GroupUser();
        $user->uninstall();
    }
    
    // Group
    public function createGroup($name)
    {
        $group = new Group();
        return $group->createGroup($name);
    }
    
    public function getAllGroups()
    {
        $group = new Group();
        return $group->getAllGroups();
    }

    public function getGroupWithId($idGroup)
    {
        $group = new Group();
        return $group->getGroupWithId($idGroup);
    }
    
    public function getGroupWithName($name)
    {
        $group = new Group();
        return $group->getGroupWithName($name);
    }

    public function renameGroup($idGroup, $newName)
    {
        $group = new Group();
        return $group->renameGroup($idGroup, $newName);
    }
    
    public function deleteGroup($idGroup)
    {
        $group = new Group();
        return $group->deleteGroup($idGroup);
    }
    
    // GroupUser
    public function addUserToGroup($idGroup, $login)
    {
        $user = new GroupUser();
        return $user->addUserToGroup($idGroup, $login);
    }
    
    public function getMembersOfGroup($idGroup)
    {
        $user = new GroupUser();
        return $user->getMembersOfGroup($idGroup);
    }
    
    public function isUserInGroup($login, $idGroup)
    {
        $user = new GroupUser();
        return $user->isUserInGroup($login, $idGroup);
    }

    public function getGroupsOfUser($login)
    {
        $user = new GroupUser();
        return $user->getGroupsOfUser($login);
    }
    
    public function removeUserFromGroup($idGroup, $login)
    {
        $user = new GroupUser();
        return $user->removeUserFromGroup($idGroup, $login);
    }

    public function removeAllUsersOfGroup($idGroup)
    {
        $user = new GroupUser();
        return $user->removeAllUsersOfGroup($idGroup);
    }

    public function removeUserFromAllGroups($login)
    {
        $user = new GroupUser();
        return $user->removeUserFromAllGroups($login);
    }
    
    // GroupPermission
    public function createPermission($idGroup, $idSite, $access)
    {
        $permission = new GroupPermission();
        return $permission->createPermission($idGroup, $idSite, $access);
    }
    
    public function getPermissionsOfGroup($idGroup)
    {
        $permission = new GroupPermission();
        return $permission->getPermissionsOfGroup($idGroup);
    }

    public function getPermissionsOfSite($idSite)
    {
        $permission = new GroupPermission();
        return $permission->getPermissionsOfSite($idSite);
    }
    
    public function removePermission($idGroup, $idSite)
    {
        $permission = new GroupPermission();
        return $permission->removePermission($idGroup, $idSite);
    }

    public function removeAllPermissionsOfGroup($idGroup)
    {
        $permission = new GroupPermission();
        return $permission->removeAllPermissionsOfGroup($idGroup);
    }

    public function removeAllPermissionsForSite($idSite)
    {
        $permission = new GroupPermission();
        return $permission->removeAllPermissionsForSite($idSite);
    }
    
    // MultiTable
    public function getPermissionsOfUser($login)
    {
        $multiTable = new MultiTable();
        return $multiTable->getPermissionsOfUser($login);
    }
}
