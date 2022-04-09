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

class Access extends \Piwik\Access
{
    public function getRawSitesWithSomeViewAccess($login)
    {
        $sql = self::getSqlAccessSite("access, t2.idsite");
        $userRights = Db::fetchAll($sql, $login);
        
        $model = new Model();
        $groupRights = $model->getPermissionsOfUser($login);
        
        if (empty($userRights)) {
            return $groupRights;
        }

        if (empty($groupRights)) {
            return $userRights;
        }
        
        $rights = array();
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
        
        $return = array();
        foreach ($rights as $idsite => $access) {
            $return[] = array('idsite' => $idsite, 'access' => $access);  
        }
        
        return $return;  
    }
    
    public function getHigherPermission($permission1, $permission2) {
        
        if ($permission1 === 'admin' || $permission2 === 'admin') {
            return 'admin';
        }
        else if ($permission1 === 'write' || $permission2 === 'write') {
            return 'write';
        }
        else if ($permission1 === 'view' || $permission2 === 'view') {
            return 'view';
        }
        else {
            return '';
        }
    }
}

