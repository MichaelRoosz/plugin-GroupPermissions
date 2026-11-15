<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Container\StaticContainer;
use Piwik\Log\LoggerInterface;
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\LoginSaml\Config as LoginSamlConfig;
use Piwik\Plugins\LoginSaml\Saml\SamlFactory;
use Piwik\Request;

/**
 * Synchronizes the group memberships of a user with a group attribute of the SAML response after they logged in
 * through the LoginSaml plugin (see GroupSync).
 *
 * LoginSaml provides no event with the attributes of the user and does not keep them. While its Assertion
 * Consumer Service starts the Matomo session (posting `Login.authenticate.successful`), the attributes are read
 * from LoginSaml's SAML handler (php-saml): the one LoginSaml used if it is shared through the DI container,
 * otherwise the posted SAMLResponse is validated again with LoginSaml's own settings (signature, audience,
 * validity period, ...). Unvalidated attributes are never used.
 */
class SamlGroupSync {
    public const PLUGIN = 'LoginSaml';

    /** @var SystemSettings */
    private $settings;

    /** @var GroupSync */
    private $groupSync;

    public function __construct(SystemSettings $settings, GroupSync $groupSync) {
        $this->settings = $settings;
        $this->groupSync = $groupSync;
    }

    public static function isAvailable(): bool {
        return PluginManager::getInstance()->isPluginActivated(self::PLUGIN)
            && class_exists(SamlFactory::class);
    }

    /**
     * Whether the current request is LoginSaml's Assertion Consumer Service, i.e. a SAML login
     */
    public static function isAssertionConsumerServiceRequest(): bool {
        $request = Request::fromRequest();

        return $request->getStringParameter('module', '') === self::PLUGIN
            && $request->getStringParameter('action', '') === 'assertionConsumerService';
    }

    public function isEnabled(): bool {
        return self::isAvailable() && $this->settings->isSamlGroupSyncEnabled();
    }

    /**
     * Synchronizes the groups of a user logging in through LoginSaml, if enabled. Errors are logged and never
     * break the login; memberships are not changed when the response has no group attribute.
     */
    public function syncUserAfterLogin(string $login): void {
        if (!$this->isEnabled() || !self::isAssertionConsumerServiceRequest() || $login === '' || $login === 'anonymous') {
            return;
        }

        $attribute = $this->settings->getSamlGroupsAttribute();

        try {
            $attributes = $this->getValidatedAttributes();
            if ($attributes === null) {
                $this->getLogger()->warning(
                    'GroupPermissions: could not read the validated SAML attributes of {login}, groups are not synchronized',
                    ['login' => $login]
                );

                return;
            }

            $externalGroups = self::getGroupsFromAttributes($attributes, $attribute);
            if ($externalGroups === null) {
                $this->getLogger()->info(
                    'GroupPermissions: the SAML response for {login} has no attribute "{attribute}", groups are not synchronized',
                    ['login' => $login, 'attribute' => $attribute]
                );

                return;
            }

            $result = $this->groupSync->syncUser($login, $externalGroups);
            $this->getLogger()->debug(
                'GroupPermissions: synchronized SAML groups of {login}: added to {added}, removed from {removed}',
                ['login' => $login, 'added' => implode(',', $result['added']), 'removed' => implode(',', $result['removed'])]
            );
        } catch (\Throwable $e) {
            $this->getLogger()->warning(
                'GroupPermissions: could not synchronize the SAML groups of {login}: {message}',
                ['login' => $login, 'message' => $e->getMessage()]
            );
        }
    }

    /**
     * Reads the groups from a SAML attribute (matched exactly, then case-insensitively)
     *
     * @param array<mixed> $attributes attribute name => list of values
     *
     * @return array<string>|null null if the attribute does not exist
     */
    public static function getGroupsFromAttributes(array $attributes, string $attribute): ?array {
        if ($attribute === '') {
            return null;
        }

        if (array_key_exists($attribute, $attributes)) {
            $values = $attributes[$attribute];
        } else {
            $values = null;
            foreach ($attributes as $name => $value) {
                if (is_string($name) && strcasecmp($name, $attribute) === 0) {
                    $values = $value;

                    break;
                }
            }
            if ($values === null) {
                return null;
            }
        }

        if (is_string($values)) {
            return [$values];
        }
        if (!is_array($values)) {
            return [];
        }

        return array_values(array_filter($values, 'is_string'));
    }

    /**
     * The attributes of the SAML response of this request, only if php-saml validated it
     *
     * @return array<mixed>|null
     */
    private function getValidatedAttributes(): ?array {
        $factory = StaticContainer::get(SamlFactory::class);
        if (!($factory instanceof SamlFactory)) {
            return null;
        }

        $samlAuth = $factory->getSamlAuth();
        if (!$samlAuth->isAuthenticated()) {
            $samlAuth->processResponse();
            if ($samlAuth->getErrors() || !$samlAuth->isAuthenticated()) {
                return null;
            }
        }

        // LoginSaml can be configured to identify attributes by their FriendlyName
        $useFriendlyName = class_exists(LoginSamlConfig::class)
            && !empty(LoginSamlConfig::getConfigOption('advanced_use_friendlyname'));

        $attributes = $useFriendlyName ? $samlAuth->getAttributesWithFriendlyName() : $samlAuth->getAttributes();

        return is_array($attributes) ? $attributes : null;
    }

    private function getLogger(): LoggerInterface {
        $logger = StaticContainer::get(LoggerInterface::class);
        if (!($logger instanceof LoggerInterface)) {
            throw new \Exception('LoggerInterface not available');
        }

        return $logger;
    }
}
