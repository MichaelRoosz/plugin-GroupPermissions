(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("CoreHome"), require("vue"), require("CorePluginsAdmin"));
	else if(typeof define === 'function' && define.amd)
		define(["CoreHome", , "CorePluginsAdmin"], factory);
	else if(typeof exports === 'object')
		exports["GroupPermissions"] = factory(require("CoreHome"), require("vue"), require("CorePluginsAdmin"));
	else
		root["GroupPermissions"] = factory(root["CoreHome"], root["Vue"], root["CorePluginsAdmin"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__19dc__, __WEBPACK_EXTERNAL_MODULE__8bbf__, __WEBPACK_EXTERNAL_MODULE_a5a2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "plugins/GroupPermissions/vue/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "fae3");
/******/ })
/************************************************************************/
/******/ ({

/***/ "19dc":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__19dc__;

/***/ }),

/***/ "8bbf":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__8bbf__;

/***/ }),

/***/ "a5a2":
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_a5a2__;

/***/ }),

/***/ "fae3":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "TabManageGroupAccess", function() { return /* reexport */ TabManageGroupAccess; });
__webpack_require__.d(__webpack_exports__, "TabManageGroups", function() { return /* reexport */ TabManageGroups; });

// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/setPublicPath.js
// This file is imported into lib/wc client bundles.

if (typeof window !== 'undefined') {
  var currentScript = window.document.currentScript
  if (false) { var getCurrentScript; }

  var src = currentScript && currentScript.src.match(/(.+\/)[^/]+\.js(\?.*)?$/)
  if (src) {
    __webpack_require__.p = src[1] // eslint-disable-line
  }
}

// Indicate to webpack that this file can be concatenated
/* harmony default export */ var setPublicPath = (null);

// EXTERNAL MODULE: external {"commonjs":"vue","commonjs2":"vue","root":"Vue"}
var external_commonjs_vue_commonjs2_vue_root_Vue_ = __webpack_require__("8bbf");

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=template&id=4a076e42
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }


var _hoisted_1 = {
  class: "groupPermissionsManageAccess"
};
var _hoisted_2 = {
  class: "groupPermissionsIntro"
};
var _hoisted_3 = {
  class: "row groupPermissionsToolbar"
};
var _hoisted_4 = {
  class: "col s12 m6 groupPermissionsSiteField"
};
var _hoisted_5 = {
  class: "groupPermissionsLabel"
};
var _hoisted_6 = {
  class: "sites_autocomplete"
};
var _hoisted_7 = {
  key: 0,
  class: "col s12 m6 groupPermissionsSearch"
};
var _hoisted_8 = {
  class: "input-field"
};
var _hoisted_9 = ["placeholder", "aria-label"];
var _hoisted_10 = {
  key: 0,
  class: "groupPermissionsAllWebsitesNote"
};

var _hoisted_11 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorAccessGroupMember"
}, null, -1);

var _hoisted_12 = {
  class: "role_header"
};
var _hoisted_13 = ["title"];
var _hoisted_14 = {
  key: 0,
  class: "groupPermissionsRolesHelp"
};
var _hoisted_15 = {
  colspan: "2"
};
var _hoisted_16 = {
  key: 1
};
var _hoisted_17 = {
  colspan: "2"
};
var _hoisted_18 = {
  key: 2,
  class: "groupPermissionsEmpty"
};
var _hoisted_19 = {
  colspan: "2"
};
var _hoisted_20 = ["href"];
var _hoisted_21 = {
  key: 3,
  class: "groupPermissionsEmpty"
};
var _hoisted_22 = {
  colspan: "2"
};
var _hoisted_23 = {
  class: "groupName"
};
var _hoisted_24 = {
  class: "access-cell"
};
var _hoisted_25 = {
  class: "ui-confirm",
  id: "confirmUpdateAccessToAllSites",
  ref: "confirmUpdateAccessToAllSites"
};
var _hoisted_26 = ["textContent"];
var _hoisted_27 = ["value"];
var _hoisted_28 = ["value"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_SiteSelector = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SiteSelector");

  var _component_Notification = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Notification");

  var _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");

  var _component_Field = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Field");

  var _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");

  var _directive_content_table = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveDirective"])("content-table");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", _hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DescriptionAccessTab')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_3, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", _hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Website')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_6, [_ctx.isInitialSiteResolved ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_SiteSelector, {
    key: 0,
    "default-to-first-site": true,
    "show-selected-site": true,
    "show-all-sites-item": _ctx.hasSuperUserAccess,
    "switch-site-on-select": false,
    "only-sites-with-admin-access": true,
    "all-sites-text": _ctx.translate('UsersManager_ApplyToAllWebsites'),
    "model-value": _ctx.site,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
      _ctx.site = $event;

      _ctx.updateGroupAccessList();
    })
  }, null, 8, ["show-all-sites-item", "all-sites-text", "model-value"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), _ctx.groupAccess.size ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_8, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "text",
    name: "groupPermissionsAccessSearch",
    "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) {
      return _ctx.searchTerm = $event;
    }),
    placeholder: _ctx.translate('GroupPermissions_SearchGroups'),
    "aria-label": _ctx.translate('GroupPermissions_SearchGroups'),
    autocomplete: "off"
  }, null, 8, _hoisted_9), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.searchTerm]])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), _ctx.isAllWebsites ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", _hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Notification, {
    context: "info",
    type: "persistent",
    noclear: true
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_AllWebsitesNote')), 1)];
    }),
    _: 1
  })])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.accessTableTitle
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["groupPermissionsAccessTable", {
          loading: _ctx.isLoading
        }])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Group')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_12, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_Role')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
        class: "icon-help groupPermissionsRolesHelpToggle",
        title: _ctx.translate('General_Help'),
        onClick: _cache[2] || (_cache[2] = function ($event) {
          return _ctx.showRolesHelp = !_ctx.showRolesHelp;
        })
      }, null, 8, _hoisted_13)])])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [_ctx.showRolesHelp ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.roles, function (role) {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
          key: role.key
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(role.value) + ":", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(role.description), 1)]);
      }), 128))])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isLoading && !_ctx.groupAccess.size ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_17, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
        loading: true
      })])])) : !_ctx.groupAccess.size && !_ctx.isLoading ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_18, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_19, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoGroups')) + " ", 1), _ctx.hasSuperUserAccess ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("a", {
        key: 0,
        href: _ctx.manageGroupsUrl
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_ManageGroups')), 9, _hoisted_20)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])])) : !_ctx.filteredGroupAccess.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", _hoisted_21, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_22, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoGroupsFound')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.filteredGroupAccess, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            groupName = _ref2[0],
            access = _ref2[1];

        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
          key: groupName,
          class: "groupPermissionsAccessRow"
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_23, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(groupName), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", _hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Field, {
          key: "".concat(groupName, "-").concat(_ctx.rowVersions[groupName] || 0),
          uicontrol: "select",
          name: "groupPermissionsAccess".concat(_ctx.rowIndex(groupName)),
          "model-value": access,
          "onUpdate:modelValue": function onUpdateModelValue($event) {
            return _ctx.onRoleSelected(groupName, $event);
          },
          options: _ctx.roleOptions
        }, null, 8, ["name", "model-value", "onUpdate:modelValue", "options"])])]);
      }), 128))])], 2), [[_directive_content_table]])];
    }),
    _: 1
  }, 8, ["content-title"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_25, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", {
    textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmUpdateAccessToAllSitesText)
  }, null, 8, _hoisted_26), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, _hoisted_27), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, _hoisted_28)], 512)]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=template&id=4a076e42

// EXTERNAL MODULE: external "CoreHome"
var external_CoreHome_ = __webpack_require__("19dc");

// EXTERNAL MODULE: external "CorePluginsAdmin"
var external_CorePluginsAdmin_ = __webpack_require__("a5a2");

// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/roles.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

var rolesPromise = null;
/**
 * Roles a group can get (view, write, admin, ... as provided by Matomo), loaded once per page.
 */

function loadRoles() {
  if (!rolesPromise) {
    rolesPromise = external_CoreHome_["AjaxHelper"].fetch({
      method: 'UsersManager.getAvailableRoles'
    }).then(function (roles) {
      return roles.map(function (role) {
        return {
          key: role.id,
          value: role.name,
          description: role.description
        };
      });
    }).catch(function (e) {
      rolesPromise = null;
      throw e;
    });
  }

  return rolesPromise;
}
function noAccessOption() {
  return {
    key: 'noaccess',
    value: Object(external_CoreHome_["translate"])('UsersManager_PrivNone')
  };
}
function roleName(roles, access) {
  if (access === 'noaccess') {
    return noAccessOption().value;
  }

  var role = roles.find(function (r) {
    return r.key === access;
  });
  return role ? role.value : access;
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/notify.ts
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || notify_unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function notify_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return notify_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return notify_arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return notify_arrayLikeToArray(arr); }

function notify_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

/**
 * Shows a success toast. Notifications are rendered as (sanitized) HTML, so the values
 * inserted into the translation (group, user and website names) are escaped.
 */

function notifySuccess(id, translationKey) {
  for (var _len = arguments.length, values = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    values[_key - 2] = arguments[_key];
  }

  external_CoreHome_["NotificationsStore"].show({
    message: external_CoreHome_["translate"].apply(void 0, [translationKey].concat(_toConsumableArray(values.map(function (v) {
      return external_CoreHome_["Matomo"].helper.htmlEntities(v);
    })))),
    context: 'success',
    type: 'toast',
    id: id
  });
}
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=script&lang=ts
function TabManageGroupAccessvue_type_script_lang_ts_slicedToArray(arr, i) { return TabManageGroupAccessvue_type_script_lang_ts_arrayWithHoles(arr) || TabManageGroupAccessvue_type_script_lang_ts_iterableToArrayLimit(arr, i) || TabManageGroupAccessvue_type_script_lang_ts_unsupportedIterableToArray(arr, i) || TabManageGroupAccessvue_type_script_lang_ts_nonIterableRest(); }

function TabManageGroupAccessvue_type_script_lang_ts_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function TabManageGroupAccessvue_type_script_lang_ts_iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function TabManageGroupAccessvue_type_script_lang_ts_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function TabManageGroupAccessvue_type_script_lang_ts_toConsumableArray(arr) { return TabManageGroupAccessvue_type_script_lang_ts_arrayWithoutHoles(arr) || TabManageGroupAccessvue_type_script_lang_ts_iterableToArray(arr) || TabManageGroupAccessvue_type_script_lang_ts_unsupportedIterableToArray(arr) || TabManageGroupAccessvue_type_script_lang_ts_nonIterableSpread(); }

function TabManageGroupAccessvue_type_script_lang_ts_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function TabManageGroupAccessvue_type_script_lang_ts_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TabManageGroupAccessvue_type_script_lang_ts_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TabManageGroupAccessvue_type_script_lang_ts_arrayLikeToArray(o, minLen); }

function TabManageGroupAccessvue_type_script_lang_ts_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function TabManageGroupAccessvue_type_script_lang_ts_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return TabManageGroupAccessvue_type_script_lang_ts_arrayLikeToArray(arr); }

function TabManageGroupAccessvue_type_script_lang_ts_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }






/* harmony default export */ var TabManageGroupAccessvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    ContentBlock: external_CoreHome_["ContentBlock"],
    Field: external_CorePluginsAdmin_["Field"],
    Notification: external_CoreHome_["Notification"],
    SiteSelector: external_CoreHome_["SiteSelector"]
  },
  directives: {
    ContentTable: external_CoreHome_["ContentTable"]
  },
  data: function data() {
    return {
      site: undefined,
      isInitialSiteResolved: false,
      groupAccess: new Map(),
      rowVersions: {},
      roles: [],
      searchTerm: '',
      showRolesHelp: false,
      isLoading: false,
      confirmUpdateAccessToAllSitesText: ''
    };
  },
  mounted: function mounted() {
    var _this = this;

    loadRoles().then(function (roles) {
      _this.roles = roles;
    });
    this.resolveInitialSite();
  },
  computed: {
    hasSuperUserAccess: function hasSuperUserAccess() {
      return !!external_CoreHome_["Matomo"].hasSuperUserAccess;
    },
    isAllWebsites: function isAllWebsites() {
      return !!this.site && this.site.id === 'all';
    },
    roleOptions: function roleOptions() {
      return [noAccessOption()].concat(TabManageGroupAccessvue_type_script_lang_ts_toConsumableArray(this.roles));
    },
    groupNames: function groupNames() {
      return TabManageGroupAccessvue_type_script_lang_ts_toConsumableArray(this.groupAccess.keys());
    },
    filteredGroupAccess: function filteredGroupAccess() {
      var term = this.searchTerm.trim().toLowerCase();
      return TabManageGroupAccessvue_type_script_lang_ts_toConsumableArray(this.groupAccess.entries()).filter(function (_ref) {
        var _ref2 = TabManageGroupAccessvue_type_script_lang_ts_slicedToArray(_ref, 1),
            name = _ref2[0];

        return !term || name.toLowerCase().includes(term);
      });
    },
    accessTableTitle: function accessTableTitle() {
      if (!this.site) {
        return Object(external_CoreHome_["translate"])('GroupPermissions_Groups');
      }

      return Object(external_CoreHome_["translate"])('GroupPermissions_RolesOfGroupsFor', this.site.name);
    },
    manageGroupsUrl: function manageGroupsUrl() {
      return "?".concat(external_CoreHome_["MatomoUrl"].stringify(Object.assign(Object.assign({}, external_CoreHome_["MatomoUrl"].urlParsed.value), {}, {
        show: 'groups'
      })));
    }
  },
  methods: {
    rowIndex: function rowIndex(groupName) {
      return this.groupNames.indexOf(groupName);
    },

    /**
     * Starts with the website of the URL if the user administers it. Otherwise the site selector
     * falls back to the first website the user administers.
     */
    resolveInitialSite: function resolveInitialSite() {
      var _this2 = this;

      var idSite = parseInt(String(external_CoreHome_["MatomoUrl"].getSearchParam('idSite') || external_CoreHome_["Matomo"].idSite || ''), 10);

      if (!idSite) {
        this.isInitialSiteResolved = true;
        return;
      }

      this.isLoading = true;
      external_CoreHome_["AjaxHelper"].fetch({
        method: 'SitesManager.getSitesIdWithAdminAccess',
        filter_limit: -1
      }).then(function (adminSiteIds) {
        if (!adminSiteIds.map(function (id) {
          return parseInt(String(id), 10);
        }).includes(idSite)) {
          return undefined;
        }

        return external_CoreHome_["AjaxHelper"].fetch({
          method: 'SitesManager.getSiteFromId',
          idSite: idSite
        });
      }).then(function (siteInfo) {
        if (siteInfo) {
          _this2.site = {
            id: idSite,
            name: siteInfo.name
          };

          _this2.updateGroupAccessList();
        }
      }) // on errors the site selector falls back to the first website
      .catch(function () {
        return undefined;
      }).finally(function () {
        _this2.isLoading = false;
        _this2.isInitialSiteResolved = true;
      });
    },
    onRoleSelected: function onRoleSelected(groupName, access) {
      var _this3 = this;

      if (!this.site) {
        return;
      }

      var idSite = this.site.id;

      if (idSite === 'all') {
        this.confirmUpdateAccessToAllSitesText = Object(external_CoreHome_["translate"])('GroupPermissions_ChangeAccessToAllSitesConfirm', roleName(this.roles, access), groupName);
        external_CoreHome_["Matomo"].helper.modalConfirm(this.$refs.confirmUpdateAccessToAllSites, {
          yes: function yes() {
            return _this3.updateGroupAccess(idSite, groupName, access);
          },
          no: function no() {
            return _this3.resetRow(groupName);
          }
        });
      } else {
        this.updateGroupAccess(idSite, groupName, access);
      }
    },
    resetRow: function resetRow(groupName) {
      // re-creates the select of the row, so it shows the stored role again
      this.rowVersions[groupName] = (this.rowVersions[groupName] || 0) + 1;
    },
    updateGroupAccess: function updateGroupAccess(idSite, groupName, access) {
      var _this4 = this;

      this.isLoading = true;
      var siteName = this.site ? this.site.name : '';
      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.setGroupAccess'
      }, {
        idSites: idSite,
        name: groupName,
        access: access
      }, {
        errorElement: '#ajaxErrorAccessGroupMember'
      }).then(function () {
        _this4.groupAccess.set(groupName, access);

        notifySuccess('groupPermissionsAccessUpdated', 'GroupPermissions_AccessUpdated', groupName, siteName, roleName(_this4.roles, access));
      }).catch(function () {
        _this4.resetRow(groupName);
      }).finally(function () {
        _this4.isLoading = false;
      });
    },
    updateGroupAccessList: function updateGroupAccessList() {
      var _this5 = this;

      if (!this.site) {
        return;
      }

      this.isLoading = true;
      var idSite = this.site.id; // ignore responses of a website that is no longer selected (e.g. when switching quickly)

      var isStale = function isStale() {
        return !_this5.site || _this5.site.id !== idSite;
      };

      if (idSite === 'all') {
        external_CoreHome_["AjaxHelper"].post({
          method: 'GroupPermissions.getAllGroups'
        }, {
          filter_limit: -1
        }, {
          errorElement: '#ajaxErrorAccessGroupMember'
        }).then(function (response) {
          if (isStale()) {
            return;
          }

          _this5.groupAccess.clear();

          response.map(function (group) {
            return group.name;
          }).sort(function (a, b) {
            return a.localeCompare(b);
          }).forEach(function (group) {
            _this5.groupAccess.set(group, 'noaccess');
          });
        }).finally(function () {
          _this5.isLoading = false;
        });
      } else {
        external_CoreHome_["AjaxHelper"].post({
          method: 'GroupPermissions.getGroupAccessFromSite'
        }, {
          idSite: idSite,
          filter_limit: -1
        }, {
          errorElement: '#ajaxErrorAccessGroupMember'
        }).then(function (response) {
          if (isStale()) {
            return;
          }

          _this5.groupAccess.clear();

          Object.keys(response).sort(function (a, b) {
            return a.localeCompare(b);
          }).forEach(function (group) {
            _this5.groupAccess.set(group, response[group]);
          });
        }).finally(function () {
          _this5.isLoading = false;
        });
      }
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue



TabManageGroupAccessvue_type_script_lang_ts.render = render

/* harmony default export */ var TabManageGroupAccess = (TabManageGroupAccessvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=template&id=7cb424e4

var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_1 = {
  class: "groupPermissionsManageGroups"
};
var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_2 = {
  class: "groupPermissionsIntro"
};

var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_3 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorManageGroups"
}, null, -1);

var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_4 = {
  class: "ui-confirm",
  ref: "confirmDeleteGroup"
};
var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_5 = ["value"];
var TabManageGroupsvue_type_template_id_7cb424e4_hoisted_6 = ["value"];
function TabManageGroupsvue_type_template_id_7cb424e4_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_GroupList = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupList");

  var _component_GroupCreate = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupCreate");

  var _component_InviteUser = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("InviteUser");

  var _component_GroupEdit = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupEdit");

  var _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TabManageGroupsvue_type_template_id_7cb424e4_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", TabManageGroupsvue_type_template_id_7cb424e4_hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DescriptionGroupsTab')), 1), TabManageGroupsvue_type_template_id_7cb424e4_hoisted_3, _ctx.view === 'list' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupList, {
    key: 0,
    groups: _ctx.groups,
    "is-loading": _ctx.isLoadingGroups,
    onCreate: _cache[0] || (_cache[0] = function ($event) {
      return _ctx.navigate({
        groupView: 'create'
      });
    }),
    onInvite: _cache[1] || (_cache[1] = function ($event) {
      return _ctx.navigate({
        groupView: 'invite'
      });
    }),
    onEdit: _cache[2] || (_cache[2] = function ($event) {
      return _ctx.navigate({
        idGroup: $event.idGroup
      });
    }),
    onDelete: _cache[3] || (_cache[3] = function ($event) {
      return _ctx.confirmDeleteGroup($event);
    })
  }, null, 8, ["groups", "is-loading"])) : _ctx.view === 'create' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupCreate, {
    key: 1,
    onCreated: _cache[4] || (_cache[4] = function ($event) {
      return _ctx.onGroupCreated($event);
    }),
    onCancel: _cache[5] || (_cache[5] = function ($event) {
      return _ctx.navigate({});
    })
  })) : _ctx.view === 'invite' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_InviteUser, {
    key: 2,
    groups: _ctx.groups,
    "preselected-group-ids": _ctx.inviteGroupIds,
    onUserInvited: _cache[6] || (_cache[6] = function ($event) {
      return _ctx.onUserInvited($event);
    }),
    onCancel: _cache[7] || (_cache[7] = function ($event) {
      return _ctx.goBackFromInvite();
    })
  }, null, 8, ["groups", "preselected-group-ids"])) : _ctx.view === 'edit' && _ctx.editedGroup ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupEdit, {
    key: _ctx.editedGroup.idGroup,
    group: _ctx.editedGroup,
    "active-tab": _ctx.editTab,
    onChangeTab: _cache[8] || (_cache[8] = function ($event) {
      return _ctx.navigate({
        idGroup: _ctx.editedGroup.idGroup,
        groupTab: $event
      });
    }),
    onBack: _cache[9] || (_cache[9] = function ($event) {
      return _ctx.navigate({});
    }),
    onChanged: _cache[10] || (_cache[10] = function ($event) {
      return _ctx.loadGroups();
    }),
    onRenamed: _cache[11] || (_cache[11] = function ($event) {
      return _ctx.onGroupRenamed($event);
    }),
    onDelete: _cache[12] || (_cache[12] = function ($event) {
      return _ctx.confirmDeleteGroup($event);
    }),
    onInvite: _cache[13] || (_cache[13] = function ($event) {
      return _ctx.navigate({
        groupView: 'invite',
        inviteGroup: $event.idGroup
      });
    })
  }, null, 8, ["group", "active-tab"])) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_ActivityIndicator, {
    key: 4,
    loading: _ctx.isLoadingGroups
  }, null, 8, ["loading"])), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TabManageGroupsvue_type_template_id_7cb424e4_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmDeleteGroupText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DeleteGroupDescription')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, TabManageGroupsvue_type_template_id_7cb424e4_hoisted_5), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, TabManageGroupsvue_type_template_id_7cb424e4_hoisted_6)], 512)]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=template&id=7cb424e4

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupList.vue?vue&type=template&id=4261206b

var GroupListvue_type_template_id_4261206b_hoisted_1 = {
  class: "groupPermissionsGroupList"
};
var GroupListvue_type_template_id_4261206b_hoisted_2 = {
  class: "row groupPermissionsToolbar"
};
var GroupListvue_type_template_id_4261206b_hoisted_3 = {
  class: "col s12 m8 groupPermissionsToolbarButtons"
};

var GroupListvue_type_template_id_4261206b_hoisted_4 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-add"
}, null, -1);

var GroupListvue_type_template_id_4261206b_hoisted_5 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-email"
}, null, -1);

var GroupListvue_type_template_id_4261206b_hoisted_6 = {
  key: 0,
  class: "col s12 m4 groupPermissionsSearch"
};
var GroupListvue_type_template_id_4261206b_hoisted_7 = {
  class: "input-field"
};
var GroupListvue_type_template_id_4261206b_hoisted_8 = ["placeholder", "aria-label"];
var GroupListvue_type_template_id_4261206b_hoisted_9 = {
  class: "groupName"
};
var GroupListvue_type_template_id_4261206b_hoisted_10 = {
  class: "groupMembers"
};
var GroupListvue_type_template_id_4261206b_hoisted_11 = {
  class: "groupWebsites"
};
var GroupListvue_type_template_id_4261206b_hoisted_12 = {
  class: "actions-cell-header"
};
var GroupListvue_type_template_id_4261206b_hoisted_13 = {
  key: 0
};
var GroupListvue_type_template_id_4261206b_hoisted_14 = {
  colspan: "4"
};
var GroupListvue_type_template_id_4261206b_hoisted_15 = {
  key: 1,
  class: "groupPermissionsEmpty"
};
var GroupListvue_type_template_id_4261206b_hoisted_16 = {
  colspan: "4"
};
var GroupListvue_type_template_id_4261206b_hoisted_17 = {
  key: 2,
  class: "groupPermissionsEmpty"
};
var GroupListvue_type_template_id_4261206b_hoisted_18 = {
  colspan: "4"
};
var GroupListvue_type_template_id_4261206b_hoisted_19 = ["data-id-group"];
var GroupListvue_type_template_id_4261206b_hoisted_20 = {
  class: "groupName"
};
var GroupListvue_type_template_id_4261206b_hoisted_21 = ["onClick"];
var GroupListvue_type_template_id_4261206b_hoisted_22 = {
  class: "groupMembers"
};
var GroupListvue_type_template_id_4261206b_hoisted_23 = {
  class: "groupWebsites"
};
var GroupListvue_type_template_id_4261206b_hoisted_24 = {
  class: "center actions-cell"
};
var GroupListvue_type_template_id_4261206b_hoisted_25 = ["title", "onClick"];

var GroupListvue_type_template_id_4261206b_hoisted_26 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-edit"
}, null, -1);

var GroupListvue_type_template_id_4261206b_hoisted_27 = [GroupListvue_type_template_id_4261206b_hoisted_26];
var GroupListvue_type_template_id_4261206b_hoisted_28 = ["title", "onClick"];

var _hoisted_29 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete"
}, null, -1);

var _hoisted_30 = [_hoisted_29];
function GroupListvue_type_template_id_4261206b_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");

  var _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");

  var _directive_content_table = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveDirective"])("content-table");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", GroupListvue_type_template_id_4261206b_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupListvue_type_template_id_4261206b_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupListvue_type_template_id_4261206b_hoisted_3, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: "",
    class: "btn groupPermissionsCreateGroup",
    onClick: _cache[0] || (_cache[0] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.$emit('create');
    }, ["prevent"]))
  }, [GroupListvue_type_template_id_4261206b_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_CreateNewGroup')), 1)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: "",
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["btn btn-flat groupPermissionsInviteUserButton", {
      disabled: !_ctx.groups.length
    }]),
    onClick: _cache[1] || (_cache[1] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.groups.length && _ctx.$emit('invite');
    }, ["prevent"]))
  }, [GroupListvue_type_template_id_4261206b_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_InviteNewUser')), 1)], 2)]), _ctx.groups.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", GroupListvue_type_template_id_4261206b_hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupListvue_type_template_id_4261206b_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "text",
    name: "groupPermissionsGroupSearch",
    "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) {
      return _ctx.searchTerm = $event;
    }),
    placeholder: _ctx.translate('GroupPermissions_SearchGroups'),
    "aria-label": _ctx.translate('GroupPermissions_SearchGroups'),
    autocomplete: "off"
  }, null, 8, GroupListvue_type_template_id_4261206b_hoisted_8), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.searchTerm]])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ContentBlock, {
    "content-title": _ctx.translate('GroupPermissions_Groups')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", {
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["groupPermissionsGroupsTable", {
          loading: _ctx.isLoading
        }])
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupListvue_type_template_id_4261206b_hoisted_9, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Group')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupListvue_type_template_id_4261206b_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Members')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupListvue_type_template_id_4261206b_hoisted_11, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Websites')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupListvue_type_template_id_4261206b_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Actions')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [_ctx.isLoading && !_ctx.groups.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupListvue_type_template_id_4261206b_hoisted_13, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
        loading: true
      })])])) : !_ctx.groups.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupListvue_type_template_id_4261206b_hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoGroups')), 1)])) : !_ctx.filteredGroups.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupListvue_type_template_id_4261206b_hoisted_17, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_18, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoGroupsFound')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.filteredGroups, function (group) {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
          key: group.idGroup,
          class: "groupPermissionsGroupRow",
          "data-id-group": group.idGroup
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
          href: "",
          onClick: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.$emit('edit', group);
          }, ["prevent"])
        }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.name), 9, GroupListvue_type_template_id_4261206b_hoisted_21)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_22, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.memberCount), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_23, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.siteCount), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupListvue_type_template_id_4261206b_hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
          class: "table-action edit-group",
          title: _ctx.translate('General_Edit'),
          onClick: function onClick($event) {
            return _ctx.$emit('edit', group);
          }
        }, GroupListvue_type_template_id_4261206b_hoisted_27, 8, GroupListvue_type_template_id_4261206b_hoisted_25), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
          class: "table-action delete-group",
          title: _ctx.translate('GroupPermissions_DeleteGroupButton'),
          onClick: function onClick($event) {
            return _ctx.$emit('delete', group);
          }
        }, _hoisted_30, 8, GroupListvue_type_template_id_4261206b_hoisted_28)])], 8, GroupListvue_type_template_id_4261206b_hoisted_19);
      }), 128))])], 2), [[_directive_content_table]])];
    }),
    _: 1
  }, 8, ["content-title"])]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupList.vue?vue&type=template&id=4261206b

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupList.vue?vue&type=script&lang=ts


/* harmony default export */ var GroupListvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    ContentBlock: external_CoreHome_["ContentBlock"]
  },
  directives: {
    ContentTable: external_CoreHome_["ContentTable"]
  },
  props: {
    groups: {
      type: Array,
      required: true
    },
    isLoading: Boolean
  },
  emits: ['create', 'invite', 'edit', 'delete'],
  data: function data() {
    return {
      searchTerm: ''
    };
  },
  computed: {
    filteredGroups: function filteredGroups() {
      var term = this.searchTerm.trim().toLowerCase();

      if (!term) {
        return this.groups;
      }

      return this.groups.filter(function (g) {
        return g.name.toLowerCase().includes(term);
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupList.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupList.vue



GroupListvue_type_script_lang_ts.render = GroupListvue_type_template_id_4261206b_render

/* harmony default export */ var GroupList = (GroupListvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupCreate.vue?vue&type=template&id=2028ea89


var GroupCreatevue_type_template_id_2028ea89_hoisted_1 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorCreateGroup"
}, null, -1);

var GroupCreatevue_type_template_id_2028ea89_hoisted_2 = {
  class: "groupPermissionsFormActions"
};
function GroupCreatevue_type_template_id_2028ea89_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_TextField = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TextField");

  var _component_SaveButton = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SaveButton");

  var _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_ContentBlock, {
    class: "groupPermissionsCreateGroupForm",
    "content-title": _ctx.translate('GroupPermissions_CreateNewGroup')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("form", {
        onSubmit: _cache[3] || (_cache[3] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
          return _ctx.createGroup();
        }, ["prevent"]))
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_TextField, {
        name: "groupPermissionsNewGroupName",
        "model-value": _ctx.groupName,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
          return _ctx.groupName = $event;
        }),
        title: _ctx.translate('GroupPermissions_GroupName'),
        "inline-help": _ctx.translate('GroupPermissions_GroupNameHelp'),
        maxlength: 64,
        autofocus: ""
      }, null, 8, ["model-value", "title", "inline-help"])]), GroupCreatevue_type_template_id_2028ea89_hoisted_1, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupCreatevue_type_template_id_2028ea89_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SaveButton, {
        class: "groupPermissionsSaveNewGroup",
        value: _ctx.translate('GroupPermissions_CreateNewGroupButton'),
        saving: _ctx.isCreatingGroup,
        disabled: !_ctx.groupName.trim(),
        onConfirm: _cache[1] || (_cache[1] = function ($event) {
          return _ctx.createGroup();
        })
      }, null, 8, ["value", "saving", "disabled"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
        href: "",
        class: "entityCancelLink",
        onClick: _cache[2] || (_cache[2] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
          return _ctx.$emit('cancel');
        }, ["prevent"]))
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Cancel')), 1)])], 32)];
    }),
    _: 1
  }, 8, ["content-title"]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupCreate.vue?vue&type=template&id=2028ea89

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TextField.vue?vue&type=template&id=53914a76

var TextFieldvue_type_template_id_53914a76_hoisted_1 = {
  class: "form-group row matomo-form-field groupPermissionsTextField"
};
var TextFieldvue_type_template_id_53914a76_hoisted_2 = ["id", "name", "type", "value", "maxlength", "autocomplete", "autofocus"];
var TextFieldvue_type_template_id_53914a76_hoisted_3 = ["for"];
var TextFieldvue_type_template_id_53914a76_hoisted_4 = {
  class: "form-help"
};
var TextFieldvue_type_template_id_53914a76_hoisted_5 = {
  class: "inline-help"
};
function TextFieldvue_type_template_id_53914a76_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", TextFieldvue_type_template_id_53914a76_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["col s12 input-field", {
      m6: !_ctx.fullWidth
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    id: _ctx.name,
    name: _ctx.name,
    class: "control_text",
    type: _ctx.type,
    value: _ctx.modelValue,
    maxlength: _ctx.maxlength,
    autocomplete: _ctx.autocomplete,
    autofocus: _ctx.autofocus,
    onInput: _cache[0] || (_cache[0] = function ($event) {
      return _ctx.$emit('update:modelValue', $event.target.value);
    }),
    onFocus: _cache[1] || (_cache[1] = function ($event) {
      return _ctx.hasFocus = true;
    }),
    onBlur: _cache[2] || (_cache[2] = function ($event) {
      return _ctx.hasFocus = false;
    })
  }, null, 40, TextFieldvue_type_template_id_53914a76_hoisted_2), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", {
    for: _ctx.name,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])({
      active: _ctx.hasFocus || !!_ctx.modelValue
    })
  }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.title), 11, TextFieldvue_type_template_id_53914a76_hoisted_3)], 2), _ctx.inlineHelp ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    key: 0,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["col s12", {
      m6: !_ctx.fullWidth
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TextFieldvue_type_template_id_53914a76_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", TextFieldvue_type_template_id_53914a76_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.inlineHelp), 1)])], 2)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TextField.vue?vue&type=template&id=53914a76

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TextField.vue?vue&type=script&lang=ts

/* harmony default export */ var TextFieldvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true
    },
    title: String,
    inlineHelp: String,
    type: {
      type: String,
      default: 'text'
    },
    maxlength: Number,
    autocomplete: {
      type: String,
      default: 'off'
    },
    autofocus: Boolean,
    fullWidth: Boolean
  },
  emits: ['update:modelValue'],
  data: function data() {
    return {
      hasFocus: false
    };
  },
  mounted: function mounted() {
    if (this.autofocus) {
      this.$el.querySelector('input').focus();
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TextField.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TextField.vue



TextFieldvue_type_script_lang_ts.render = TextFieldvue_type_template_id_53914a76_render

/* harmony default export */ var TextField = (TextFieldvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupCreate.vue?vue&type=script&lang=ts





/* harmony default export */ var GroupCreatevue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ContentBlock: external_CoreHome_["ContentBlock"],
    TextField: TextField,
    SaveButton: external_CorePluginsAdmin_["SaveButton"]
  },
  emits: ['created', 'cancel'],
  data: function data() {
    return {
      groupName: '',
      isCreatingGroup: false
    };
  },
  methods: {
    createGroup: function createGroup() {
      var _this = this;

      var groupName = this.groupName.trim();

      if (!groupName || this.isCreatingGroup) {
        return;
      }

      this.isCreatingGroup = true;
      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.createGroup'
      }, {
        groupName: groupName
      }, {
        errorElement: '#ajaxErrorCreateGroup'
      }).then(function (group) {
        notifySuccess('groupPermissionsGroupCreated', 'GroupPermissions_GroupCreated', group.name);

        _this.$emit('created', group);
      }).finally(function () {
        _this.isCreatingGroup = false;
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupCreate.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupCreate.vue



GroupCreatevue_type_script_lang_ts.render = GroupCreatevue_type_template_id_2028ea89_render

/* harmony default export */ var GroupCreate = (GroupCreatevue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupEdit.vue?vue&type=template&id=8054bbfa

var GroupEditvue_type_template_id_8054bbfa_hoisted_1 = {
  class: "row"
};
var GroupEditvue_type_template_id_8054bbfa_hoisted_2 = {
  class: "col s12 m3 entityList"
};
var GroupEditvue_type_template_id_8054bbfa_hoisted_3 = {
  class: "listCircle"
};
var GroupEditvue_type_template_id_8054bbfa_hoisted_4 = ["data-tab"];
var GroupEditvue_type_template_id_8054bbfa_hoisted_5 = ["onClick"];
var GroupEditvue_type_template_id_8054bbfa_hoisted_6 = {
  key: 0,
  class: "groupPermissionsCount"
};
var GroupEditvue_type_template_id_8054bbfa_hoisted_7 = {
  class: "entityCancel"
};

var GroupEditvue_type_template_id_8054bbfa_hoisted_8 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-arrow-left"
}, null, -1);

var GroupEditvue_type_template_id_8054bbfa_hoisted_9 = {
  class: "col s12 m9 visibleTab"
};
function GroupEditvue_type_template_id_8054bbfa_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_GroupMembers = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupMembers");

  var _component_GroupWebsiteAccess = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupWebsiteAccess");

  var _component_GroupSettings = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("GroupSettings");

  var _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_ContentBlock, {
    class: "groupPermissionsEditGroup",
    "content-title": _ctx.translate('GroupPermissions_EditGroup', _ctx.group.name)
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupEditvue_type_template_id_8054bbfa_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupEditvue_type_template_id_8054bbfa_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", GroupEditvue_type_template_id_8054bbfa_hoisted_3, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.menu, function (item) {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
          key: item.tab,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])({
            active: _ctx.activeTab === item.tab
          }),
          "data-tab": item.tab
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
          href: "",
          onClick: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.$emit('change-tab', item.tab);
          }, ["prevent"])
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(item.title) + " ", 1), item.count !== undefined ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", GroupEditvue_type_template_id_8054bbfa_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(item.count), 1)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)], 8, GroupEditvue_type_template_id_8054bbfa_hoisted_5)], 10, GroupEditvue_type_template_id_8054bbfa_hoisted_4);
      }), 128))]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupEditvue_type_template_id_8054bbfa_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
        href: "",
        class: "entityCancelLink groupPermissionsBackToGroups",
        onClick: _cache[0] || (_cache[0] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
          return _ctx.$emit('back');
        }, ["prevent"]))
      }, [GroupEditvue_type_template_id_8054bbfa_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_BackToGroups')), 1)])])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupEditvue_type_template_id_8054bbfa_hoisted_9, [_ctx.activeTab === 'members' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupMembers, {
        key: 0,
        group: _ctx.group,
        onChanged: _cache[1] || (_cache[1] = function ($event) {
          return _ctx.$emit('changed');
        }),
        onInvite: _cache[2] || (_cache[2] = function ($event) {
          return _ctx.$emit('invite', _ctx.group);
        })
      }, null, 8, ["group"])) : _ctx.activeTab === 'access' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupWebsiteAccess, {
        key: 1,
        group: _ctx.group,
        onChanged: _cache[3] || (_cache[3] = function ($event) {
          return _ctx.$emit('changed');
        })
      }, null, 8, ["group"])) : _ctx.activeTab === 'settings' ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_GroupSettings, {
        key: 2,
        group: _ctx.group,
        onRenamed: _cache[4] || (_cache[4] = function ($event) {
          return _ctx.$emit('renamed', $event);
        }),
        onDelete: _cache[5] || (_cache[5] = function ($event) {
          return _ctx.$emit('delete', _ctx.group);
        })
      }, null, 8, ["group"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])])];
    }),
    _: 1
  }, 8, ["content-title"]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupEdit.vue?vue&type=template&id=8054bbfa

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupMembers.vue?vue&type=template&id=ffb4f3de

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_1 = {
  class: "groupPermissionsMembers"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_2 = {
  class: "groupPermissionsAddMember"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_3 = {
  class: "groupPermissionsLabel",
  for: "groupPermissionsAddMemberSelect"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_4 = {
  class: "groupPermissionsInlineForm"
};

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_5 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-email"
}, null, -1);

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_6 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorAddMember"
}, null, -1);

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_7 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorManageGroupMembers"
}, null, -1);

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_8 = {
  class: "actions-cell-header"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_9 = {
  key: 0
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_10 = {
  colspan: "4"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_11 = {
  key: 1,
  class: "groupPermissionsEmpty"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_12 = {
  colspan: "4"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_13 = {
  class: "login"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_14 = {
  class: "email"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_15 = {
  class: "status"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_16 = {
  class: "center actions-cell"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_17 = ["title", "onClick"];

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_18 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete"
}, null, -1);

var GroupMembersvue_type_template_id_ffb4f3de_hoisted_19 = [GroupMembersvue_type_template_id_ffb4f3de_hoisted_18];
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_20 = {
  class: "ui-confirm",
  id: "confirmRemoveMember",
  ref: "confirmRemoveMember"
};
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_21 = ["value"];
var GroupMembersvue_type_template_id_ffb4f3de_hoisted_22 = ["value"];
function GroupMembersvue_type_template_id_ffb4f3de_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_multiselect = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("multiselect");

  var _component_SaveButton = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SaveButton");

  var _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");

  var _directive_content_table = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveDirective"])("content-table");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", GroupMembersvue_type_template_id_ffb4f3de_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupMembersvue_type_template_id_ffb4f3de_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", GroupMembersvue_type_template_id_ffb4f3de_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_AddUserToGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupMembersvue_type_template_id_ffb4f3de_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_multiselect, {
    id: "groupPermissionsAddMemberSelect",
    class: "groupPermissionsUserSelect",
    options: _ctx.availableUsers,
    "custom-label": _ctx.userLabel,
    "track-by": "login",
    placeholder: _ctx.translate('GroupPermissions_SelectNewUser'),
    "select-label": '',
    "deselect-label": '',
    "selected-label": '',
    modelValue: _ctx.selectedUser,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
      return _ctx.selectedUser = $event;
    })
  }, {
    noResult: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoUsersFound')), 1)];
    }),
    noOptions: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoUsersFound')), 1)];
    }),
    _: 1
  }, 8, ["options", "custom-label", "placeholder", "modelValue"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SaveButton, {
    class: "groupPermissionsAddMemberButton",
    value: _ctx.translate('GroupPermissions_AddUserToGroupButton'),
    saving: _ctx.isAddingMember,
    disabled: !_ctx.selectedUser,
    onConfirm: _cache[1] || (_cache[1] = function ($event) {
      return _ctx.addMember();
    })
  }, null, 8, ["value", "saving", "disabled"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: "",
    class: "groupPermissionsInviteIntoGroup",
    onClick: _cache[2] || (_cache[2] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.$emit('invite');
    }, ["prevent"]))
  }, [GroupMembersvue_type_template_id_ffb4f3de_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_InviteUserIntoGroup')), 1)])]), GroupMembersvue_type_template_id_ffb4f3de_hoisted_6, GroupMembersvue_type_template_id_ffb4f3de_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["groupPermissionsMembersTable", {
      loading: _ctx.isLoading
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Username')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_Email')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_Status')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupMembersvue_type_template_id_ffb4f3de_hoisted_8, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Actions')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [_ctx.isLoading && !_ctx.members.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupMembersvue_type_template_id_ffb4f3de_hoisted_9, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: true
  })])])) : !_ctx.members.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupMembersvue_type_template_id_ffb4f3de_hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_12, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoMembers')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.members, function (login) {
    var _ctx$usersByLogin$log;

    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: login,
      class: "groupPermissionsMemberRow"
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_13, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(login), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_14, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(((_ctx$usersByLogin$log = _ctx.usersByLogin[login]) === null || _ctx$usersByLogin$log === void 0 ? void 0 : _ctx$usersByLogin$log.email) || ''), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
      class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(_ctx.statusClass(login))
    }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.statusText(login)), 3)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupMembersvue_type_template_id_ffb4f3de_hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      class: "table-action groupPermissionsRemoveMember",
      title: _ctx.translate('GroupPermissions_RemoveFromGroup'),
      onClick: function onClick($event) {
        return _ctx.confirmRemoveMember(login);
      }
    }, GroupMembersvue_type_template_id_ffb4f3de_hoisted_19, 8, GroupMembersvue_type_template_id_ffb4f3de_hoisted_17)])]);
  }), 128))])], 2), [[_directive_content_table]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupMembersvue_type_template_id_ffb4f3de_hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmRemoveMemberText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, GroupMembersvue_type_template_id_ffb4f3de_hoisted_21), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, GroupMembersvue_type_template_id_ffb4f3de_hoisted_22)], 512)]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupMembers.vue?vue&type=template&id=ffb4f3de

// CONCATENATED MODULE: ./plugins/GroupPermissions/node_modules/vue-multiselect/dist/vue-multiselect.esm.js
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



function isEmpty(opt) {
  if (opt === 0) return false;
  if (Array.isArray(opt) && opt.length === 0) return true;
  return !opt;
}

function not(fun) {
  return function () {
    return !fun.apply(void 0, arguments);
  };
}

function includes(str, query) {
  /* istanbul ignore else */
  if (str === undefined) str = 'undefined';
  if (str === null) str = 'null';
  if (str === false) str = 'false';
  var text = str.toString().toLowerCase();
  return text.indexOf(query.trim()) !== -1;
}

function stripGroups(options) {
  return options.filter(function (option) {
    return !option.$isLabel;
  });
}

function flattenOptions(values, label) {
  return function (options) {
    return options.reduce(function (prev, curr) {
      /* istanbul ignore else */
      if (curr[values] && curr[values].length) {
        prev.push({
          $groupLabel: curr[label],
          $isLabel: true
        });
        return prev.concat(curr[values]);
      }

      return prev;
    }, []);
  };
}

var flow = function flow() {
  for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return function (x) {
    return fns.reduce(function (v, f) {
      return f(v);
    }, x);
  };
};

var multiselectMixin = {
  data: function data() {
    return {
      search: '',
      isOpen: false,
      preferredOpenDirection: 'below',
      optimizedHeight: this.maxHeight
    };
  },
  props: {
    /**
     * Decide whether to filter the results based on search query.
     * Useful for async filtering, where we search through more complex data.
     * @type {Boolean}
     */
    internalSearch: {
      type: Boolean,
      default: true
    },

    /**
     * Array of available options: Objects, Strings or Integers.
     * If array of objects, visible label will default to option.label.
     * If `labal` prop is passed, label will equal option['label']
     * @type {Array}
     */
    options: {
      type: Array,
      required: true
    },

    /**
     * Equivalent to the `multiple` attribute on a `<select>` input.
     * @default false
     * @type {Boolean}
     */
    multiple: {
      type: Boolean,
      default: false
    },

    /**
     * Key to compare objects
     * @default 'id'
     * @type {String}
     */
    trackBy: {
      type: String
    },

    /**
     * Label to look for in option Object
     * @default 'label'
     * @type {String}
     */
    label: {
      type: String
    },

    /**
     * Enable/disable search in options
     * @default true
     * @type {Boolean}
     */
    searchable: {
      type: Boolean,
      default: true
    },

    /**
     * Clear the search input after `)
     * @default true
     * @type {Boolean}
     */
    clearOnSelect: {
      type: Boolean,
      default: true
    },

    /**
     * Hide already selected options
     * @default false
     * @type {Boolean}
     */
    hideSelected: {
      type: Boolean,
      default: false
    },

    /**
     * Equivalent to the `placeholder` attribute on a `<select>` input.
     * @default 'Select option'
     * @type {String}
     */
    placeholder: {
      type: String,
      default: 'Select option'
    },

    /**
     * Allow to remove all selected values
     * @default true
     * @type {Boolean}
     */
    allowEmpty: {
      type: Boolean,
      default: true
    },

    /**
     * Reset this.internalValue, this.search after this.internalValue changes.
     * Useful if want to create a stateless dropdown.
     * @default false
     * @type {Boolean}
     */
    resetAfter: {
      type: Boolean,
      default: false
    },

    /**
     * Enable/disable closing after selecting an option
     * @default true
     * @type {Boolean}
     */
    closeOnSelect: {
      type: Boolean,
      default: true
    },

    /**
     * Function to interpolate the custom label
     * @default false
     * @type {Function}
     */
    customLabel: {
      type: Function,
      default: function _default(option, label) {
        if (isEmpty(option)) return '';
        return label ? option[label] : option;
      }
    },

    /**
     * Disable / Enable tagging
     * @default false
     * @type {Boolean}
     */
    taggable: {
      type: Boolean,
      default: false
    },

    /**
     * String to show when highlighting a potential tag
     * @default 'Press enter to create a tag'
     * @type {String}
    */
    tagPlaceholder: {
      type: String,
      default: 'Press enter to create a tag'
    },

    /**
     * By default new tags will appear above the search results.
     * Changing to 'bottom' will revert this behaviour
     * and will proritize the search results
     * @default 'top'
     * @type {String}
    */
    tagPosition: {
      type: String,
      default: 'top'
    },

    /**
     * Number of allowed selected options. No limit if 0.
     * @default 0
     * @type {Number}
    */
    max: {
      type: [Number, Boolean],
      default: false
    },

    /**
     * Will be passed with all events as second param.
     * Useful for identifying events origin.
     * @default null
     * @type {String|Integer}
    */
    id: {
      default: null
    },

    /**
     * Limits the options displayed in the dropdown
     * to the first X options.
     * @default 1000
     * @type {Integer}
    */
    optionsLimit: {
      type: Number,
      default: 1000
    },

    /**
     * Name of the property containing
     * the group values
     * @default 1000
     * @type {String}
    */
    groupValues: {
      type: String
    },

    /**
     * Name of the property containing
     * the group label
     * @default 1000
     * @type {String}
    */
    groupLabel: {
      type: String
    },

    /**
     * Allow to select all group values
     * by selecting the group label
     * @default false
     * @type {Boolean}
     */
    groupSelect: {
      type: Boolean,
      default: false
    },

    /**
     * Array of keyboard keys to block
     * when selecting
     * @default 1000
     * @type {String}
    */
    blockKeys: {
      type: Array,
      default: function _default() {
        return [];
      }
    },

    /**
     * Prevent from wiping up the search value
     * @default false
     * @type {Boolean}
    */
    preserveSearch: {
      type: Boolean,
      default: false
    },

    /**
     * Select 1st options if value is empty
     * @default false
     * @type {Boolean}
    */
    preselectFirst: {
      type: Boolean,
      default: false
    },

    /**
     * Prevent autofocus
     * @default false
     * @type {Boolean}
     */
    preventAutofocus: {
      type: Boolean,
      default: false
    },

    /**
     * Allows a custom function for sorting search/filtered results.
     * @default null
     * @type {Function}
     */
    filteringSortFunc: {
      type: Function,
      default: null
    }
  },
  mounted: function mounted() {
    /* istanbul ignore else */
    if (!this.multiple && this.max) {
      console.warn('[Vue-Multiselect warn]: Max prop should not be used when prop Multiple equals false.');
    }

    if (this.preselectFirst && !this.internalValue.length && this.options.length) {
      this.select(this.filteredOptions[0]);
    }
  },
  computed: {
    internalValue: function internalValue() {
      return this.modelValue || this.modelValue === 0 ? Array.isArray(this.modelValue) ? this.modelValue : [this.modelValue] : [];
    },
    filteredOptions: function filteredOptions() {
      var search = this.search || '';
      var normalizedSearch = search.toLowerCase().trim();
      var options = this.options.concat();
      /* istanbul ignore else */

      if (this.internalSearch) {
        options = this.groupValues ? this.filterAndFlat(options, normalizedSearch, this.label) : this.filterOptions(options, normalizedSearch, this.label, this.customLabel);
      } else {
        options = this.groupValues ? flattenOptions(this.groupValues, this.groupLabel)(options) : options;
      }

      options = this.hideSelected ? options.filter(not(this.isSelected)) : options;
      /* istanbul ignore else */

      if (this.taggable && normalizedSearch.length && !this.isExistingOption(normalizedSearch)) {
        if (this.tagPosition === 'bottom') {
          options.push({
            isTag: true,
            label: search
          });
        } else {
          options.unshift({
            isTag: true,
            label: search
          });
        }
      }

      return options.slice(0, this.optionsLimit);
    },
    valueKeys: function valueKeys() {
      var _this = this;

      if (this.trackBy) {
        return this.internalValue.map(function (element) {
          return element[_this.trackBy];
        });
      } else {
        return this.internalValue;
      }
    },
    optionKeys: function optionKeys() {
      var _this2 = this;

      var options = this.groupValues ? this.flatAndStrip(this.options) : this.options;
      return options.map(function (element) {
        return _this2.customLabel(element, _this2.label).toString().toLowerCase();
      });
    },
    currentOptionLabel: function currentOptionLabel() {
      return this.multiple ? this.searchable ? '' : this.placeholder : this.internalValue.length ? this.getOptionLabel(this.internalValue[0]) : this.searchable ? '' : this.placeholder;
    }
  },
  watch: {
    internalValue: {
      handler: function handler() {
        /* istanbul ignore else */
        if (this.resetAfter && this.internalValue.length) {
          this.search = '';
          this.$emit('update:modelValue', this.multiple ? [] : null);
        }
      },
      deep: true
    },
    search: function search() {
      this.$emit('search-change', this.search);
    }
  },
  emits: ['open', 'search-change', 'close', 'select', 'update:modelValue', 'remove', 'tag'],
  methods: {
    /**
     * Returns the internalValue in a way it can be emited to the parent
     * @returns {Object||Array||String||Integer}
     */
    getValue: function getValue() {
      return this.multiple ? this.internalValue : this.internalValue.length === 0 ? null : this.internalValue[0];
    },

    /**
     * Filters and then flattens the options list
     * @param  {Array}
     * @return {Array} returns a filtered and flat options list
     */
    filterAndFlat: function filterAndFlat(options, search, label) {
      return flow(this.filterGroups(search, label, this.groupValues, this.groupLabel, this.customLabel), flattenOptions(this.groupValues, this.groupLabel))(options);
    },

    /**
     * Flattens and then strips the group labels from the options list
     * @param  {Array}
     * @return {Array} returns a flat options list without group labels
     */
    flatAndStrip: function flatAndStrip(options) {
      return flow(flattenOptions(this.groupValues, this.groupLabel), stripGroups)(options);
    },

    /**
     * Updates the search value
     * @param  {String}
     */
    updateSearch: function updateSearch(query) {
      this.search = query;
    },

    /**
     * Finds out if the given query is already present
     * in the available options
     * @param  {String}
     * @return {Boolean} returns true if element is available
     */
    isExistingOption: function isExistingOption(query) {
      return !this.options ? false : this.optionKeys.indexOf(query) > -1;
    },

    /**
     * Finds out if the given element is already present
     * in the result value
     * @param  {Object||String||Integer} option passed element to check
     * @returns {Boolean} returns true if element is selected
     */
    isSelected: function isSelected(option) {
      var opt = this.trackBy ? option[this.trackBy] : option;
      return this.valueKeys.indexOf(opt) > -1;
    },

    /**
     * Finds out if the given option is disabled
     * @param  {Object||String||Integer} option passed element to check
     * @returns {Boolean} returns true if element is disabled
     */
    isOptionDisabled: function isOptionDisabled(option) {
      return !!option.$isDisabled;
    },

    /**
     * Returns empty string when options is null/undefined
     * Returns tag query if option is tag.
     * Returns the customLabel() results and casts it to string.
     *
     * @param  {Object||String||Integer} Passed option
     * @returns {Object||String}
     */
    getOptionLabel: function getOptionLabel(option) {
      if (isEmpty(option)) return '';
      /* istanbul ignore else */

      if (option.isTag) return option.label;
      /* istanbul ignore else */

      if (option.$isLabel) return option.$groupLabel;
      var label = this.customLabel(option, this.label);
      /* istanbul ignore else */

      if (isEmpty(label)) return '';
      return label;
    },

    /**
     * Add the given option to the list of selected options
     * or sets the option as the selected option.
     * If option is already selected -> remove it from the results.
     *
     * @param  {Object||String||Integer} option to select/deselect
     * @param  {Boolean} block removing
     */
    select: function select(option, key) {
      /* istanbul ignore else */
      if (option.$isLabel && this.groupSelect) {
        this.selectGroup(option);
        return;
      }

      if (this.blockKeys.indexOf(key) !== -1 || this.disabled || option.$isDisabled || option.$isLabel) return;
      /* istanbul ignore else */

      if (this.max && this.multiple && this.internalValue.length === this.max) return;
      /* istanbul ignore else */

      if (key === 'Tab' && !this.pointerDirty) return;

      if (option.isTag) {
        this.$emit('tag', option.label, this.id);
        this.search = '';
        if (this.closeOnSelect && !this.multiple) this.deactivate();
      } else {
        var isSelected = this.isSelected(option);

        if (isSelected) {
          if (key !== 'Tab') this.removeElement(option);
          return;
        }

        if (this.multiple) {
          this.$emit('update:modelValue', this.internalValue.concat([option]));
        } else {
          this.$emit('update:modelValue', option);
        }

        this.$emit('select', option, this.id);
        /* istanbul ignore else */

        if (this.clearOnSelect) this.search = '';
      }
      /* istanbul ignore else */


      if (this.closeOnSelect) this.deactivate();
    },

    /**
     * Add the given group options to the list of selected options
     * If all group optiona are already selected -> remove it from the results.
     *
     * @param  {Object||String||Integer} group to select/deselect
     */
    selectGroup: function selectGroup(selectedGroup) {
      var _this3 = this;

      var group = this.options.find(function (option) {
        return option[_this3.groupLabel] === selectedGroup.$groupLabel;
      });
      if (!group) return;

      if (this.wholeGroupSelected(group)) {
        this.$emit('remove', group[this.groupValues], this.id);
        var groupValues = this.trackBy ? group[this.groupValues].map(function (val) {
          return val[_this3.trackBy];
        }) : group[this.groupValues];
        var newValue = this.internalValue.filter(function (option) {
          return groupValues.indexOf(_this3.trackBy ? option[_this3.trackBy] : option) === -1;
        });
        this.$emit('update:modelValue', newValue);
      } else {
        var optionsToAdd = group[this.groupValues].filter(function (option) {
          return !(_this3.isOptionDisabled(option) || _this3.isSelected(option));
        }); // if max is defined then just select options respecting max

        if (this.max) {
          optionsToAdd.splice(this.max - this.internalValue.length);
        }

        this.$emit('select', optionsToAdd, this.id);
        this.$emit('update:modelValue', this.internalValue.concat(optionsToAdd));
      }

      if (this.closeOnSelect) this.deactivate();
    },

    /**
     * Helper to identify if all values in a group are selected
     *
     * @param {Object} group to validated selected values against
     */
    wholeGroupSelected: function wholeGroupSelected(group) {
      var _this4 = this;

      return group[this.groupValues].every(function (option) {
        return _this4.isSelected(option) || _this4.isOptionDisabled(option);
      });
    },

    /**
     * Helper to identify if all values in a group are disabled
     *
     * @param {Object} group to check for disabled values
     */
    wholeGroupDisabled: function wholeGroupDisabled(group) {
      return group[this.groupValues].every(this.isOptionDisabled);
    },

    /**
     * Removes the given option from the selected options.
     * Additionally checks this.allowEmpty prop if option can be removed when
     * it is the last selected option.
     *
     * @param  {type} option description
     * @return {type}        description
     */
    removeElement: function removeElement(option) {
      var shouldClose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      /* istanbul ignore else */
      if (this.disabled) return;
      /* istanbul ignore else */

      if (option.$isDisabled) return;
      /* istanbul ignore else */

      if (!this.allowEmpty && this.internalValue.length <= 1) {
        this.deactivate();
        return;
      }

      var index = _typeof(option) === 'object' ? this.valueKeys.indexOf(option[this.trackBy]) : this.valueKeys.indexOf(option);

      if (this.multiple) {
        var newValue = this.internalValue.slice(0, index).concat(this.internalValue.slice(index + 1));
        this.$emit('update:modelValue', newValue);
      } else {
        this.$emit('update:modelValue', null);
      }

      this.$emit('remove', option, this.id);
      /* istanbul ignore else */

      if (this.closeOnSelect && shouldClose) this.deactivate();
    },

    /**
     * Calls this.removeElement() with the last element
     * from this.internalValue (selected element Array)
     *
     * @fires this#removeElement
     */
    removeLastElement: function removeLastElement() {
      /* istanbul ignore else */
      if (this.blockKeys.indexOf('Delete') !== -1) return;
      /* istanbul ignore else */

      if (this.search.length === 0 && Array.isArray(this.internalValue) && this.internalValue.length) {
        this.removeElement(this.internalValue[this.internalValue.length - 1], false);
      }
    },

    /**
     * Opens the multiselect’s dropdown.
     * Sets this.isOpen to TRUE
     */
    activate: function activate() {
      var _this5 = this;

      /* istanbul ignore else */
      if (this.isOpen || this.disabled) return;
      this.adjustPosition();
      /* istanbul ignore else  */

      if (this.groupValues && this.pointer === 0 && this.filteredOptions.length) {
        this.pointer = 1;
      }

      this.isOpen = true;
      /* istanbul ignore else  */

      if (this.searchable) {
        if (!this.preserveSearch) this.search = '';
        if (!this.preventAutofocus) this.$nextTick(function () {
          return _this5.$refs.search && _this5.$refs.search.focus();
        });
      } else if (!this.preventAutofocus) {
        if (typeof this.$el !== 'undefined') this.$el.focus();
      }

      this.$emit('open', this.id);
    },

    /**
     * Closes the multiselect’s dropdown.
     * Sets this.isOpen to FALSE
     */
    deactivate: function deactivate() {
      /* istanbul ignore else */
      if (!this.isOpen) return;
      this.isOpen = false;
      /* istanbul ignore else  */

      if (this.searchable) {
        if (this.$refs.search !== null && typeof this.$refs.search !== 'undefined') this.$refs.search.blur();
      } else {
        if (typeof this.$el !== 'undefined') this.$el.blur();
      }

      if (!this.preserveSearch) this.search = '';
      this.$emit('close', this.getValue(), this.id);
    },

    /**
     * Call this.activate() or this.deactivate()
     * depending on this.isOpen value.
     *
     * @fires this#activate || this#deactivate
     * @property {Boolean} isOpen indicates if dropdown is open
     */
    toggle: function toggle() {
      this.isOpen ? this.deactivate() : this.activate();
    },

    /**
     * Updates the hasEnoughSpace variable used for
     * detecting where to expand the dropdown
     */
    adjustPosition: function adjustPosition() {
      if (typeof window === 'undefined') return;
      var spaceAbove = this.$el.getBoundingClientRect().top;
      var spaceBelow = window.innerHeight - this.$el.getBoundingClientRect().bottom;
      var hasEnoughSpaceBelow = spaceBelow > this.maxHeight;

      if (hasEnoughSpaceBelow || spaceBelow > spaceAbove || this.openDirection === 'below' || this.openDirection === 'bottom') {
        this.preferredOpenDirection = 'below';
        this.optimizedHeight = Math.min(spaceBelow - 40, this.maxHeight);
      } else {
        this.preferredOpenDirection = 'above';
        this.optimizedHeight = Math.min(spaceAbove - 40, this.maxHeight);
      }
    },

    /**
     * Filters and sorts the options ready for selection
     * @param {Array} options
     * @param {String} search
     * @param {String} label
     * @param {Function} customLabel
     * @returns {Array}
     */
    filterOptions: function filterOptions(options, search, label, customLabel) {
      var _this6 = this;

      return search ? options.filter(function (option) {
        return includes(customLabel(option, label), search);
      }).sort(function (a, b) {
        if (typeof _this6.filteringSortFunc === 'function') {
          return _this6.filteringSortFunc(a, b);
        }

        return customLabel(a, label).length - customLabel(b, label).length;
      }) : options;
    },

    /**
     *
     * @param {String} search
     * @param {String} label
     * @param {String} values
     * @param {String} groupLabel
     * @param {function} customLabel
     * @returns {function(*): *}
     */
    filterGroups: function filterGroups(search, label, values, groupLabel, customLabel) {
      var _this7 = this;

      return function (groups) {
        return groups.map(function (group) {
          var _ref;

          /* istanbul ignore else */
          if (!group[values]) {
            console.warn('Options passed to vue-multiselect do not contain groups, despite the config.');
            return [];
          }

          var groupOptions = _this7.filterOptions(group[values], search, label, customLabel);

          return groupOptions.length ? (_ref = {}, _defineProperty(_ref, groupLabel, group[groupLabel]), _defineProperty(_ref, values, groupOptions), _ref) : [];
        });
      };
    }
  }
};
var pointerMixin = {
  data: function data() {
    return {
      pointer: 0,
      pointerDirty: false
    };
  },
  props: {
    /**
     * Enable/disable highlighting of the pointed value.
     * @type {Boolean}
     * @default true
     */
    showPointer: {
      type: Boolean,
      default: true
    },
    optionHeight: {
      type: Number,
      default: 40
    }
  },
  computed: {
    pointerPosition: function pointerPosition() {
      return this.pointer * this.optionHeight;
    },
    visibleElements: function visibleElements() {
      return this.optimizedHeight / this.optionHeight;
    }
  },
  watch: {
    filteredOptions: function filteredOptions() {
      this.pointerAdjust();
    },
    isOpen: function isOpen() {
      this.pointerDirty = false;
    },
    pointer: function pointer() {
      this.$refs.search && this.$refs.search.setAttribute('aria-activedescendant', this.id + '-' + this.pointer.toString());
    }
  },
  methods: {
    optionHighlight: function optionHighlight(index, option) {
      return {
        'multiselect__option--highlight': index === this.pointer && this.showPointer,
        'multiselect__option--selected': this.isSelected(option)
      };
    },
    groupHighlight: function groupHighlight(index, selectedGroup) {
      var _this8 = this;

      if (!this.groupSelect) {
        return ['multiselect__option--disabled', {
          'multiselect__option--group': selectedGroup.$isLabel
        }];
      }

      var group = this.options.find(function (option) {
        return option[_this8.groupLabel] === selectedGroup.$groupLabel;
      });
      return group && !this.wholeGroupDisabled(group) ? ['multiselect__option--group', {
        'multiselect__option--highlight': index === this.pointer && this.showPointer
      }, {
        'multiselect__option--group-selected': this.wholeGroupSelected(group)
      }] : 'multiselect__option--disabled';
    },
    addPointerElement: function addPointerElement() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Enter',
          key = _ref2.key;

      /* istanbul ignore else */
      if (this.filteredOptions.length > 0) {
        this.select(this.filteredOptions[this.pointer], key);
      }

      this.pointerReset();
    },
    pointerForward: function pointerForward() {
      /* istanbul ignore else */
      if (this.pointer < this.filteredOptions.length - 1) {
        var _this$$refs$list;

        this.pointer++;
        /* istanbul ignore next */

        if (((_this$$refs$list = this.$refs.list) === null || _this$$refs$list === void 0 ? void 0 : _this$$refs$list.scrollTop) <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight;
        }
        /* istanbul ignore else */


        if (this.filteredOptions[this.pointer] && this.filteredOptions[this.pointer].$isLabel && !this.groupSelect) this.pointerForward();
      }

      this.pointerDirty = true;
    },
    pointerBackward: function pointerBackward() {
      if (this.pointer > 0) {
        var _this$$refs$list2;

        this.pointer--;
        /* istanbul ignore else */

        if (((_this$$refs$list2 = this.$refs.list) === null || _this$$refs$list2 === void 0 ? void 0 : _this$$refs$list2.scrollTop) >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition;
        }
        /* istanbul ignore else */


        if (this.filteredOptions[this.pointer] && this.filteredOptions[this.pointer].$isLabel && !this.groupSelect) this.pointerBackward();
      } else {
        /* istanbul ignore else */
        if (this.filteredOptions[this.pointer] && this.filteredOptions[0].$isLabel && !this.groupSelect) this.pointerForward();
      }

      this.pointerDirty = true;
    },
    pointerReset: function pointerReset() {
      /* istanbul ignore else */
      if (!this.closeOnSelect) return;
      this.pointer = 0;
      /* istanbul ignore else */

      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0;
      }
    },
    pointerAdjust: function pointerAdjust() {
      /* istanbul ignore else */
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length ? this.filteredOptions.length - 1 : 0;
      }

      if (this.filteredOptions.length > 0 && this.filteredOptions[this.pointer] && this.filteredOptions[this.pointer].$isLabel && !this.groupSelect) {
        this.pointerForward();
      }
    },
    pointerSet: function pointerSet(index) {
      this.pointer = index;
      this.pointerDirty = true;
    }
  }
};
var script = {
  name: 'vue-multiselect',
  mixins: [multiselectMixin, pointerMixin],
  compatConfig: {
    MODE: 3,
    ATTR_ENUMERATED_COERCION: false
  },
  props: {
    /**
       * name attribute to match optional label element
       * @default ''
       * @type {String}
       */
    name: {
      type: String,
      default: ''
    },

    /**
       * Presets the selected options value.
       * @type {Object||Array||String||Integer}
       */
    modelValue: {
      type: null,
      default: function _default() {
        return [];
      }
    },

    /**
       * String to show when pointing to an option
       * @default 'Press enter to select'
       * @type {String}
       */
    selectLabel: {
      type: String,
      default: 'Press enter to select'
    },

    /**
       * String to show when pointing to an option
       * @default 'Press enter to select'
       * @type {String}
       */
    selectGroupLabel: {
      type: String,
      default: 'Press enter to select group'
    },

    /**
       * String to show next to selected option
       * @default 'Selected'
       * @type {String}
       */
    selectedLabel: {
      type: String,
      default: 'Selected'
    },

    /**
       * String to show when pointing to an already selected option
       * @default 'Press enter to remove'
       * @type {String}
       */
    deselectLabel: {
      type: String,
      default: 'Press enter to remove'
    },

    /**
       * String to show when pointing to an already selected option
       * @default 'Press enter to remove'
       * @type {String}
       */
    deselectGroupLabel: {
      type: String,
      default: 'Press enter to deselect group'
    },

    /**
       * Decide whether to show pointer labels
       * @default true
       * @type {Boolean}
       */
    showLabels: {
      type: Boolean,
      default: true
    },

    /**
       * Limit the display of selected options. The rest will be hidden within the limitText string.
       * @default 99999
       * @type {Integer}
       */
    limit: {
      type: Number,
      default: 99999
    },

    /**
       * Sets maxHeight style value of the dropdown
       * @default 300
       * @type {Integer}
       */
    maxHeight: {
      type: Number,
      default: 300
    },

    /**
       * Function that process the message shown when selected
       * elements pass the defined limit.
       * @default 'and * more'
       * @param {Int} count Number of elements more than limit
       * @type {Function}
       */
    limitText: {
      type: Function,
      default: function _default(count) {
        return "and ".concat(count, " more");
      }
    },

    /**
       * Set true to trigger the loading spinner.
       * @default False
       * @type {Boolean}
       */
    loading: {
      type: Boolean,
      default: false
    },

    /**
       * Disables the multiselect if true.
       * @default false
       * @type {Boolean}
       */
    disabled: {
      type: Boolean,
      default: false
    },

    /**
     * Enables search input's spellcheck if true.
     * @default false
     * @type {Boolean}
     */
    spellcheck: {
      type: Boolean,
      default: false
    },

    /**
       * Fixed opening direction
       * @default ''
       * @type {String}
       */
    openDirection: {
      type: String,
      default: ''
    },

    /**
       * Shows slot with message about empty options
       * @default true
       * @type {Boolean}
       */
    showNoOptions: {
      type: Boolean,
      default: true
    },
    showNoResults: {
      type: Boolean,
      default: true
    },
    tabindex: {
      type: Number,
      default: 0
    },

    /**
     * Adds Required attribute to the input element when there is no value selected
     * @default false
     * @type {Boolean}
     */
    required: {
      type: Boolean,
      default: false
    },

    /**
     * Uses Vue Teleport's feature. Teleports the open dropdown to the bottom of the teleportTarget element
     * @default false
     * @type {Boolean}
     */
    useTeleport: {
      type: Boolean,
      default: false
    },

    /**
     * Target selector for teleporting the dropdown element
     * @default 'body'
     * @type {String|Object}
     */
    teleportTarget: {
      type: [String, Object],
      default: 'body'
    },

    /**
     * Classes to apply to the `multiselect__content-wrapper` element. This element is a teleport element (when enabled), so can be used to specifically target
     * the teleported element
     */
    contentWrapperClass: {
      type: [String, Array, Object],
      default: ''
    }
  },
  data: function data() {
    return {
      dropdownStyles: {},
      ready: false
    };
  },
  computed: {
    hasOptionGroup: function hasOptionGroup() {
      return this.groupValues && this.groupLabel && this.groupSelect;
    },
    isSingleLabelVisible: function isSingleLabelVisible() {
      return (this.singleValue || this.singleValue === 0) && (!this.isOpen || !this.searchable) && !this.visibleValues.length;
    },
    isPlaceholderVisible: function isPlaceholderVisible() {
      return !this.internalValue.length && (!this.searchable || !this.isOpen);
    },
    visibleValues: function visibleValues() {
      return this.multiple ? this.internalValue.slice(0, this.limit) : [];
    },
    singleValue: function singleValue() {
      return this.internalValue[0];
    },
    deselectLabelText: function deselectLabelText() {
      return this.showLabels ? this.deselectLabel : '';
    },
    deselectGroupLabelText: function deselectGroupLabelText() {
      return this.showLabels ? this.deselectGroupLabel : '';
    },
    selectLabelText: function selectLabelText() {
      return this.showLabels ? this.selectLabel : '';
    },
    selectGroupLabelText: function selectGroupLabelText() {
      return this.showLabels ? this.selectGroupLabel : '';
    },
    selectedLabelText: function selectedLabelText() {
      return this.showLabels ? this.selectedLabel : '';
    },
    inputStyle: function inputStyle() {
      if (this.searchable || this.multiple && this.modelValue && this.modelValue.length) {
        // Hide input by setting the width to 0 allowing it to receive focus
        return this.isOpen ? {
          width: '100%'
        } : {
          width: '0',
          position: 'absolute',
          padding: '0'
        };
      }

      return '';
    },
    contentStyle: function contentStyle() {
      return this.options.length ? {
        display: 'inline-block'
      } : {
        display: 'block'
      };
    },
    isAbove: function isAbove() {
      if (this.openDirection === 'above' || this.openDirection === 'top') {
        return true;
      } else if (this.openDirection === 'below' || this.openDirection === 'bottom') {
        return false;
      } else {
        return this.preferredOpenDirection === 'above';
      }
    },
    showSearchInput: function showSearchInput() {
      return this.searchable && (this.hasSingleSelectedSlot && (this.visibleSingleValue || this.visibleSingleValue === 0) ? this.isOpen : true);
    },
    isRequired: function isRequired() {
      if (this.required === false) {
        return false;
      } // if we have a value, any value, then this isn't required


      return this.internalValue.length <= 0;
    }
  },
  watch: {
    isOpen: function isOpen(val) {
      var _this9 = this;

      if (val) {
        if (this.useTeleport) {
          this.ready = false; // This helps with the positioning of the open dropdown when teleport is being used

          this.$nextTick(function () {
            var rect = _this9.$el.getBoundingClientRect();

            _this9.dropdownStyles = {
              position: 'absolute',
              top: "".concat(rect.bottom + window.scrollY, "px"),
              left: "".concat(rect.left + window.scrollX, "px"),
              width: "".concat(rect.width, "px"),
              zIndex: 9999
            };
            _this9.ready = true;
          });
        } else {
          this.ready = true;
        }
      }
    }
  }
};
var vue_multiselect_esm_hoisted_1 = ["tabindex", "aria-expanded", "aria-owns", "aria-activedescendant"];
var vue_multiselect_esm_hoisted_2 = {
  ref: "tags",
  class: "multiselect__tags"
};
var vue_multiselect_esm_hoisted_3 = {
  class: "multiselect__tags-wrap"
};
var vue_multiselect_esm_hoisted_4 = ["textContent"];
var vue_multiselect_esm_hoisted_5 = ["onKeydown", "onMousedown"];
var vue_multiselect_esm_hoisted_6 = ["textContent"];
var vue_multiselect_esm_hoisted_7 = {
  class: "multiselect__spinner"
};
var vue_multiselect_esm_hoisted_8 = ["name", "id", "spellcheck", "placeholder", "required", "value", "disabled", "tabindex", "aria-label", "aria-controls"];
var vue_multiselect_esm_hoisted_9 = ["id", "aria-multiselectable"];
var vue_multiselect_esm_hoisted_10 = {
  key: 0
};
var vue_multiselect_esm_hoisted_11 = {
  class: "multiselect__option"
};
var vue_multiselect_esm_hoisted_12 = ["aria-selected", "id", "role"];
var vue_multiselect_esm_hoisted_13 = ["onClick", "onMouseenter", "data-select", "data-selected", "data-deselect"];
var vue_multiselect_esm_hoisted_14 = ["data-select", "data-deselect", "onMouseenter", "onMousedown"];
var vue_multiselect_esm_hoisted_15 = {
  class: "multiselect__option"
};
var vue_multiselect_esm_hoisted_16 = {
  class: "multiselect__option"
};

function vue_multiselect_esm_render(_ctx, _cache, $props, $setup, $data, $options) {
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    tabindex: _ctx.searchable ? -1 : $props.tabindex,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([{
      'multiselect--active': _ctx.isOpen,
      'multiselect--disabled': $props.disabled,
      'multiselect--above': $options.isAbove,
      'multiselect--has-options-group': $options.hasOptionGroup
    }, "multiselect"]),
    onFocus: _cache[14] || (_cache[14] = function ($event) {
      return _ctx.activate();
    }),
    onBlur: _cache[15] || (_cache[15] = function ($event) {
      return _ctx.searchable ? false : _ctx.deactivate();
    }),
    onKeydown: [_cache[16] || (_cache[16] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.pointerForward();
    }, ["self", "prevent"]), ["down"])), _cache[17] || (_cache[17] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.pointerBackward();
    }, ["self", "prevent"]), ["up"])), _cache[18] || (_cache[18] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.addPointerElement($event);
    }, ["stop", "self"]), ["enter", "tab"]))],
    onKeyup: _cache[19] || (_cache[19] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(function ($event) {
      return _ctx.deactivate();
    }, ["esc"])),
    role: "combobox",
    "aria-expanded": _ctx.isOpen,
    "aria-owns": 'listbox-' + _ctx.id,
    "aria-activedescendant": _ctx.isOpen && _ctx.pointer !== null ? _ctx.id + '-' + _ctx.pointer : null
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "caret", {
    toggle: _ctx.toggle
  }, function () {
    return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
      onMousedown: _cache[0] || (_cache[0] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
        return _ctx.toggle();
      }, ["prevent", "stop"])),
      class: "multiselect__select"
    }, null, 32
    /* NEED_HYDRATION */
    )];
  }), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "clear", {
    search: _ctx.search
  }), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "selection", {
    search: _ctx.search,
    remove: _ctx.removeElement,
    values: $options.visibleValues,
    isOpen: _ctx.isOpen
  }, function () {
    return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_3, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])($options.visibleValues, function (option, index) {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "tag", {
        option: option,
        search: _ctx.search,
        remove: _ctx.removeElement
      }, function () {
        return [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          class: "multiselect__tag",
          key: index,
          onMousedown: _cache[1] || (_cache[1] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function () {}, ["prevent"]))
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
          textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option))
        }, null, 8
        /* PROPS */
        , vue_multiselect_esm_hoisted_4), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("i", {
          tabindex: "1",
          onKeydown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.removeElement(option);
          }, ["prevent"]), ["enter"]),
          onMousedown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.removeElement(option);
          }, ["prevent"]),
          class: "multiselect__tag-icon"
        }, null, 40
        /* PROPS, NEED_HYDRATION */
        , vue_multiselect_esm_hoisted_5)], 32
        /* NEED_HYDRATION */
        ))];
      });
    }), 256
    /* UNKEYED_FRAGMENT */
    ))], 512
    /* NEED_PATCH */
    ), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $options.visibleValues.length > 0]]), _ctx.internalValue && _ctx.internalValue.length > $props.limit ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "limit", {
      key: 0
    }, function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", {
        class: "multiselect__strong",
        textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])($props.limitText(_ctx.internalValue.length - $props.limit))
      }, null, 8
      /* PROPS */
      , vue_multiselect_esm_hoisted_6)];
    }) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)];
  }), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Transition"], {
    name: "multiselect__loading"
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "loading", {}, function () {
        return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_7, null, 512
        /* NEED_PATCH */
        ), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.loading]])];
      })];
    }),
    _: 3
    /* FORWARDED */

  }), _ctx.searchable ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("input", {
    key: 0,
    ref: "search",
    name: $props.name,
    id: _ctx.id,
    type: "text",
    autocomplete: "off",
    spellcheck: $props.spellcheck,
    placeholder: _ctx.placeholder,
    required: $options.isRequired,
    style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])($options.inputStyle),
    value: _ctx.search,
    disabled: $props.disabled,
    tabindex: $props.tabindex,
    "aria-label": $props.name + '-searchbox',
    onInput: _cache[2] || (_cache[2] = function ($event) {
      return _ctx.updateSearch($event.target.value);
    }),
    onFocus: _cache[3] || (_cache[3] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.activate();
    }, ["prevent"])),
    onBlur: _cache[4] || (_cache[4] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.deactivate();
    }, ["prevent"])),
    onKeyup: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(function ($event) {
      return _ctx.deactivate();
    }, ["esc"])),
    onKeydown: [_cache[6] || (_cache[6] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.pointerForward();
    }, ["prevent"]), ["down"])), _cache[7] || (_cache[7] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.pointerBackward();
    }, ["prevent"]), ["up"])), _cache[8] || (_cache[8] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.addPointerElement($event);
    }, ["prevent", "stop", "self"]), ["enter"])), _cache[9] || (_cache[9] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.removeLastElement();
    }, ["stop"]), ["delete"]))],
    class: "multiselect__input",
    "aria-controls": 'listbox-' + _ctx.id
  }, null, 44
  /* STYLE, PROPS, NEED_HYDRATION */
  , vue_multiselect_esm_hoisted_8)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true), $options.isSingleLabelVisible ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
    key: 1,
    class: "multiselect__single",
    onMousedown: _cache[10] || (_cache[10] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function () {
      return _ctx.toggle && _ctx.toggle.apply(_ctx, arguments);
    }, ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "singleLabel", {
    option: $options.singleValue
  }, function () {
    return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.currentOptionLabel), 1
    /* TEXT */
    )];
  })], 32
  /* NEED_HYDRATION */
  )) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true), $options.isPlaceholderVisible ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
    key: 2,
    class: "multiselect__placeholder",
    onMousedown: _cache[11] || (_cache[11] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function () {
      return _ctx.toggle && _ctx.toggle.apply(_ctx, arguments);
    }, ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "placeholder", {}, function () {
    return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.placeholder), 1
    /* TEXT */
    )];
  })], 32
  /* NEED_HYDRATION */
  )) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)], 512
  /* NEED_PATCH */
  ), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Teleport"], {
    to: $props.teleportTarget,
    disabled: !$props.useTeleport
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Transition"], {
    name: "multiselect"
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [_ctx.isOpen && $data.ready ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
        key: 0,
        class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["multiselect__content-wrapper", $props.contentWrapperClass]),
        onFocus: _cache[12] || (_cache[12] = function () {
          return _ctx.activate && _ctx.activate.apply(_ctx, arguments);
        }),
        tabindex: "-1",
        onMousedown: _cache[13] || (_cache[13] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function () {}, ["prevent"])),
        style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])([$data.dropdownStyles, {
          maxHeight: _ctx.optimizedHeight + 'px'
        }]),
        ref: "list"
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", {
        class: "multiselect__content",
        style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])($options.contentStyle),
        role: "listbox",
        id: 'listbox-' + _ctx.id,
        "aria-multiselectable": _ctx.multiple
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "beforeList"), _ctx.multiple && _ctx.max === _ctx.internalValue.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", vue_multiselect_esm_hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", vue_multiselect_esm_hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "maxElements", {}, function () {
        return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("Maximum of " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.max) + " options selected. First remove a selected option to select another.", 1
        /* TEXT */
        )];
      })])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true), !_ctx.max || _ctx.internalValue.length < _ctx.max ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], {
        key: 1
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.filteredOptions, function (option, index) {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
          class: "multiselect__element",
          key: index,
          "aria-selected": _ctx.isSelected(option),
          id: _ctx.id + '-' + index,
          role: !(option && (option.$isLabel || option.$isDisabled)) ? 'option' : null
        }, [!(option && (option.$isLabel || option.$isDisabled)) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          key: 0,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([_ctx.optionHighlight(index, option), "multiselect__option"]),
          onClick: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.select(option);
          }, ["stop"]),
          onMouseenter: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.pointerSet(index);
          }, ["self"]),
          "data-select": option && option.isTag ? _ctx.tagPlaceholder : $options.selectLabelText,
          "data-selected": $options.selectedLabelText,
          "data-deselect": $options.deselectLabelText
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "option", {
          option: option,
          search: _ctx.search,
          index: index
        }, function () {
          return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option)), 1
          /* TEXT */
          )];
        })], 42
        /* CLASS, PROPS, NEED_HYDRATION */
        , vue_multiselect_esm_hoisted_13)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true), option && (option.$isLabel || option.$isDisabled) ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
          key: 1,
          "data-select": _ctx.groupSelect && $options.selectGroupLabelText,
          "data-deselect": _ctx.groupSelect && $options.deselectGroupLabelText,
          class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([_ctx.groupHighlight(index, option), "multiselect__option"]),
          onMouseenter: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.groupSelect && _ctx.pointerSet(index);
          }, ["self"]),
          onMousedown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
            return _ctx.selectGroup(option);
          }, ["prevent"])
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "option", {
          option: option,
          search: _ctx.search,
          index: index
        }, function () {
          return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option)), 1
          /* TEXT */
          )];
        })], 42
        /* CLASS, PROPS, NEED_HYDRATION */
        , vue_multiselect_esm_hoisted_14)) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)], 8
        /* PROPS */
        , vue_multiselect_esm_hoisted_12);
      }), 128
      /* KEYED_FRAGMENT */
      )) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", vue_multiselect_esm_hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "noResult", {
        search: _ctx.search
      }, function () {
        return [_cache[20] || (_cache[20] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("No elements found. Consider changing the search query."))];
      })])], 512
      /* NEED_PATCH */
      ), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.showNoResults && _ctx.filteredOptions.length === 0 && _ctx.search && !$props.loading]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", vue_multiselect_esm_hoisted_16, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "noOptions", {}, function () {
        return [_cache[21] || (_cache[21] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("List is empty."))];
      })])], 512
      /* NEED_PATCH */
      ), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.showNoOptions && _ctx.filteredOptions.length === 0 && !_ctx.search && !$props.loading]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "afterList")], 12
      /* STYLE, PROPS */
      , vue_multiselect_esm_hoisted_9)], 38
      /* CLASS, STYLE, NEED_HYDRATION */
      )) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)];
    }),
    _: 3
    /* FORWARDED */

  })], 8
  /* PROPS */
  , ["to", "disabled"]))], 42
  /* CLASS, PROPS, NEED_HYDRATION */
  , vue_multiselect_esm_hoisted_1);
}

script.render = vue_multiselect_esm_render;

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupMembers.vue?vue&type=script&lang=ts
function GroupMembersvue_type_script_lang_ts_toConsumableArray(arr) { return GroupMembersvue_type_script_lang_ts_arrayWithoutHoles(arr) || GroupMembersvue_type_script_lang_ts_iterableToArray(arr) || GroupMembersvue_type_script_lang_ts_unsupportedIterableToArray(arr) || GroupMembersvue_type_script_lang_ts_nonIterableSpread(); }

function GroupMembersvue_type_script_lang_ts_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function GroupMembersvue_type_script_lang_ts_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return GroupMembersvue_type_script_lang_ts_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return GroupMembersvue_type_script_lang_ts_arrayLikeToArray(o, minLen); }

function GroupMembersvue_type_script_lang_ts_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function GroupMembersvue_type_script_lang_ts_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return GroupMembersvue_type_script_lang_ts_arrayLikeToArray(arr); }

function GroupMembersvue_type_script_lang_ts_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }






/* harmony default export */ var GroupMembersvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    Multiselect: script,
    SaveButton: external_CorePluginsAdmin_["SaveButton"]
  },
  directives: {
    ContentTable: external_CoreHome_["ContentTable"]
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  emits: ['changed', 'invite'],
  data: function data() {
    return {
      members: [],
      users: [],
      selectedUser: null,
      confirmRemoveMemberText: '',
      isLoadingMembers: false,
      isLoadingUsers: false,
      isAddingMember: false
    };
  },
  mounted: function mounted() {
    this.loadGroupMembers();
    this.loadUsers();
  },
  computed: {
    isLoading: function isLoading() {
      return this.isLoadingMembers || this.isLoadingUsers;
    },
    usersByLogin: function usersByLogin() {
      var result = {};
      this.users.forEach(function (user) {
        result[user.login] = user;
      });
      return result;
    },
    availableUsers: function availableUsers() {
      var _this = this;

      // the anonymous user cannot be member of a group
      return this.users.filter(function (user) {
        return user.login !== 'anonymous' && !_this.members.includes(user.login);
      });
    }
  },
  methods: {
    userLabel: function userLabel(user) {
      return user.email ? "".concat(user.login, " (").concat(user.email, ")") : user.login;
    },
    statusText: function statusText(login) {
      var _this$usersByLogin$lo;

      var status = (_this$usersByLogin$lo = this.usersByLogin[login]) === null || _this$usersByLogin$lo === void 0 ? void 0 : _this$usersByLogin$lo.invite_status;

      if (status === undefined || status === 'active') {
        return Object(external_CoreHome_["translate"])('UsersManager_Active');
      }

      if (status === 'expired') {
        return Object(external_CoreHome_["translate"])('UsersManager_Expired');
      }

      return Object(external_CoreHome_["translate"])('UsersManager_Pending');
    },
    statusClass: function statusClass(login) {
      var _this$usersByLogin$lo2;

      var status = (_this$usersByLogin$lo2 = this.usersByLogin[login]) === null || _this$usersByLogin$lo2 === void 0 ? void 0 : _this$usersByLogin$lo2.invite_status;

      if (status === undefined || status === 'active') {
        return 'active';
      }

      return status === 'expired' ? 'expired' : 'pending';
    },
    loadGroupMembers: function loadGroupMembers() {
      var _this2 = this;

      this.isLoadingMembers = true;
      external_CoreHome_["AjaxHelper"].fetch({
        method: 'GroupPermissions.getMembersOfGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1
      }).then(function (response) {
        _this2.members = response.map(function (member) {
          return member.login;
        }).sort(function (a, b) {
          return a.localeCompare(b);
        });
      }).finally(function () {
        _this2.isLoadingMembers = false;
      });
    },
    loadUsers: function loadUsers() {
      var _this3 = this;

      this.isLoadingUsers = true;
      external_CoreHome_["AjaxHelper"].fetch({
        method: 'UsersManager.getUsers',
        filter_limit: -1
      }).then(function (response) {
        _this3.users = response.sort(function (a, b) {
          return a.login.localeCompare(b.login);
        });
      }).finally(function () {
        _this3.isLoadingUsers = false;
      });
    },
    addMember: function addMember() {
      var _this4 = this;

      if (!this.selectedUser || this.isAddingMember) {
        return;
      }

      var login = this.selectedUser.login;
      this.isAddingMember = true;
      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.addUserToGroup'
      }, {
        idGroup: this.group.idGroup,
        login: login
      }, {
        errorElement: '#ajaxErrorAddMember'
      }).then(function () {
        _this4.members = [].concat(GroupMembersvue_type_script_lang_ts_toConsumableArray(_this4.members), [login]).sort(function (a, b) {
          return a.localeCompare(b);
        });
        _this4.selectedUser = null;
        notifySuccess('groupPermissionsMemberAdded', 'GroupPermissions_MemberAdded', login);

        _this4.$emit('changed');
      }).finally(function () {
        _this4.isAddingMember = false;
      });
    },
    confirmRemoveMember: function confirmRemoveMember(login) {
      var _this5 = this;

      this.confirmRemoveMemberText = Object(external_CoreHome_["translate"])('GroupPermissions_RemoveFromGroupConfirm', login, this.group.name);
      external_CoreHome_["Matomo"].helper.modalConfirm(this.$refs.confirmRemoveMember, {
        yes: function yes() {
          return _this5.removeMember(login);
        }
      });
    },
    removeMember: function removeMember(login) {
      var _this6 = this;

      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.removeUserFromGroup'
      }, {
        idGroup: this.group.idGroup,
        login: login
      }, {
        errorElement: '#ajaxErrorManageGroupMembers'
      }).then(function () {
        _this6.members = _this6.members.filter(function (member) {
          return member !== login;
        });
        notifySuccess('groupPermissionsMemberRemoved', 'GroupPermissions_MemberRemoved', login);

        _this6.$emit('changed');
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupMembers.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupMembers.vue



GroupMembersvue_type_script_lang_ts.render = GroupMembersvue_type_template_id_ffb4f3de_render

/* harmony default export */ var GroupMembers = (GroupMembersvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupWebsiteAccess.vue?vue&type=template&id=af051770

var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_1 = {
  class: "groupPermissionsWebsiteAccess"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_2 = {
  class: "groupPermissionsGiveAccess"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_3 = {
  class: "groupPermissionsLabel"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_4 = {
  class: "groupPermissionsInlineForm"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_5 = {
  class: "groupPermissionsSiteField"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_6 = {
  class: "groupPermissionsRoleField"
};

var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_7 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorGroupWebsiteAccess"
}, null, -1);

var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_8 = {
  class: "role_header"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_9 = ["title"];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_10 = {
  class: "actions-cell-header"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_11 = {
  key: 0,
  class: "groupPermissionsRolesHelp"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_12 = {
  colspan: "3"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_13 = {
  key: 1
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_14 = {
  colspan: "3"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_15 = {
  key: 2,
  class: "groupPermissionsEmpty"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_16 = {
  colspan: "3"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_17 = ["data-id-site"];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_18 = {
  class: "siteName"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_19 = {
  class: "access-cell"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_20 = {
  class: "center actions-cell"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_21 = ["title", "onClick"];

var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_22 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete"
}, null, -1);

var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_23 = [GroupWebsiteAccessvue_type_template_id_af051770_hoisted_22];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_24 = {
  class: "ui-confirm",
  ref: "confirmRemoveAccess"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_25 = ["value"];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_26 = ["value"];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_27 = {
  class: "ui-confirm",
  ref: "confirmAllWebsites"
};
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_28 = ["value"];
var GroupWebsiteAccessvue_type_template_id_af051770_hoisted_29 = ["value"];
function GroupWebsiteAccessvue_type_template_id_af051770_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_SiteSelector = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SiteSelector");

  var _component_Field = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("Field");

  var _component_SaveButton = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SaveButton");

  var _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");

  var _directive_content_table = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveDirective"])("content-table");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_GiveAccess')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SiteSelector, {
    "model-value": _ctx.siteToAdd,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
      return _ctx.siteToAdd = $event;
    }),
    "show-selected-site": true,
    "show-all-sites-item": true,
    "switch-site-on-select": false,
    "only-sites-with-admin-access": true,
    "all-sites-text": _ctx.translate('UsersManager_ApplyToAllWebsites'),
    placeholder: _ctx.translate('GroupPermissions_SelectWebsite')
  }, null, 8, ["model-value", "all-sites-text", "placeholder"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Field, {
    uicontrol: "select",
    name: "groupPermissionsRoleToAdd",
    "model-value": _ctx.roleToAdd,
    "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) {
      return _ctx.roleToAdd = $event;
    }),
    options: _ctx.roles,
    "full-width": true
  }, null, 8, ["model-value", "options"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SaveButton, {
    class: "groupPermissionsGiveAccessButton",
    value: _ctx.translate('GroupPermissions_GiveAccessButton'),
    saving: _ctx.isSaving,
    disabled: !_ctx.siteToAdd || !_ctx.roleToAdd,
    onConfirm: _cache[2] || (_cache[2] = function ($event) {
      return _ctx.giveAccess();
    })
  }, null, 8, ["value", "saving", "disabled"])])]), GroupWebsiteAccessvue_type_template_id_af051770_hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", {
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])(["groupPermissionsWebsitesTable", {
      loading: _ctx.isLoading
    }])
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Website')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_8, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_Role')) + " ", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
    class: "icon-help groupPermissionsRolesHelpToggle",
    title: _ctx.translate('General_Help'),
    onClick: _cache[3] || (_cache[3] = function ($event) {
      return _ctx.showRolesHelp = !_ctx.showRolesHelp;
    })
  }, null, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_9)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_10, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Actions')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [_ctx.showRolesHelp ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_11, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_12, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.roles, function (role) {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
      key: role.key
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(role.value) + ":", 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(role.description), 1)]);
  }), 128))])])])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), _ctx.isLoading && !_ctx.sites.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_13, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: true
  })])])) : !_ctx.sites.length ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_15, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_16, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_NoWebsiteAccess')), 1)])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.sites, function (site) {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: site.idSite,
      class: "groupPermissionsWebsiteRow",
      "data-id-site": site.idSite
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_18, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(site.name), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_19, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_Field, {
      uicontrol: "select",
      name: "groupPermissionsSiteRole".concat(site.idSite),
      "model-value": site.access,
      "onUpdate:modelValue": function onUpdateModelValue($event) {
        return _ctx.setAccess(site.idSite, site.name, $event);
      },
      options: _ctx.roles
    }, null, 8, ["name", "model-value", "onUpdate:modelValue", "options"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_20, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      class: "table-action groupPermissionsRemoveAccess",
      title: _ctx.translate('GroupPermissions_RemoveAccess'),
      onClick: function onClick($event) {
        return _ctx.confirmRemoveAccess(site);
      }
    }, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_23, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_21)])], 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_17);
  }), 128))])], 2), [[_directive_content_table]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_24, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_25), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_26)], 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupWebsiteAccessvue_type_template_id_af051770_hoisted_27, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_28), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, GroupWebsiteAccessvue_type_template_id_af051770_hoisted_29)], 512)]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupWebsiteAccess.vue?vue&type=template&id=af051770

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupWebsiteAccess.vue?vue&type=script&lang=ts





/* harmony default export */ var GroupWebsiteAccessvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    Field: external_CorePluginsAdmin_["Field"],
    SaveButton: external_CorePluginsAdmin_["SaveButton"],
    SiteSelector: external_CoreHome_["SiteSelector"]
  },
  directives: {
    ContentTable: external_CoreHome_["ContentTable"]
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  emits: ['changed'],
  data: function data() {
    return {
      sites: [],
      roles: [],
      siteToAdd: null,
      roleToAdd: 'view',
      confirmText: '',
      showRolesHelp: false,
      isLoading: false,
      isSaving: false
    };
  },
  mounted: function mounted() {
    var _this = this;

    loadRoles().then(function (roles) {
      _this.roles = roles;
    });
    this.loadSites();
  },
  methods: {
    loadSites: function loadSites() {
      var _this2 = this;

      this.isLoading = true;
      return external_CoreHome_["AjaxHelper"].fetch({
        method: 'GroupPermissions.getSitesAccessFromGroup',
        idGroup: this.group.idGroup,
        filter_limit: -1
      }).then(function (sites) {
        _this2.sites = sites;
      }).finally(function () {
        _this2.isLoading = false;
      });
    },
    giveAccess: function giveAccess() {
      var _this3 = this;

      var site = this.siteToAdd;
      var role = this.roleToAdd;

      if (!site || !role) {
        return;
      }

      if (site.id === 'all') {
        this.confirmText = Object(external_CoreHome_["translate"])('GroupPermissions_ChangeAccessToAllSitesConfirm', roleName(this.roles, role), this.group.name);
        external_CoreHome_["Matomo"].helper.modalConfirm(this.$refs.confirmAllWebsites, {
          yes: function yes() {
            return _this3.saveAccess('all', Object(external_CoreHome_["translate"])('UsersManager_ApplyToAllWebsites'), role);
          }
        });
        return;
      }

      this.saveAccess(site.id, site.name, role);
    },
    setAccess: function setAccess(idSite, siteName, role) {
      this.saveAccess(idSite, siteName, role);
    },
    confirmRemoveAccess: function confirmRemoveAccess(site) {
      var _this4 = this;

      this.confirmText = Object(external_CoreHome_["translate"])('GroupPermissions_RemoveAccessConfirm', this.group.name, site.name);
      external_CoreHome_["Matomo"].helper.modalConfirm(this.$refs.confirmRemoveAccess, {
        yes: function yes() {
          return _this4.saveAccess(site.idSite, site.name, 'noaccess');
        }
      });
    },
    saveAccess: function saveAccess(idSites, siteName, access) {
      var _this5 = this;

      this.isSaving = true;
      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.setGroupAccess'
      }, {
        name: this.group.name,
        access: access,
        idSites: idSites
      }, {
        errorElement: '#ajaxErrorGroupWebsiteAccess'
      }).then(function () {
        notifySuccess('groupPermissionsAccessUpdated', 'GroupPermissions_AccessUpdated', _this5.group.name, siteName, roleName(_this5.roles, access));
        _this5.siteToAdd = null;

        _this5.$emit('changed');

        return _this5.loadSites();
      }).catch(function () {
        // reload to reset the role selects to the stored values
        _this5.loadSites();
      }).finally(function () {
        _this5.isSaving = false;
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupWebsiteAccess.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupWebsiteAccess.vue



GroupWebsiteAccessvue_type_script_lang_ts.render = GroupWebsiteAccessvue_type_template_id_af051770_render

/* harmony default export */ var GroupWebsiteAccess = (GroupWebsiteAccessvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupSettings.vue?vue&type=template&id=28d60fb0

var GroupSettingsvue_type_template_id_28d60fb0_hoisted_1 = {
  class: "groupPermissionsGroupSettings"
};

var GroupSettingsvue_type_template_id_28d60fb0_hoisted_2 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorRenameGroup"
}, null, -1);

var GroupSettingsvue_type_template_id_28d60fb0_hoisted_3 = {
  class: "groupPermissionsDeleteGroup"
};

var GroupSettingsvue_type_template_id_28d60fb0_hoisted_4 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorDeleteGroup"
}, null, -1);

var GroupSettingsvue_type_template_id_28d60fb0_hoisted_5 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete"
}, null, -1);

function GroupSettingsvue_type_template_id_28d60fb0_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_TextField = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TextField");

  var _component_SaveButton = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SaveButton");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", GroupSettingsvue_type_template_id_28d60fb0_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("form", {
    class: "groupPermissionsRenameGroup",
    onSubmit: _cache[2] || (_cache[2] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.renameGroup();
    }, ["prevent"]))
  }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_RenameGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_TextField, {
    name: "groupPermissionsGroupName",
    "model-value": _ctx.newGroupName,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
      return _ctx.newGroupName = $event;
    }),
    title: _ctx.translate('GroupPermissions_GroupName'),
    "inline-help": _ctx.translate('GroupPermissions_GroupNameHelp'),
    maxlength: 64
  }, null, 8, ["model-value", "title", "inline-help"])]), GroupSettingsvue_type_template_id_28d60fb0_hoisted_2, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SaveButton, {
    class: "groupPermissionsRenameGroupButton",
    value: _ctx.translate('General_Save'),
    saving: _ctx.isRenaming,
    disabled: !_ctx.canRename,
    onConfirm: _cache[1] || (_cache[1] = function ($event) {
      return _ctx.renameGroup();
    })
  }, null, 8, ["value", "saving", "disabled"])], 32), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", GroupSettingsvue_type_template_id_28d60fb0_hoisted_3, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DeleteGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DeleteGroupDescription')), 1), GroupSettingsvue_type_template_id_28d60fb0_hoisted_4, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
    href: "",
    class: "btn groupPermissionsDeleteGroupButton",
    onClick: _cache[3] || (_cache[3] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
      return _ctx.$emit('delete', _ctx.group);
    }, ["prevent"]))
  }, [GroupSettingsvue_type_template_id_28d60fb0_hoisted_5, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(" " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DeleteGroupButton')), 1)])])]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupSettings.vue?vue&type=template&id=28d60fb0

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupSettings.vue?vue&type=script&lang=ts





/* harmony default export */ var GroupSettingsvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    TextField: TextField,
    SaveButton: external_CorePluginsAdmin_["SaveButton"]
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  emits: ['renamed', 'delete'],
  data: function data() {
    return {
      newGroupName: this.group.name,
      isRenaming: false
    };
  },
  computed: {
    canRename: function canRename() {
      var name = this.newGroupName.trim();
      return !this.isRenaming && name !== '' && name !== this.group.name;
    }
  },
  watch: {
    group: function group(newGroup) {
      this.newGroupName = newGroup.name;
    }
  },
  methods: {
    renameGroup: function renameGroup() {
      var _this = this;

      if (!this.canRename) {
        return;
      }

      var newName = this.newGroupName.trim();
      this.isRenaming = true;
      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.renameGroup'
      }, {
        idGroup: this.group.idGroup,
        newName: newName
      }, {
        errorElement: '#ajaxErrorRenameGroup'
      }).then(function () {
        notifySuccess('groupPermissionsGroupRenamed', 'GroupPermissions_GroupRenamed', newName);

        _this.$emit('renamed', {
          idGroup: _this.group.idGroup,
          name: newName
        });
      }).finally(function () {
        _this.isRenaming = false;
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupSettings.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupSettings.vue



GroupSettingsvue_type_script_lang_ts.render = GroupSettingsvue_type_template_id_28d60fb0_render

/* harmony default export */ var GroupSettings = (GroupSettingsvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/GroupEdit.vue?vue&type=script&lang=ts





/* harmony default export */ var GroupEditvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ContentBlock: external_CoreHome_["ContentBlock"],
    GroupMembers: GroupMembers,
    GroupWebsiteAccess: GroupWebsiteAccess,
    GroupSettings: GroupSettings
  },
  props: {
    group: {
      type: Object,
      required: true
    },
    activeTab: {
      type: String,
      default: 'members'
    }
  },
  emits: ['back', 'change-tab', 'changed', 'renamed', 'delete', 'invite'],
  computed: {
    menu: function menu() {
      return [{
        tab: 'members',
        title: Object(external_CoreHome_["translate"])('GroupPermissions_Members'),
        count: this.group.memberCount
      }, {
        tab: 'access',
        title: Object(external_CoreHome_["translate"])('GroupPermissions_WebsiteAccess'),
        count: this.group.siteCount
      }, {
        tab: 'settings',
        title: Object(external_CoreHome_["translate"])('General_Settings')
      }];
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupEdit.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/GroupEdit.vue



GroupEditvue_type_script_lang_ts.render = GroupEditvue_type_template_id_8054bbfa_render

/* harmony default export */ var GroupEdit = (GroupEditvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/InviteUser.vue?vue&type=template&id=f056124c

var InviteUservue_type_template_id_f056124c_hoisted_1 = {
  class: "groupPermissionsIntro"
};
var InviteUservue_type_template_id_f056124c_hoisted_2 = {
  class: "groupPermissionsInviteGroups"
};
var InviteUservue_type_template_id_f056124c_hoisted_3 = {
  class: "fieldRadioTitle"
};
var InviteUservue_type_template_id_f056124c_hoisted_4 = {
  class: "groupPermissionsCheckboxList"
};
var InviteUservue_type_template_id_f056124c_hoisted_5 = ["value", "name"];

var InviteUservue_type_template_id_f056124c_hoisted_6 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
  id: "ajaxErrorInviteUser"
}, null, -1);

var InviteUservue_type_template_id_f056124c_hoisted_7 = {
  class: "groupPermissionsFormActions"
};
function InviteUservue_type_template_id_f056124c_render(_ctx, _cache, $props, $setup, $data, $options) {
  var _component_TextField = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("TextField");

  var _component_SaveButton = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SaveButton");

  var _component_PasswordConfirmation = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("PasswordConfirmation");

  var _component_ContentBlock = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ContentBlock");

  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_ContentBlock, {
    class: "groupPermissionsInviteUser",
    "content-title": _ctx.translate('GroupPermissions_InviteUser')
  }, {
    default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(function () {
      return [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", InviteUservue_type_template_id_f056124c_hoisted_1, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_InviteUserDescription')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("form", {
        onSubmit: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
          return _ctx.requestInvite();
        }, ["prevent"])),
        autocomplete: "off"
      }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_TextField, {
        name: "groupPermissionsInviteLogin",
        "model-value": _ctx.userLogin,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = function ($event) {
          return _ctx.userLogin = $event;
        }),
        title: _ctx.translate('General_Username'),
        maxlength: 100
      }, null, 8, ["model-value", "title"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_TextField, {
        name: "groupPermissionsInviteEmail",
        type: "email",
        "model-value": _ctx.email,
        "onUpdate:modelValue": _cache[1] || (_cache[1] = function ($event) {
          return _ctx.email = $event;
        }),
        title: _ctx.translate('UsersManager_Email'),
        maxlength: 100
      }, null, 8, ["model-value", "title"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", InviteUservue_type_template_id_f056124c_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", InviteUservue_type_template_id_f056124c_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Groups')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", InviteUservue_type_template_id_f056124c_hoisted_4, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.groups, function (group) {
        return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("p", {
          key: group.idGroup,
          class: "checkbox"
        }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("label", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
          type: "checkbox",
          value: group.idGroup,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = function ($event) {
            return _ctx.selectedGroupIds = $event;
          }),
          name: "groupPermissionsInviteGroup".concat(group.idGroup)
        }, null, 8, InviteUservue_type_template_id_f056124c_hoisted_5), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelCheckbox"], _ctx.selectedGroupIds]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(group.name), 1)])]);
      }), 128))])]), InviteUservue_type_template_id_f056124c_hoisted_6, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", InviteUservue_type_template_id_f056124c_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SaveButton, {
        class: "groupPermissionsSendInvite",
        value: _ctx.translate('GroupPermissions_InviteUserButton'),
        saving: _ctx.isInvitingUser,
        disabled: !_ctx.canInvite,
        onConfirm: _cache[3] || (_cache[3] = function ($event) {
          return _ctx.requestInvite();
        })
      }, null, 8, ["value", "saving", "disabled"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("a", {
        href: "",
        class: "entityCancelLink",
        onClick: _cache[4] || (_cache[4] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(function ($event) {
          return _ctx.$emit('cancel');
        }, ["prevent"]))
      }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Cancel')), 1)])], 32), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_PasswordConfirmation, {
        modelValue: _ctx.showPasswordConfirmation,
        "onUpdate:modelValue": _cache[6] || (_cache[6] = function ($event) {
          return _ctx.showPasswordConfirmation = $event;
        }),
        onConfirmed: _ctx.inviteUser
      }, null, 8, ["modelValue", "onConfirmed"])];
    }),
    _: 1
  }, 8, ["content-title"]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/InviteUser.vue?vue&type=template&id=f056124c

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/InviteUser.vue?vue&type=script&lang=ts
function InviteUservue_type_script_lang_ts_toConsumableArray(arr) { return InviteUservue_type_script_lang_ts_arrayWithoutHoles(arr) || InviteUservue_type_script_lang_ts_iterableToArray(arr) || InviteUservue_type_script_lang_ts_unsupportedIterableToArray(arr) || InviteUservue_type_script_lang_ts_nonIterableSpread(); }

function InviteUservue_type_script_lang_ts_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function InviteUservue_type_script_lang_ts_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return InviteUservue_type_script_lang_ts_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return InviteUservue_type_script_lang_ts_arrayLikeToArray(o, minLen); }

function InviteUservue_type_script_lang_ts_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function InviteUservue_type_script_lang_ts_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return InviteUservue_type_script_lang_ts_arrayLikeToArray(arr); }

function InviteUservue_type_script_lang_ts_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }






/* harmony default export */ var InviteUservue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ContentBlock: external_CoreHome_["ContentBlock"],
    TextField: TextField,
    PasswordConfirmation: external_CorePluginsAdmin_["PasswordConfirmation"],
    SaveButton: external_CorePluginsAdmin_["SaveButton"]
  },
  props: {
    groups: {
      type: Array,
      required: true
    },
    preselectedGroupIds: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  },
  emits: ['user-invited', 'cancel'],
  data: function data() {
    return {
      userLogin: '',
      email: '',
      selectedGroupIds: InviteUservue_type_script_lang_ts_toConsumableArray(this.preselectedGroupIds),
      showPasswordConfirmation: false,
      isInvitingUser: false
    };
  },
  computed: {
    canInvite: function canInvite() {
      return !this.isInvitingUser && this.userLogin.trim() !== '' && this.email.trim() !== '' && this.selectedGroupIds.length > 0;
    }
  },
  watch: {
    groups: function groups(newGroups) {
      // drop selected groups that were deleted in the meantime
      this.selectedGroupIds = this.selectedGroupIds.filter(function (id) {
        return newGroups.some(function (g) {
          return g.idGroup === id;
        });
      });
    }
  },
  methods: {
    requestInvite: function requestInvite() {
      if (this.canInvite) {
        this.showPasswordConfirmation = true;
      }
    },
    inviteUser: function inviteUser(passwordConfirmation) {
      var _this = this;

      this.isInvitingUser = true;
      var userLogin = this.userLogin.trim();

      var idGroups = InviteUservue_type_script_lang_ts_toConsumableArray(this.selectedGroupIds);

      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.inviteUserToGroups'
      }, {
        userLogin: userLogin,
        email: this.email.trim(),
        idGroups: idGroups.join(','),
        passwordConfirmation: passwordConfirmation
      }, {
        errorElement: '#ajaxErrorInviteUser'
      }).then(function () {
        notifySuccess('groupPermissionsUserInvited', 'GroupPermissions_InviteUserSuccess', userLogin);

        _this.$emit('user-invited', {
          login: userLogin,
          idGroups: idGroups
        });
      }).finally(function () {
        _this.isInvitingUser = false;
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/InviteUser.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/InviteUser.vue



InviteUservue_type_script_lang_ts.render = InviteUservue_type_template_id_f056124c_render

/* harmony default export */ var InviteUser = (InviteUservue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--14-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--14-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--0-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=script&lang=ts
function TabManageGroupsvue_type_script_lang_ts_slicedToArray(arr, i) { return TabManageGroupsvue_type_script_lang_ts_arrayWithHoles(arr) || TabManageGroupsvue_type_script_lang_ts_iterableToArrayLimit(arr, i) || TabManageGroupsvue_type_script_lang_ts_unsupportedIterableToArray(arr, i) || TabManageGroupsvue_type_script_lang_ts_nonIterableRest(); }

function TabManageGroupsvue_type_script_lang_ts_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function TabManageGroupsvue_type_script_lang_ts_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TabManageGroupsvue_type_script_lang_ts_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TabManageGroupsvue_type_script_lang_ts_arrayLikeToArray(o, minLen); }

function TabManageGroupsvue_type_script_lang_ts_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function TabManageGroupsvue_type_script_lang_ts_iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function TabManageGroupsvue_type_script_lang_ts_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }








var OWN_HASH_PARAMS = ['idGroup', 'groupTab', 'groupView', 'inviteGroup'];
var EDIT_TABS = ['members', 'access', 'settings'];
/* harmony default export */ var TabManageGroupsvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    GroupList: GroupList,
    GroupCreate: GroupCreate,
    GroupEdit: GroupEdit,
    InviteUser: InviteUser
  },
  data: function data() {
    return {
      groups: [],
      isLoadingGroups: false,
      hasLoadedGroups: false,
      confirmDeleteGroupText: ''
    };
  },
  mounted: function mounted() {
    this.loadGroups();
  },
  computed: {
    hashParams: function hashParams() {
      var params = external_CoreHome_["MatomoUrl"].hashParsed.value || {};
      var result = {};
      OWN_HASH_PARAMS.forEach(function (name) {
        var _params$name;

        var value = (_params$name = params[name]) !== null && _params$name !== void 0 ? _params$name : external_CoreHome_["MatomoUrl"].urlParsed.value[name];

        if (value !== undefined && value !== null && value !== '') {
          result[name] = String(value);
        }
      });
      return result;
    },
    idGroup: function idGroup() {
      var idGroup = parseInt(this.hashParams.idGroup || '', 10);
      return idGroup > 0 ? idGroup : null;
    },
    view: function view() {
      if (this.idGroup) {
        return 'edit';
      }

      if (this.hashParams.groupView === 'create') {
        return 'create';
      }

      if (this.hashParams.groupView === 'invite' && this.groups.length) {
        return 'invite';
      }

      return 'list';
    },
    editTab: function editTab() {
      var tab = this.hashParams.groupTab;
      return tab && EDIT_TABS.includes(tab) ? tab : 'members';
    },
    editedGroup: function editedGroup() {
      var _this = this;

      return this.groups.find(function (g) {
        return g.idGroup === _this.idGroup;
      });
    },
    inviteGroupIds: function inviteGroupIds() {
      var idGroup = parseInt(this.hashParams.inviteGroup || '', 10);
      return idGroup > 0 ? [idGroup] : [];
    }
  },
  watch: {
    editedGroup: function editedGroup(group) {
      if (!group && this.idGroup && this.hasLoadedGroups && !this.isLoadingGroups) {
        this.onUnknownGroup();
      }
    }
  },
  methods: {
    /**
     * Shows a view by changing the URL hash
     * (keeps the browser history and allows reloading the page).
     */
    navigate: function navigate(params) {
      var hash = Object.assign({}, external_CoreHome_["MatomoUrl"].hashParsed.value || {});
      OWN_HASH_PARAMS.forEach(function (name) {
        delete hash[name];
      });
      Object.entries(params).forEach(function (_ref) {
        var _ref2 = TabManageGroupsvue_type_script_lang_ts_slicedToArray(_ref, 2),
            name = _ref2[0],
            value = _ref2[1];

        hash[name] = String(value);
      }); // the parameters may also come from the query string (e.g. links from other pages)

      if (OWN_HASH_PARAMS.some(function (name) {
        return external_CoreHome_["MatomoUrl"].urlParsed.value[name] !== undefined;
      })) {
        var url = new URL(window.location.href);
        OWN_HASH_PARAMS.forEach(function (name) {
          return url.searchParams.delete(name);
        });
        window.history.replaceState(window.history.state, '', url.toString());
      }

      external_CoreHome_["MatomoUrl"].updateHash(hash);
      window.scrollTo(0, 0);
    },
    loadGroups: function loadGroups() {
      var _this2 = this;

      this.isLoadingGroups = true;
      return external_CoreHome_["AjaxHelper"].fetch({
        method: 'GroupPermissions.getGroupsOverview',
        filter_limit: -1
      }, {
        errorElement: '#ajaxErrorManageGroups'
      }).then(function (groups) {
        _this2.groups = groups;
      }).finally(function () {
        _this2.isLoadingGroups = false;
        _this2.hasLoadedGroups = true;

        if (_this2.idGroup && !_this2.editedGroup) {
          _this2.onUnknownGroup();
        }
      });
    },
    onUnknownGroup: function onUnknownGroup() {
      external_CoreHome_["NotificationsStore"].show({
        message: Object(external_CoreHome_["translate"])('GroupPermissions_ExceptionGroupDoesNotExist'),
        context: 'error',
        type: 'toast',
        id: 'groupPermissionsUnknownGroup'
      });
      this.navigate({});
    },
    onGroupCreated: function onGroupCreated(group) {
      var _this3 = this;

      this.loadGroups().then(function () {
        _this3.navigate({
          idGroup: group.idGroup,
          groupTab: 'members'
        });
      });
    },
    onGroupRenamed: function onGroupRenamed(group) {
      var edited = this.groups.find(function (g) {
        return g.idGroup === group.idGroup;
      });

      if (edited) {
        edited.name = group.name;
      }

      this.loadGroups();
    },
    onUserInvited: function onUserInvited(event) {
      var _this4 = this;

      this.loadGroups().then(function () {
        if (_this4.inviteGroupIds.length) {
          _this4.navigate({
            idGroup: _this4.inviteGroupIds[0],
            groupTab: 'members'
          });
        } else {
          _this4.navigate({});
        }
      });
      return event;
    },
    goBackFromInvite: function goBackFromInvite() {
      if (this.inviteGroupIds.length) {
        this.navigate({
          idGroup: this.inviteGroupIds[0],
          groupTab: 'members'
        });
      } else {
        this.navigate({});
      }
    },
    confirmDeleteGroup: function confirmDeleteGroup(group) {
      var _this5 = this;

      this.confirmDeleteGroupText = Object(external_CoreHome_["translate"])('GroupPermissions_DeleteGroupConfirm', group.name);
      external_CoreHome_["Matomo"].helper.modalConfirm(this.$refs.confirmDeleteGroup, {
        yes: function yes() {
          return _this5.deleteGroup(group);
        }
      });
    },
    deleteGroup: function deleteGroup(group) {
      var _this6 = this;

      external_CoreHome_["AjaxHelper"].post({
        method: 'GroupPermissions.deleteGroup'
      }, {
        idGroup: group.idGroup
      }, {
        errorElement: '#ajaxErrorManageGroups'
      }).then(function () {
        notifySuccess('groupPermissionsGroupDeleted', 'GroupPermissions_GroupDeleted', group.name);

        _this6.navigate({});

        _this6.loadGroups();
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue



TabManageGroupsvue_type_script_lang_ts.render = TabManageGroupsvue_type_template_id_7cb424e4_render

/* harmony default export */ var TabManageGroups = (TabManageGroupsvue_type_script_lang_ts);
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/index.ts
/*!
 * Matomo - free/libre analytics platform
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */


// CONCATENATED MODULE: ./node_modules/@vue/cli-service/lib/commands/build/entry-lib-no-default.js




/***/ })

/******/ });
});
//# sourceMappingURL=GroupPermissions.umd.js.map