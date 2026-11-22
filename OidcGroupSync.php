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
use Piwik\Request;

/**
 * Synchronizes the group memberships of a user with a groups claim of their OpenID Connect ID token after they
 * logged in through the LoginOIDC or RebelOIDC plugin (see GroupSync).
 *
 * Neither plugin provides an event with the claims of the user. Both store the ID token they got from the token
 * endpoint in the session (`loginoidc_idtoken`) right before they start the Matomo session, which posts
 * `Login.authenticate.successful`. The token is only read while handling the callback request of these plugins,
 * and only if it has an expiry (`exp`, required by OpenID Connect) that has not passed and was not seen by an
 * earlier login in the session: every OIDC login marks its token as seen, also while the sync is disabled, so a
 * token left in the session by an earlier login (e.g. by a plugin version that keeps it when the provider returns
 * none) is never used for a different login.
 *
 * The signature of the token is not checked: the plugins received it directly from the token endpoint of the
 * provider over the back channel (authorization code flow), where TLS server validation authenticates the
 * issuer (OpenID Connect Core 1.0, section 3.1.3.7).
 */
class OidcGroupSync {
    /** Login plugins supported, they share the callback action and the session key of the ID token */
    public const PLUGINS = ['LoginOIDC', 'RebelOIDC'];

    private const SESSION_KEY_ID_TOKEN = 'loginoidc_idtoken';

    /** Hash of the ID token of the last OIDC login in the session, see syncUserAfterLogin */
    private const SESSION_KEY_SYNCED_TOKEN = 'grouppermissions_oidc_synced_token';

    /** Seconds of clock difference to the provider tolerated when checking the expiry of the ID token */
    private const EXPIRY_LEEWAY = 60;

    /** @var SystemSettings */
    private $settings;

    /** @var GroupSync */
    private $groupSync;

    public function __construct(SystemSettings $settings, GroupSync $groupSync) {
        $this->settings = $settings;
        $this->groupSync = $groupSync;
    }

    public static function isAvailable(): bool {
        foreach (self::PLUGINS as $plugin) {
            if (PluginManager::getInstance()->isPluginActivated($plugin)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Whether the current request is the login callback of one of the supported OIDC plugins
     */
    public static function isCallbackRequest(): bool {
        // module and action are always GET parameters of the callback URL the provider redirects to
        $request = Request::fromGet();
        $module = $request->getStringParameter('module', '');
        $action = $request->getStringParameter('action', '');

        return $action === 'callback'
            && in_array($module, self::PLUGINS, true)
            && PluginManager::getInstance()->isPluginActivated($module);
    }

    public function isEnabled(): bool {
        return self::isAvailable() && $this->settings->isOidcGroupSyncEnabled();
    }

    /**
     * Synchronizes the groups of a user logging in through an OIDC plugin, if enabled. Errors are logged and
     * never break the login; memberships are not changed when the token has no groups claim.
     */
    public function syncUserAfterLogin(string $login): void {
        if (!self::isCallbackRequest() || $login === '' || $login === 'anonymous') {
            return;
        }

        try {
            $idToken = $_SESSION[self::SESSION_KEY_ID_TOKEN] ?? null;
            $idToken = is_string($idToken) && $idToken !== '' ? $idToken : null;

            // a token is used for one login only, also when the sync is disabled at the time of that login: it
            // must never be applied to a later login (possibly of another user) in the same session
            $isNewToken = $idToken !== null && self::markTokenSeen($idToken);

            if (!$this->isEnabled()) {
                return;
            }

            if ($idToken === null) {
                $this->getLogger()->info(
                    'GroupPermissions: the OpenID Connect provider returned no ID token for {login}, groups are not synchronized',
                    ['login' => $login]
                );

                return;
            }

            $claims = self::decodeJwtPayload($idToken);
            if ($claims === null) {
                $this->getLogger()->warning(
                    'GroupPermissions: could not decode the ID token of {login}, groups are not synchronized',
                    ['login' => $login]
                );

                return;
            }

            // tokens without expiry are never used
            if (!$isNewToken || self::isExpired($claims, time())) {
                $this->getLogger()->info(
                    'GroupPermissions: the ID token in the session was already used, has expired or has no expiry, groups of {login} are not synchronized',
                    ['login' => $login]
                );

                return;
            }

            $claim = $this->settings->getOidcGroupsClaim();
            $externalGroups = self::getGroupsFromClaims($claims, $claim);
            if ($externalGroups === null) {
                $this->getLogger()->info(
                    'GroupPermissions: the ID token of {login} has no claim "{claim}", groups are not synchronized',
                    ['login' => $login, 'claim' => $claim]
                );

                return;
            }

            $result = $this->groupSync->syncUser($login, $externalGroups);
            $this->getLogger()->debug(
                'GroupPermissions: synchronized OpenID Connect groups of {login}: added to {added}, removed from {removed}',
                ['login' => $login, 'added' => implode(',', $result['added']), 'removed' => implode(',', $result['removed'])]
            );
        } catch (\Throwable $e) {
            $this->getLogger()->warning(
                'GroupPermissions: could not synchronize the OpenID Connect groups of {login}: {message}',
                ['login' => $login, 'message' => $e->getMessage()]
            );
        }
    }

    /**
     * Whether the `exp` claim (required by OpenID Connect) of an ID token lies in the past. Tokens without a numeric
     * `exp` count as expired: otherwise only the "used once" check would keep a stale token from being applied.
     *
     * @param array<mixed> $claims
     */
    public static function isExpired(array $claims, int $now): bool {
        $exp = $claims['exp'] ?? null;

        return !is_numeric($exp) || (int) $exp + self::EXPIRY_LEEWAY < $now;
    }

    /**
     * @return array<mixed>|null the claims of a JWT (not verified), null if it is malformed
     */
    public static function decodeJwtPayload(string $jwt): ?array {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }

        // base64url without padding
        $json = base64_decode(strtr($parts[1], '-_', '+/'), true);
        if ($json === false) {
            return null;
        }

        $claims = json_decode($json, true);

        return is_array($claims) ? $claims : null;
    }

    /**
     * Reads the groups from a claim. The claim name is looked up as is first (namespaced claims like
     * `https://example.com/groups` contain dots), then as a path into nested claims, e.g. `realm_access.roles`
     * or `resource_access.matomo.roles` (Keycloak roles).
     *
     * @param array<mixed> $claims
     *
     * @return array<string>|null null if the claim does not exist
     */
    public static function getGroupsFromClaims(array $claims, string $claim): ?array {
        if ($claim === '') {
            return null;
        }

        if (array_key_exists($claim, $claims)) {
            $value = $claims[$claim];
        } else {
            $value = $claims;
            foreach (explode('.', $claim) as $key) {
                if (!is_array($value) || !array_key_exists($key, $value)) {
                    return null;
                }
                $value = $value[$key];
            }
        }

        if (is_string($value)) {
            return [$value];
        }
        if (!is_array($value)) {
            return null;
        }

        $groups = [];
        foreach ($value as $group) {
            if (is_string($group)) {
                $groups[] = $group;
            } elseif (is_int($group)) {
                $groups[] = (string) $group;
            }
        }

        return $groups;
    }

    /**
     * Records the token as the one of the current login in the session
     *
     * @return bool false if an earlier login in the session already had this token
     */
    private static function markTokenSeen(string $idToken): bool {
        $tokenHash = hash('sha256', $idToken);
        if (($_SESSION[self::SESSION_KEY_SYNCED_TOKEN] ?? null) === $tokenHash) {
            return false;
        }
        $_SESSION[self::SESSION_KEY_SYNCED_TOKEN] = $tokenHash;

        return true;
    }

    private function getLogger(): LoggerInterface {
        $logger = StaticContainer::get(LoggerInterface::class);
        if (!($logger instanceof LoggerInterface)) {
            throw new \Exception('LoggerInterface not available');
        }

        return $logger;
    }
}
