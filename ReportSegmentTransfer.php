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
use Piwik\Date;
use Piwik\Log\LoggerInterface;
use Piwik\Plugins\SegmentEditor\Model as SegmentEditorModel;
use Piwik\Plugins\UsersManager\Model as UsersModel;

/**
 * Hands the private segments of a deleted user over to the new owners of their scheduled reports (see
 * ReportSharing::transferReportsOfDeletedUser).
 *
 * Matomo gives the segments of a deleted user to a super user. Matomo only lets the owner of a report use a private
 * segment of someone else in it if the owner is a super user, so the new owner of a report could no longer save,
 * send or download it. Instead, the segment goes to the new owner of the first report using it. If reports using
 * the same segment go to different users, the others get a copy of the segment.
 *
 * A report of a deleted super user can also use a private segment of another user. If the new owner of the report
 * cannot use it (not a super user, and the segment is not shared with one of their groups), they get a copy.
 *
 * Must run before the SegmentEditor plugin handles the deletion of the user. Segments shared with all users are
 * left to Matomo, everyone can use them anyway.
 */
class ReportSegmentTransfer {
    /** @var Model */
    private $model;

    /** @var string */
    private $deletedLogin;

    /** @var SegmentEditorModel|null */
    private $segmentModel = null;

    /** @var array<int, string> new owner by id of the segments handed over */
    private $owners = [];

    /** @var array<string, int> id of the copy by "idSegment:login" */
    private $copies = [];

    public function __construct(Model $model, string $deletedLogin) {
        $this->model = $model;
        $this->deletedLogin = $deletedLogin;
    }

    /**
     * Makes sure the new owner of a transferred report can use the segment of the report.
     */
    public function transfer(int $idReport, int $idSegment, string $newOwner): void {
        if ($idSegment <= 0 || !SegmentSharing::isSegmentEditorActivated()) {
            return;
        }

        $copyKey = $idSegment . ':' . $newOwner;
        if (isset($this->copies[$copyKey])) {
            $this->model->setReportSegment($idReport, $this->copies[$copyKey]);

            return;
        }

        if (isset($this->owners[$idSegment])) {
            if ($this->owners[$idSegment] !== $newOwner) {
                $this->copyForReport($idReport, $idSegment, $newOwner);
            }

            return;
        }

        $segment = $this->getSegmentModel()->getSegment($idSegment);
        if (!is_array($segment) || !empty($segment['deleted']) || !empty($segment['enable_all_users'])) {
            return;
        }

        $owner = $segment['login'] ?? null;
        if ($owner !== $this->deletedLogin) {
            // a private segment of another user, which the deleted user could use as a super user
            if ($owner !== $newOwner && !$this->canUseSegmentOfOthers($newOwner, $idSegment)) {
                $this->copyForReport($idReport, $idSegment, $newOwner);
            }

            return;
        }

        $this->getSegmentModel()->updateSegment($idSegment, [
            'login' => $newOwner,
            'ts_last_edit' => Date::now()->getDatetime(),
        ]);
        $this->owners[$idSegment] = $newOwner;

        $this->log('transferred the segment {idSegment} of the deleted user {from} to {to}', [
            'idSegment' => $idSegment,
            'from' => $this->deletedLogin,
            'to' => $newOwner,
        ]);
    }

    private function copyForReport(int $idReport, int $idSegment, string $newOwner): void {
        $segment = $this->getSegmentModel()->getSegment($idSegment);
        if (!is_array($segment)) {
            return;
        }

        $from = is_string($segment['login'] ?? null) ? $segment['login'] : '';

        // all other columns (name, definition, website, archiving) are kept; the hash is set by createSegment
        unset($segment['idsegment'], $segment['hash']);
        $now = Date::now()->getDatetime();
        $segment['login'] = $newOwner;
        $segment['ts_created'] = $now;
        $segment['ts_last_edit'] = $now;

        $idCopy = $this->getSegmentModel()->createSegment($segment);
        if (!is_numeric($idCopy) || (int) $idCopy <= 0) {
            return;
        }

        $this->copies[$idSegment . ':' . $newOwner] = (int) $idCopy;
        $this->model->setReportSegment($idReport, (int) $idCopy);

        $this->log('copied the segment {idSegment} of {from} for {to} (new segment {idCopy})', [
            'idSegment' => $idSegment,
            'from' => $from,
            'to' => $newOwner,
            'idCopy' => (int) $idCopy,
        ]);
    }

    /**
     * Whether the user can use a private segment of another user in their reports: super users can use any segment,
     * other users segments shared with one of their groups (see SegmentSharing)
     */
    private function canUseSegmentOfOthers(string $login, int $idSegment): bool {
        $user = (new UsersModel())->getUser($login);
        if (is_array($user) && !empty($user['superuser_access'])) {
            return true;
        }

        return in_array($idSegment, $this->model->getSegmentsSharedWithUser($login), true);
    }

    private function getSegmentModel(): SegmentEditorModel {
        if ($this->segmentModel === null) {
            $this->segmentModel = new SegmentEditorModel();
        }

        return $this->segmentModel;
    }

    /**
     * @param array<string, mixed> $context
     */
    private function log(string $message, array $context): void {
        $logger = StaticContainer::get(LoggerInterface::class);
        if ($logger instanceof LoggerInterface) {
            $logger->info('GroupPermissions: ' . $message, $context);
        }
    }
}
