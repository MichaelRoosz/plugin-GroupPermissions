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
use Piwik\Plugin\Manager as PluginManager;
use Piwik\Plugins\SegmentEditor\Model as SegmentEditorModel;
use Piwik\Plugins\UsersManager\Model as UsersModel;
use Piwik\Segment;

/**
 * Makes stored segments shared with a group visible to the members of the group.
 *
 * Matomo's SegmentEditor only knows two visibilities: the creator ("me") and all users. Segments shared with a
 * group stay "visible to me" in the SegmentEditor and are added for the group members to the results of the
 * `SegmentEditor.getAll` and `SegmentEditor.get` API calls, which the segment selector and segment name lookups
 * use. Like segments shared with all users, only the creator (and super users) can edit or delete them.
 *
 * They are not offered in the scheduled reports UI: ScheduledReports validates the segment of a report by calling
 * the SegmentEditor API class directly (not through the API proxy), which only accepts the user's own segments and
 * segments shared with all users, so saving a report with a group segment would fail.
 *
 * Matomo only filters the segments a user may see, using any segment definition in a report is allowed anyway,
 * so this is a visibility feature, not an access control.
 */
class SegmentSharing {
    /**
     * @var ?string
     */
    private static $dispatchedModule = null;

    /**
     * @var Model
     */
    private $model;

    /**
     * @var array<string, array{login: string, superuser: bool, adminIdSites: array<int>}|null> by login, see getSharer
     */
    private $sharers = [];

    /**
     * @var array<int, array<int>> websites with a role by group id, see isShareValid
     */
    private $groupIdSites = [];

    public function __construct(Model $model) {
        $this->model = $model;
    }

    public static function isSegmentEditorActivated(): bool {
        return PluginManager::getInstance()->isPluginActivated('SegmentEditor');
    }

    /**
     * Returns a stored segment that is not deleted, or null.
     *
     * @return ?array<mixed>
     */
    public static function getStoredSegment(int $idSegment): ?array {
        if (!self::isSegmentEditorActivated()) {
            return null;
        }

        $segment = (new SegmentEditorModel())->getSegment($idSegment);
        if (!is_array($segment) || !$segment || !empty($segment['deleted'])) {
            return null;
        }

        return $segment;
    }

    /**
     * Adds the segments shared with the groups of the current user to the result of `SegmentEditor.getAll`.
     *
     * @param mixed $segments
     * @param mixed $idSite
     */
    public function addSharedSegmentsToList(&$segments, $idSite): void {
        if (!is_array($segments) || !$this->isApplicableToCurrentUser() || self::isScheduledReportsRequest()) {
            return;
        }

        $idSite = empty($idSite) || !is_numeric($idSite) ? 0 : (int) $idSite;

        $listed = [];
        foreach ($segments as $segment) {
            if (is_array($segment) && isset($segment['idsegment']) && is_numeric($segment['idsegment'])) {
                $listed[(int) $segment['idsegment']] = true;
            }
        }

        // appended after Matomo's list (own segments first, then segments shared with all users), so the
        // segment selector shows them in its "Shared with you" section if it has one
        foreach ($this->getSegmentsSharedWithCurrentUser() as $idSegment => $segment) {
            if (isset($listed[$idSegment])) {
                continue;
            }

            $segmentIdSite = is_numeric($segment['enable_only_idsite'] ?? null) ? (int) $segment['enable_only_idsite'] : 0;

            if ($idSite) {
                // SegmentEditor.getAll already checked the view access for $idSite
                if ($segmentIdSite !== 0 && $segmentIdSite !== $idSite) {
                    continue;
                }
            } elseif ($segmentIdSite !== 0 && !Piwik::isUserHasViewAccess($segmentIdSite)) {
                continue;
            }

            if (!$this->canSegmentBeInitialized($segment, $idSite)) {
                continue;
            }

            $segments[] = $segment;
        }
    }

    /**
     * Returns a segment shared with a group of the current user for `SegmentEditor.get`, or null if the
     * SegmentEditor should handle the request itself (e.g. own segments or segments shared with all users).
     *
     * @param mixed $idSegment
     *
     * @return ?array<mixed>
     */
    public function getSharedSegment($idSegment): ?array {
        if (!is_numeric($idSegment) || !$this->isApplicableToCurrentUser()) {
            return null;
        }

        $segment = $this->getSegmentsSharedWithCurrentUser()[(int) $idSegment] ?? null;
        if ($segment === null) {
            return null;
        }

        $segmentIdSite = is_numeric($segment['enable_only_idsite'] ?? null) ? (int) $segment['enable_only_idsite'] : 0;
        if ($segmentIdSite !== 0 ? !Piwik::isUserHasViewAccess($segmentIdSite) : !Piwik::isUserHasSomeViewAccess()) {
            return null;
        }

        return $segment;
    }

    /**
     * Remembers the module of the controller the current HTTP request was dispatched to (the first dispatch).
     * `$_GET` cannot be used for this: API calls made while handling the request (`Request::processRequest`)
     * replace it with their own parameters.
     *
     * @param mixed $module
     */
    public static function rememberDispatchedModule($module): void {
        if (self::$dispatchedModule === null && is_string($module)) {
            self::$dispatchedModule = $module;
        }
    }

    /**
     * Whether a user without super user access may share a segment with a group, see API::shareSegmentWithGroup:
     * the user needs admin access to some website, and the group a role for the website of the segment, or, for
     * segments available on all websites (`$segmentIdSite` 0), for a website the user administers. Otherwise segments
     * could be pushed to the segment lists of any group.
     *
     * @param array<int> $groupIdSites websites the group has a role for
     * @param array<int> $adminIdSites websites the user administers
     */
    public static function isSharingAllowed(int $segmentIdSite, array $groupIdSites, array $adminIdSites): bool {
        if (!$adminIdSites) {
            return false;
        }

        if ($segmentIdSite > 0) {
            return in_array($segmentIdSite, $groupIdSites, true);
        }

        return (bool) array_intersect($groupIdSites, $adminIdSites);
    }

    /**
     * Whether the current request renders the scheduled reports UI (its report form lists the segments of
     * `SegmentEditor.getAll`)
     */
    private static function isScheduledReportsRequest(): bool {
        return self::$dispatchedModule === 'ScheduledReports';
    }

    private function isApplicableToCurrentUser(): bool {
        // super users see all segments anyway, group permissions never apply to the anonymous user
        return !Piwik::hasUserSuperUserAccess() && !Piwik::isUserIsAnonymous();
    }

    /**
     * Segments shared with any group of the current user that were not created by the user and are not shared
     * with all users (Matomo shows those anyway). A share only applies while the user who shared the segment may
     * still share it (see isShareValid).
     *
     * @return array<int, array<mixed>> segments by id
     */
    private function getSegmentsSharedWithCurrentUser(): array {
        $login = Piwik::getCurrentUserLogin();

        $segments = [];
        $skipped = [];
        foreach ($this->model->getSegmentSharesForUser($login) as $share) {
            $idSegment = $share['idsegment'];
            if (isset($segments[$idSegment]) || isset($skipped[$idSegment])) {
                continue;
            }

            $segment = self::getStoredSegment($idSegment);
            if ($segment === null || !empty($segment['enable_all_users']) || ($segment['login'] ?? null) === $login) {
                $skipped[$idSegment] = true;

                continue;
            }

            // the segment may be shared with several groups of the user, by different users
            if ($this->isShareValid($share, $segment)) {
                $segments[$idSegment] = $segment;
            }
        }

        uasort($segments, static function (array $a, array $b): int {
            return strcasecmp(self::stringValue($a, 'name'), self::stringValue($b, 'name'));
        });

        return $segments;
    }

    /**
     * Whether the user who shared the segment with the group may still do so: super users always, other users
     * only their own segments, under the conditions of isSharingAllowed. So a share ends when e.g. its creator
     * no longer administers the websites it was shared for, or was deleted.
     *
     * @param array{idsegment: int, idgroup: int, shared_by: string} $share
     * @param array<mixed> $segment
     */
    private function isShareValid(array $share, array $segment): bool {
        $sharer = $this->getSharer($share['shared_by']);
        if ($sharer === null) {
            return false;
        }
        if ($sharer['superuser']) {
            return true;
        }
        if (($segment['login'] ?? null) !== $sharer['login']) {
            return false;
        }

        if (!isset($this->groupIdSites[$share['idgroup']])) {
            $this->groupIdSites[$share['idgroup']] = array_column(
                $this->model->getPermissionsOfGroup($share['idgroup']),
                'idsite'
            );
        }

        $segmentIdSite = is_numeric($segment['enable_only_idsite'] ?? null) ? (int) $segment['enable_only_idsite'] : 0;

        return self::isSharingAllowed($segmentIdSite, $this->groupIdSites[$share['idgroup']], $sharer['adminIdSites']);
    }

    /**
     * @return array{login: string, superuser: bool, adminIdSites: array<int>}|null null for users that do not exist
     */
    private function getSharer(string $login): ?array {
        if (array_key_exists($login, $this->sharers)) {
            return $this->sharers[$login];
        }

        $sharer = null;
        $user = $login !== '' ? (new UsersModel())->getUser($login) : null;
        if (is_array($user) && is_string($user['login'] ?? null) && $user['login'] !== '') {
            $superuser = !empty($user['superuser_access']);
            $adminIdSites = [];
            if (!$superuser) {
                // this plugin's Access: includes the access the user has through groups
                foreach ((new Access())->getRawSitesWithSomeViewAccess($user['login']) as $siteAccess) {
                    if ($siteAccess['access'] === 'admin') {
                        $adminIdSites[] = $siteAccess['idsite'];
                    }
                }
            }
            $sharer = ['login' => $user['login'], 'superuser' => $superuser, 'adminIdSites' => $adminIdSites];
        }

        return $this->sharers[$login] = $sharer;
    }

    /**
     * Like SegmentEditor.getAll, skips segments using dimensions of deactivated plugins
     *
     * @param array<mixed> $segment
     */
    private function canSegmentBeInitialized(array $segment, int $idSite): bool {
        try {
            new Segment(self::stringValue($segment, 'definition'), $idSite ? [$idSite] : []);
        } catch (\Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * @param array<mixed> $segment
     */
    private static function stringValue(array $segment, string $column): string {
        return is_string($segment[$column] ?? null) ? $segment[$column] : '';
    }
}
