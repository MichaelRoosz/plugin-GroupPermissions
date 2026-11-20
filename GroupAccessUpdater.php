<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access as PiwikAccess;
use Piwik\Access\CapabilitiesProvider;
use Piwik\Tracker\Cache;

/**
 * Changes the role of a group for websites. Callers are responsible for access checks and validating the role.
 */
class GroupAccessUpdater {
    /** @var Model */
    private $model;

    /** @var CapabilitiesProvider */
    private $capabilityProvider;

    public function __construct(Model $model, CapabilitiesProvider $capabilityProvider) {
        $this->model = $model;
        $this->capabilityProvider = $capabilityProvider;
    }

    /**
     * @param array<int> $idSites
     * @param string $access a role or "noaccess"
     */
    public function setAccess(int $idGroup, array $idSites, string $access, bool $reloadAccess = true): void {
        foreach ($idSites as $idSite) {
            // "noaccess" is not stored, it is the default when no access is specified. A role replaces the current
            // one in a single statement, so concurrent requests never see the group without access in between.
            if ($access === 'noaccess') {
                $this->model->removePermission($idGroup, $idSite);
            } else {
                $this->model->createPermission($idGroup, $idSite, $access);
            }
        }

        $this->removeCapabilitiesNotApplyingToRole($idGroup, $idSites, $access);

        if ($reloadAccess) {
            self::reloadAccess();
        }
    }

    public static function reloadAccess(): void {
        PiwikAccess::getInstance()->reloadAccess();
        Cache::deleteTrackerCache();
    }

    /**
     * After the role of a group changed: capabilities never apply without a role, and the ones included in the
     * new role are redundant. Other capabilities are kept (unlike UsersManager.setUserAccess), so changing the
     * role from "view" to "write" does not lose e.g. the Tag Manager publish capability.
     *
     * @param array<int> $idSites
     */
    private function removeCapabilitiesNotApplyingToRole(int $idGroup, array $idSites, string $access): void {
        if ($access === 'noaccess') {
            foreach ($idSites as $idSite) {
                $this->model->removeAllCapabilitiesOfGroupForSite($idGroup, $idSite);
            }

            return;
        }

        $capabilitiesBySite = $this->model->getCapabilitiesOfGroup($idGroup);
        foreach ($idSites as $idSite) {
            foreach ($capabilitiesBySite[$idSite] ?? [] as $capabilityId) {
                $capability = $this->capabilityProvider->getCapability($capabilityId);
                if ($capability && $capability->hasRoleCapability($access)) {
                    $this->model->removeCapability($idGroup, $idSite, $capabilityId);
                }
            }
        }
    }
}
