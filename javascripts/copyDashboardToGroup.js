/**
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Extends the "Copy dashboard to user" dialog of the Dashboard plugin with the groups of this plugin.
 * Selecting a group copies the dashboard to every member of that group.
 */
$(function () {
    if (typeof window.copyDashboardToUser !== 'function' || typeof window.makeSelectorLastId !== 'function') {
        return;
    }

    var GROUP_PREFIX = 'grouppermissions-group:';

    window.copyDashboardToUser = function () {
        var $name = $(makeSelectorLastId('copyDashboardName'));
        var $select = $(makeSelectorLastId('copyDashboardUser'));

        $name.val($('#dashboardWidgetsArea').dashboard('getDashboardName'));

        var users = null;
        var groups = null;

        function render() {
            if (users === null || groups === null) {
                return;
            }

            $select.empty();

            var $users = $('<optgroup></optgroup>').attr('label', _pk_translate('GroupPermissions_Users'));
            $users.append($('<option></option>').val(piwik.userLogin).text(piwik.userLogin));
            $.each(users, function (index, user) {
                if (user.login != 'anonymous' && user.login != piwik.userLogin) {
                    $users.append($('<option></option>').val(user.login).text(user.login));
                }
            });

            if (!groups.length) {
                $select.append($users.children());
                return;
            }

            var $groups = $('<optgroup></optgroup>').attr('label', _pk_translate('GroupPermissions_Groups'));
            $.each(groups, function (index, group) {
                $groups.append($('<option></option>').val(GROUP_PREFIX + group.idGroup).text(group.name));
            });

            $select.append($users, $groups);
        }

        var usersRequest = new ajaxHelper();
        usersRequest.addParams({
            module: 'API',
            method: 'UsersManager.getUsers',
            format: 'json',
            filter_limit: '-1'
        }, 'get');
        usersRequest.setCallback(function (response) {
            users = $.isArray(response) ? response : [];
            render();
        });
        usersRequest.send();

        var groupsRequest = new ajaxHelper();
        groupsRequest.addParams({
            module: 'API',
            method: 'GroupPermissions.getAllGroups',
            format: 'json'
        }, 'get');
        groupsRequest.setCallback(function (response) {
            groups = $.isArray(response) ? response : [];
            render();
        });
        groupsRequest.setErrorCallback(function () {
            groups = [];
            render();
        });
        groupsRequest.send();

        piwikHelper.modalConfirm(makeSelectorLastId('copyDashboardToUserConfirm'), {
            yes: function () {
                var dashboardName = $name.val();
                var target = String($select.val() || '');
                var idDashboard = $('#dashboardWidgetsArea').dashboard('getDashboardId');

                var request = new ajaxHelper();

                if (target.indexOf(GROUP_PREFIX) === 0) {
                    var groupName = $select.find('option:selected').text();

                    request.addParams({
                        module: 'API',
                        method: 'GroupPermissions.copyDashboardToGroup',
                        format: 'json'
                    }, 'get');
                    request.addParams({
                        dashboardName: dashboardName,
                        idDashboard: idDashboard,
                        idGroup: target.substring(GROUP_PREFIX.length)
                    }, 'post');
                    request.setCallback(function (copiedTo) {
                        var count = $.isArray(copiedTo) ? copiedTo.length : 0;
                        $('#alert').find('h2').text(
                            _pk_translate('GroupPermissions_DashboardCopiedToGroup', [count, groupName])
                        );
                        piwikHelper.modalConfirm('#alert', {});
                    });
                } else {
                    request.addParams({
                        module: 'API',
                        method: 'Dashboard.copyDashboardToUser',
                        format: 'json'
                    }, 'get');
                    request.addParams({
                        dashboardName: dashboardName,
                        idDashboard: idDashboard,
                        copyToUser: target
                    }, 'post');
                    request.setCallback(function () {
                        $('#alert').find('h2').text(_pk_translate('Dashboard_DashboardCopied'));
                        piwikHelper.modalConfirm('#alert', {});
                    });
                }

                request.withTokenInUrl();
                request.send();
            }
        });
    };
});
