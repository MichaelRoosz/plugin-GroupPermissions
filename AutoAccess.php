<?php

/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 */

namespace Piwik\Plugins\GroupPermissions;

use Piwik\Access\CapabilitiesProvider;
use Piwik\Common;
use Piwik\Plugins\GroupPermissions\Dao\GroupAutoAccess;
use Piwik\Plugins\SitesManager\Model as SitesModel;

/**
 * Gives groups access to a newly created website according to their automatic access rules.
 *
 * A rule matches either the Matomo website group of the new website or one of its URLs (main URL and alias URLs).
 * Patterns are case-insensitive and support `*` as wildcard. A URL pattern without `/` is compared with the host of
 * the URLs only (e.g. `*.example.com`), a pattern with `/` with host and path (e.g. `example.com/shop*`).
 */
class AutoAccess {
    /** @var Model */
    private $model;

    /** @var CapabilitiesProvider */
    private $capabilityProvider;

    public function __construct(Model $model, CapabilitiesProvider $capabilityProvider) {
        $this->model = $model;
        $this->capabilityProvider = $capabilityProvider;
    }

    /**
     * Applies all rules to a new website. Runs in the context of whoever created the website, so no access checks
     * are done here: the rules were configured by a super user.
     *
     * @return array<int, string> the role per group id of the groups that matched
     */
    public function applyToSite(int $idSite): array {
        $rules = $this->model->getAllAutoAccessRules();
        if (!$rules) {
            return [];
        }

        $roles = $this->applyRulesToSite($rules, $idSite);
        if ($roles) {
            $this->reloadAccess();
        }

        return $roles;
    }

    /**
     * Applies rules to all existing websites (rules normally only apply to websites created after them).
     *
     * @param array<array{idgroup: int, match_type: string, pattern: string, access: string, capabilities: array<string>}> $rules
     *
     * @return array<int> ids of the websites the rules matched
     */
    public function applyToAllSites(array $rules): array {
        $sitesModel = new SitesModel();

        $matched = [];
        foreach ($sitesModel->getSitesId() as $idSite) {
            if (!is_numeric($idSite)) {
                continue;
            }
            if ($this->applyRulesToSite($rules, (int) $idSite)) {
                $matched[] = (int) $idSite;
            }
        }

        if ($matched) {
            $this->reloadAccess();
        }

        return $matched;
    }

    /**
     * @param array<string> $urls
     */
    public static function ruleMatches(string $matchType, string $pattern, string $siteGroup, array $urls): bool {
        $pattern = trim(Common::unsanitizeInputValue($pattern));
        if ($pattern === '') {
            return false;
        }

        if ($matchType === GroupAutoAccess::MATCH_SITE_GROUP) {
            $siteGroup = trim(Common::unsanitizeInputValue($siteGroup));

            return $siteGroup !== '' && self::wildcardMatches($pattern, $siteGroup);
        }

        if ($matchType === GroupAutoAccess::MATCH_URL) {
            $pattern = self::normalizeUrlPattern($pattern);
            $withPath = strpos($pattern, '/') !== false;

            foreach ($urls as $url) {
                $subject = self::normalizeUrl(Common::unsanitizeInputValue($url), $withPath);
                if ($subject !== null && self::wildcardMatches($pattern, $subject)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Removes the scheme and a trailing slash, so `https://example.com/` is the same as `example.com`.
     */
    public static function normalizeUrlPattern(string $pattern): string {
        $pattern = (string) preg_replace('~^[a-z][a-z0-9+.-]*://~i', '', trim($pattern));

        return rtrim($pattern, '/');
    }

    /**
     * Gives every group with a matching rule the highest role of its matching rules (a role the group already has
     * is never downgraded) and the capabilities of these rules that the role does not include already.
     *
     * @param array<array{idgroup: int, match_type: string, pattern: string, access: string, capabilities: array<string>}> $rules
     *
     * @return array<int, string> the role per group id of the groups that matched
     */
    private function applyRulesToSite(array $rules, int $idSite): array {
        $sitesModel = new SitesModel();
        $site = $sitesModel->getSiteFromId($idSite);
        if (!is_array($site)) {
            return [];
        }

        $siteGroup = isset($site['group']) && is_scalar($site['group']) ? (string) $site['group'] : '';
        $urls = array_filter($sitesModel->getSiteUrlsFromId($idSite), 'is_string');

        $access = new Access();
        $roles = [];
        $capabilities = [];
        foreach ($rules as $rule) {
            if (!self::ruleMatches($rule['match_type'], $rule['pattern'], $siteGroup, $urls)) {
                continue;
            }

            $idGroup = $rule['idgroup'];
            $roles[$idGroup] = isset($roles[$idGroup])
                ? $access->getHigherPermission($roles[$idGroup], $rule['access'])
                : $rule['access'];
            foreach ($rule['capabilities'] as $capability) {
                $capabilities[$idGroup][$capability] = true;
            }
        }
        if (!$roles) {
            return [];
        }

        $existing = [];
        foreach ($this->model->getPermissionsOfSite($idSite) as $permission) {
            $existing[$permission['idgroup']] = $permission['access'];
        }

        foreach ($roles as $idGroup => $role) {
            if (isset($existing[$idGroup])) {
                $role = $access->getHigherPermission($existing[$idGroup], $role);
                $roles[$idGroup] = $role;
            }

            if (!isset($existing[$idGroup]) || $role !== $existing[$idGroup]) {
                $this->model->removePermission($idGroup, $idSite);
                $this->model->createPermission($idGroup, $idSite, $role);
            }

            foreach (array_keys($capabilities[$idGroup] ?? []) as $capabilityId) {
                $capability = $this->capabilityProvider->getCapability((string) $capabilityId);
                // unknown (e.g. plugin deactivated) or already included in the role
                if (!$capability || $capability->hasRoleCapability($role)) {
                    continue;
                }
                $this->model->addCapability($idGroup, $idSite, (string) $capabilityId);
            }
        }

        return $roles;
    }

    private function reloadAccess(): void {
        GroupAccessUpdater::reloadAccess();
    }

    /**
     * Returns the host (and path) of a URL, or null for URLs without host.
     */
    private static function normalizeUrl(string $url, bool $withPath): ?string {
        $url = trim($url);
        if (!preg_match('~^[a-z][a-z0-9+.-]*://~i', $url)) {
            $url = 'http://' . $url;
        }

        $parts = parse_url($url);
        if (!is_array($parts) || empty($parts['host'])) {
            return null;
        }

        $subject = $parts['host'];
        if ($withPath && !empty($parts['path'])) {
            $subject .= rtrim($parts['path'], '/');
        }

        return $subject;
    }

    private static function wildcardMatches(string $pattern, string $subject): bool {
        $regex = '/^' . str_replace('\*', '.*', preg_quote($pattern, '/')) . '$/iu';

        return preg_match($regex, $subject) === 1;
    }
}
