/*!
 * Matomo - free/libre analytics platform
 *
 * @link http://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

$(document).ready(function () {
    
    function getSelectedIdSite() {
        return $('#groupPermissionsSiteSelect').attr('siteid');
    }
    
    function sendUpdateGroupPermissionAccess(name, access, successCallback) {
        var parameters = {};
        parameters.name = name;
        parameters.access = access;
        parameters.idSites = getSelectedIdSite();
    
        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.setGroupAccess'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingGroupPermissions');
        ajaxHandler.setErrorElement('#ajaxErrorGroupPermissions');
        ajaxHandler.send(true);
    }
    
    function callSendUpdateGroupPermissionAccess(self, successCallback) {
        sendUpdateGroupPermissionAccess(
            $(self).parent().parent().find('#group').html(), //if changed change also the modal
            $(self).parent().attr('id'),
            successCallback
        );
    }
    
    function bindUpdateGroupPermissions() {
        var self = this;
        // callback called when the ajax request Update the group permissions is successful
        function successCallback(response) {
            var mainDiv = $(self).parent().parent();
            var group = $('#group', mainDiv).text();
            mainDiv.find('.accessGranted')
                .attr("src", "plugins/UsersManager/images/no-access.png")
                .attr("class", "updateAccess")
                .click(bindUpdateGroupPermissions)
            ;
            $(self)
                .attr('src', "plugins/UsersManager/images/ok.png")
                .attr('class', "accessGranted")
            ;
    
            var UI = require('piwik/UI');
            var notification = new UI.Notification();
            notification.show(_pk_translate('General_Done'), {
                placeat: '#accessUpdated',
                context: 'success',
                noclear: true,
                type: 'toast',
                style: {display: 'inline-block', marginTop: '10px'},
                id: 'groupPermissionsAccessUpdated'
            });
        }
    
        var idSite = getSelectedIdSite();
        if (idSite == 'all') {
            var target = this;
    
            //ask confirmation
            var group = $(this).parent().parent().find('#group').text();
            $('#confirmGroupPermissions').find('#group').text(group);
    
            function onValidate() {
                callSendUpdateGroupPermissionAccess(target, successCallback);
            }
    
            piwikHelper.modalConfirm('#confirmGroupPermissions', {yes: onValidate})
        }
        else {
            callSendUpdateGroupPermissionAccess(this, successCallback);
        }
    }
    
    function sendAddGroupMember(idGroup, login, successCallback) {
        var parameters = {};
        parameters.idGroup = idGroup;
        parameters.login = login;

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.addUserToGroup'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingManageGroupMember');
        ajaxHandler.setErrorElement('#ajaxErrorManageGroupMember');
        ajaxHandler.send(true);
    }
    
    function sendRemoveGroupMember(idGroup, login, successCallback) {
        var parameters = {};
        parameters.idGroup = idGroup;
        parameters.login = login;

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.removeUserFromGroup'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingManageGroupMember');
        ajaxHandler.setErrorElement('#ajaxErrorManageGroupMember');
        ajaxHandler.send(true);
    }
    
    function bindRemoveGroupMember() {
        var idGroup = $('#groupPermissionsCurrentIdGroup').val();
        var name = $('#groupPermissionsCurrentGroupName').val();
        var line = $(this).closest('tr');
        var login = $(this).data('login');

        function successCallback(response) {
            line.remove();
        }
        
        $('#confirmRemoveUserFromGroup').find('#login').text(login);
        $('#confirmRemoveUserFromGroup').find('#group').text(name); 
        
        piwikHelper.modalConfirm('#confirmRemoveUserFromGroup', {yes: function() {
            sendRemoveGroupMember(idGroup, login, successCallback);
        }});
    }
    
    function sendCreateGroup(groupName, successCallback) {
        var parameters = {};
        parameters.groupName = groupName;

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.createGroup'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingCreateGroup');
        ajaxHandler.setErrorElement('#ajaxErrorCreateGroup');
        ajaxHandler.send(true);
    }
    
    function bindCreateGroup() {
        var groupName = $('#groupPermissionsGroupCreateGroup').val();

        function successCallback(response) {
            location.reload();
        }
        
        sendCreateGroup(groupName, successCallback); 
    }


    function sendRenameGroup(idGroup, newName, successCallback) {
        var parameters = {};
        parameters.idGroup = idGroup;
        parameters.newName = newName;

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.renameGroup'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingManageGroupRename');
        ajaxHandler.setErrorElement('#ajaxErrorManageGroupRename');
        ajaxHandler.send(true);
    }
    
    function bindRenameGroup() {
        var idGroup = $('#groupPermissionsCurrentIdGroup').val();
        var name = $('#groupPermissionsCurrentGroupName').val();
        var newName = $('#groupPermissionsGroupRenameGroup').val();

        function successCallback(response) {
            location.reload();
        }
        
        $('#confirmRenameGroup').find('#confirmOldGroupName').text(name);
        $('#confirmRenameGroup').find('#confirmNewGroupName').text(newName); 
        
        piwikHelper.modalConfirm('#confirmRenameGroup', {yes: function() {
            sendRenameGroup(idGroup, newName, successCallback);
        }});
    }

    function sendDeleteGroup(idGroup, successCallback) {
        var parameters = {};
        parameters.idGroup = idGroup;

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'GroupPermissions.deleteGroup'
        }, 'GET');
        ajaxHandler.addParams(parameters, 'POST');
        ajaxHandler.setCallback(successCallback);
        ajaxHandler.setLoadingElement('#ajaxLoadingManageGroupDelete');
        ajaxHandler.setErrorElement('#ajaxErrorManageGroupDelete');
        ajaxHandler.send(true);
    }
    
    function bindDeleteGroup() {
        var idGroup = $('#groupPermissionsCurrentIdGroup').val();
        var name = $('#groupPermissionsCurrentGroupName').val();
        
        function successCallback(response) {
            location.reload();
        }
        
        $('#confirmDeleteGroup').find('#confirmDeleteGroupName').text(name);
        
        piwikHelper.modalConfirm('#confirmDeleteGroup', {yes: function() {
            sendDeleteGroup(idGroup, successCallback);
        }});
    }

    function initializeUserSelect() {
        
        var userSelect = new Choices('#groupPermissionsGroupAddUserSelect', {
            allowHTML: false,
            searchPlaceholderValue: 'Search for a user',
        });

        var ajaxHandler = new ajaxHelper();
        ajaxHandler.addParams({
            module: 'API',
            format: 'json',
            method: 'UsersManager.getUsersLogin',
            filter_limit: '-1'
        }, 'GET');
        ajaxHandler.setCallback(function(response) {

            if (!response) {
                return;
            }

            var users = response.map(function(login) {
                return {label: login, value: login};
            });

            userSelect.setChoices(users);
        });
        ajaxHandler.setLoadingElement('#ajaxLoadingManageGroupMember');
        ajaxHandler.setErrorElement('#ajaxErrorManageGroupMember');
        ajaxHandler.send(true);

        function bindAddGroupMember() {
            var idGroup = $('#groupPermissionsCurrentIdGroup').val();
            var login = userSelect.getValue(true);

            function successCallback(response) {
                var tableBody = $('#groupPermissionsGroup tbody');
                tableBody.append('<tr><td class="login">'+login+'</td><td class="text-center">'
                                 +'<button class="groupPermissionsRemoveUser btn btn-flat" data-login="'+login+'"><span class="icon-delete"></span></button>'
                                 +'</td></tr>');
                                 
               userSelect.setChoiceByValue('');
            }
            
            sendAddGroupMember(idGroup, login, successCallback); 
        }

        $('#groupPermissionsGroupAddUserButton').click(bindAddGroupMember);
    }

    // when a site is selected, reload the page w/o showing the ajax loading element
    $('#groupPermissionsSiteSelect').bind('change', function (e, site) {
        if (site.id != $(this).data('siteid')) {
            piwik.broadcast.propagateNewPage('idSite=' + encodeURIComponent(site.id), false);
        }
    });

    // when a group is selected, reload the page w/o showing the ajax loading element
    $('#groupPermissionsGroupSelect').bind('change', function (e) {
        piwik.broadcast.propagateNewPage('idGroup=' + encodeURIComponent($('#groupPermissionsGroupSelect').val()), false);
    }); 
    
    $('#groupPermissions .updateAccess').click(bindUpdateGroupPermissions);
    
    $('#groupPermissionsGroup').on("click", ".groupPermissionsRemoveUser", bindRemoveGroupMember);
    
    $('#groupPermissionsGroupRenameGroupButton').click(bindRenameGroup);
    
    $('#groupPermissionsGroupDeleteGroupButton').click(bindDeleteGroup);
    
    $('#groupPermissionsGroupCreateGroupButton').click(bindCreateGroup);

    if ($('#groupPermissionsGroupAddUserSelect').length) {
        initializeUserSelect();
    }
});
