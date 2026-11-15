<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Piwik;
use Piwik\Settings\FieldConfig;
use Piwik\Settings\Setting;

/**
 * Settings of the group sync from LDAP (see LdapGroupSync), OpenID Connect (see OidcGroupSync) and SAML (see
 * SamlGroupSync), shown in "General settings" while a supported login plugin is activated
 */
class SystemSettings extends \Piwik\Settings\Plugin\SystemSettings {
    /** @var Setting|null */
    public $ldapGroupSyncEnabled;

    /** @var Setting|null */
    public $ldapGroupAttribute;

    /** @var Setting|null */
    public $ldapGroupFilter;

    /** @var Setting|null */
    public $ldapGroupBaseDn;

    /** @var Setting|null */
    public $oidcGroupSyncEnabled;

    /** @var Setting|null */
    public $oidcGroupsClaim;

    /** @var Setting|null */
    public $samlGroupSyncEnabled;

    /** @var Setting|null */
    public $samlGroupsAttribute;

    public function isLdapGroupSyncEnabled(): bool {
        return $this->ldapGroupSyncEnabled !== null && (bool) $this->ldapGroupSyncEnabled->getValue();
    }

    public function getLdapGroupAttribute(): string {
        return $this->ldapGroupAttribute !== null ? self::toString($this->ldapGroupAttribute->getValue()) : '';
    }

    public function getLdapGroupFilter(): string {
        return $this->ldapGroupFilter !== null ? self::toString($this->ldapGroupFilter->getValue()) : '';
    }

    public function getLdapGroupBaseDn(): string {
        return $this->ldapGroupBaseDn !== null ? self::toString($this->ldapGroupBaseDn->getValue()) : '';
    }

    public function isOidcGroupSyncEnabled(): bool {
        return $this->oidcGroupSyncEnabled !== null && (bool) $this->oidcGroupSyncEnabled->getValue();
    }

    public function getOidcGroupsClaim(): string {
        return $this->oidcGroupsClaim !== null ? self::toString($this->oidcGroupsClaim->getValue()) : '';
    }

    public function isSamlGroupSyncEnabled(): bool {
        return $this->samlGroupSyncEnabled !== null && (bool) $this->samlGroupSyncEnabled->getValue();
    }

    public function getSamlGroupsAttribute(): string {
        return $this->samlGroupsAttribute !== null ? self::toString($this->samlGroupsAttribute->getValue()) : '';
    }

    protected function init(): void {
        if (LdapGroupSync::isAvailable()) {
            $this->initLdapSettings();
        }

        if (OidcGroupSync::isAvailable()) {
            $this->initOidcSettings();
        }

        if (SamlGroupSync::isAvailable()) {
            $this->initSamlSettings();
        }
    }

    private function initLdapSettings(): void {
        $this->ldapGroupSyncEnabled = $this->makeSetting(
            'ldapGroupSyncEnabled',
            false,
            FieldConfig::TYPE_BOOL,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingLdapGroupSync');
                $field->description = Piwik::translate('GroupPermissions_SettingLdapGroupSyncHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_CHECKBOX;
            }
        );

        $this->ldapGroupAttribute = $this->makeSetting(
            'ldapGroupAttribute',
            'memberOf',
            FieldConfig::TYPE_STRING,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingLdapGroupAttribute');
                $field->description = Piwik::translate('GroupPermissions_SettingLdapGroupAttributeHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->condition = 'ldapGroupSyncEnabled';
                $field->validate = static function ($value): void {
                    if (!is_string($value) || !preg_match('/^[a-zA-Z0-9;-]*$/', trim($value))) {
                        throw new \Exception(Piwik::translate('GroupPermissions_ExceptionInvalidLdapAttribute'));
                    }
                };
                $field->transform = static function ($value): string {
                    return is_string($value) ? trim($value) : '';
                };
            }
        );

        $this->ldapGroupFilter = $this->makeSetting(
            'ldapGroupFilter',
            '',
            FieldConfig::TYPE_STRING,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingLdapGroupFilter');
                $field->description = Piwik::translate(
                    'GroupPermissions_SettingLdapGroupFilterHelp',
                    ['(&(objectClass=groupOfNames)(member=?))']
                );
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->condition = 'ldapGroupSyncEnabled';
                $field->validate = static function ($value): void {
                    $value = is_string($value) ? trim($value) : '';
                    if ($value !== '' && (substr($value, 0, 1) !== '(' || substr($value, -1) !== ')')) {
                        throw new \Exception(Piwik::translate('GroupPermissions_ExceptionInvalidLdapFilter'));
                    }
                };
                $field->transform = static function ($value): string {
                    return is_string($value) ? trim($value) : '';
                };
            }
        );

        $this->ldapGroupBaseDn = $this->makeSetting(
            'ldapGroupBaseDn',
            '',
            FieldConfig::TYPE_STRING,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingLdapGroupBaseDn');
                $field->description = Piwik::translate('GroupPermissions_SettingLdapGroupBaseDnHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->condition = 'ldapGroupSyncEnabled && ldapGroupFilter';
                $field->transform = static function ($value): string {
                    return is_string($value) ? trim($value) : '';
                };
            }
        );
    }

    private function initOidcSettings(): void {
        $this->oidcGroupSyncEnabled = $this->makeSetting(
            'oidcGroupSyncEnabled',
            false,
            FieldConfig::TYPE_BOOL,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingOidcGroupSync');
                $field->description = Piwik::translate('GroupPermissions_SettingOidcGroupSyncHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_CHECKBOX;
            }
        );

        $this->oidcGroupsClaim = $this->makeSetting(
            'oidcGroupsClaim',
            'groups',
            FieldConfig::TYPE_STRING,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingOidcGroupsClaim');
                $field->description = Piwik::translate('GroupPermissions_SettingOidcGroupsClaimHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->condition = 'oidcGroupSyncEnabled';
                $field->validate = static function ($value): void {
                    if (!is_string($value) || trim($value) === '') {
                        throw new \Exception(Piwik::translate('GroupPermissions_ExceptionEmptyOidcGroupsClaim'));
                    }
                };
                $field->transform = static function ($value): string {
                    return is_string($value) ? trim($value) : '';
                };
            }
        );
    }

    private function initSamlSettings(): void {
        $this->samlGroupSyncEnabled = $this->makeSetting(
            'samlGroupSyncEnabled',
            false,
            FieldConfig::TYPE_BOOL,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingSamlGroupSync');
                $field->description = Piwik::translate('GroupPermissions_SettingSamlGroupSyncHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_CHECKBOX;
            }
        );

        $this->samlGroupsAttribute = $this->makeSetting(
            'samlGroupsAttribute',
            'groups',
            FieldConfig::TYPE_STRING,
            static function (FieldConfig $field): void {
                $field->title = Piwik::translate('GroupPermissions_SettingSamlGroupsAttribute');
                $field->description = Piwik::translate('GroupPermissions_SettingSamlGroupsAttributeHelp');
                $field->uiControl = FieldConfig::UI_CONTROL_TEXT;
                $field->condition = 'samlGroupSyncEnabled';
                $field->validate = static function ($value): void {
                    if (!is_string($value) || trim($value) === '') {
                        throw new \Exception(Piwik::translate('GroupPermissions_ExceptionEmptySamlGroupsAttribute'));
                    }
                };
                $field->transform = static function ($value): string {
                    return is_string($value) ? trim($value) : '';
                };
            }
        );
    }

    /**
     * @param mixed $value
     */
    private static function toString($value): string {
        return is_string($value) ? trim($value) : '';
    }
}
