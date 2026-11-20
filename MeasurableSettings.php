<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Exception;
use Piwik\Access\RolesProvider;
use Piwik\Common;
use Piwik\Container\StaticContainer;
use Piwik\Piwik;
use Piwik\Plugins\GroupPermissions\Settings\GroupAccessBackend;
use Piwik\Settings\FieldConfig;
use Piwik\Settings\Measurable\MeasurableSetting;
use Piwik\Settings\Storage\Storage;

/**
 * Adds a "Group access" section to the website create/edit form of the SitesManager: a list of group/role pairs.
 * The field reads and writes the group permissions of the website directly (see GroupAccessBackend).
 *
 * Like all measurable settings, it can be changed by super users when creating a website and by admins of the
 * website when editing it, which matches the access check of GroupPermissions.setGroupAccess.
 */
class MeasurableSettings extends \Piwik\Settings\Measurable\MeasurableSettings {
    /** @var MeasurableSetting */
    public $groupAccess;

    protected function init(): void {
        $this->title = Piwik::translate('GroupPermissions_GroupPermissions');

        $setting = $this->makeSetting(GroupAccessBackend::SETTING_NAME, [], FieldConfig::TYPE_ARRAY, function (FieldConfig $field): void {
            $groups = $this->getGroupOptions();
            $roles = $this->getRoleOptions();

            $field->title = Piwik::translate('GroupPermissions_SiteFormGroupAccess');
            $field->inlineHelp = Piwik::translate('GroupPermissions_SiteFormGroupAccessHelp');
            $field->uiControl = FieldConfig::UI_CONTROL_MULTI_TUPLE;

            $groupField = new FieldConfig\MultiPair(
                Piwik::translate('GroupPermissions_Group'),
                'group',
                FieldConfig::UI_CONTROL_SINGLE_SELECT
            );
            $groupField->availableValues = $groups;
            $roleField = new FieldConfig\MultiPair(
                Piwik::translate('UsersManager_Role'),
                'role',
                FieldConfig::UI_CONTROL_SINGLE_SELECT
            );
            $roleField->availableValues = $roles;

            $field->uiControlAttributes['field1'] = $groupField->toArray();
            $field->uiControlAttributes['field2'] = $roleField->toArray();

            $field->validate = static function ($value) use ($groups, $roles): void {
                if (!is_array($value)) {
                    throw new Exception(Piwik::translate('GroupPermissions_SiteFormGroupAccessInvalid'));
                }
                foreach ($value as $row) {
                    if (!is_array($row)) {
                        throw new Exception(Piwik::translate('GroupPermissions_SiteFormGroupAccessInvalid'));
                    }
                    $idGroup = $row['group'] ?? '';
                    $role = $row['role'] ?? '';
                    // the UI always sends an empty last row
                    if ($idGroup === '' && $role === '') {
                        continue;
                    }
                    if (!is_numeric($idGroup) || !isset($groups[(int) $idGroup])) {
                        throw new Exception(Piwik::translate(
                            'GroupPermissions_ExceptionGroupDoesNotExist',
                            is_scalar($idGroup) ? (string) $idGroup : ''
                        ));
                    }
                    if (!is_string($role) || !isset($roles[$role])) {
                        throw new Exception(Piwik::translate(
                            'UsersManager_ExceptionAccessValues',
                            [implode(', ', array_keys($roles)), is_scalar($role) ? (string) $role : '']
                        ));
                    }
                }
            };
        });
        $setting->setStorage(new Storage(new GroupAccessBackend($this->idSite)));
        if (!GroupPermissions::isGroupsAdminEnabled()) {
            // not shown in the website form, and never saved
            $setting->setIsWritableByCurrentUser(false);
        }

        $this->groupAccess = $setting;
    }

    /**
     * @return array<int, string> group names by group id
     */
    private function getGroupOptions(): array {
        $groups = [];
        foreach ((new Model())->getAllGroups() as $group) {
            $groups[$group['idgroup']] = Common::unsanitizeInputValue($group['name']);
        }
        uasort($groups, 'strcasecmp');

        return $groups;
    }

    /**
     * @return array<string, string> role names by role id
     */
    private function getRoleOptions(): array {
        $roleProvider = StaticContainer::get(RolesProvider::class);
        if (!($roleProvider instanceof RolesProvider)) {
            throw new Exception('RolesProvider must inherit Access\RolesProvider');
        }

        $roles = [];
        foreach ($roleProvider->getAllRoles() as $role) {
            $roles[$role->getId()] = $role->getName();
        }

        return $roles;
    }
}
