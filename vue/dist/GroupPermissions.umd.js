(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("CoreHome"), require("vue"));
	else if(typeof define === 'function' && define.amd)
		define(["CoreHome", ], factory);
	else if(typeof exports === 'object')
		exports["GroupPermissions"] = factory(require("CoreHome"), require("vue"));
	else
		root["GroupPermissions"] = factory(root["CoreHome"], root["Vue"]);
})((typeof self !== 'undefined' ? self : this), function(__WEBPACK_EXTERNAL_MODULE__19dc__, __WEBPACK_EXTERNAL_MODULE__8bbf__) {
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

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=template&id=0d3bb2e8

const _hoisted_1 = {
  id: "ajaxErrorAccessGroupMember",
  ref: "errorContainer"
};
const _hoisted_2 = {
  class: "card"
};
const _hoisted_3 = {
  class: "card-content"
};
const _hoisted_4 = {
  class: "sites_autocomplete"
};
const _hoisted_5 = {
  class: "entityContainer",
  style: {
    "width": "600px",
    "margin-top": "16px"
  }
};
const _hoisted_6 = {
  class: "entityTable dataTable",
  style: {
    "display": "inline-table",
    "width": "550px"
  }
};
const _hoisted_7 = {
  class: "first"
};
const _hoisted_8 = {
  key: 0,
  src: "plugins/UsersManager/images/ok.png",
  class: "accessGranted"
};
const _hoisted_9 = ["onClick"];
const _hoisted_10 = {
  class: "ui-confirm",
  id: "confirmUpdateAccessToAllSites",
  ref: "confirmUpdateAccessToAllSites"
};
const _hoisted_11 = ["textContent"];
const _hoisted_12 = ["value"];
const _hoisted_13 = ["value"];
function render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_SiteSelector = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("SiteSelector");
  const _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DescriptionAccessTab')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_1, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_3, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_SiteSelector, {
    "default-to-first-site": true,
    "show-selected-site": true,
    "show-all-sites-item": _ctx.hasSuperUserAccess,
    "switch-site-on-select": false,
    "only-sites-with-admin-access": true,
    "all-sites-text": _ctx.translate('UsersManager_ApplyToAllWebsites'),
    "model-value": _ctx.site,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => {
      _ctx.site = $event;
      _ctx.updateGroupAccessList();
    })
  }, null, 8, ["show-all-sites-item", "all-sites-text", "model-value"])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_5, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", _hoisted_6, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", _hoisted_7, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_Group')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_PrivNone')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_PrivView')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_PrivWrite')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('UsersManager_PrivAdmin')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.groupAccess, ([groupName, groupAccess]) => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: groupName
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(groupName), 1), (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(['noaccess', 'view', 'write', 'admin'], access => {
      return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", {
        key: access
      }, [groupAccess == access ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("img", _hoisted_8)) : (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("img", {
        key: 1,
        src: "plugins/UsersManager/images/no-access.png",
        class: "updateAccess",
        onClick: $event => _ctx.onSetAccessClicked($event, groupName, access)
      }, null, 8, _hoisted_9)), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("   ")]);
    }), 64))]);
  }), 128))])])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isLoading,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", _hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", {
    textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmUpdateAccessToAllSitesText)
  }, null, 8, _hoisted_11), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, _hoisted_12), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, _hoisted_13)], 512)])])], 64);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=template&id=0d3bb2e8

// EXTERNAL MODULE: external "CoreHome"
var external_CoreHome_ = __webpack_require__("19dc");

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=script&lang=ts


/* harmony default export */ var TabManageGroupAccessvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    SiteSelector: external_CoreHome_["SiteSelector"]
  },
  data() {
    return {
      site: {
        id: external_CoreHome_["Matomo"].idSite,
        name: external_CoreHome_["Matomo"].currentSiteName
      },
      groupAccess: new Map(),
      isLoading: false,
      confirmUpdateAccessToAllSitesText: ''
    };
  },
  methods: {
    onSetAccessClicked(event, groupName, access) {
      const idSite = this.site.id;
      if (idSite === 'all') {
        this.confirmUpdateAccessToAllSitesText = Object(external_CoreHome_["translate"])('GroupPermissions_ChangeAccessToAllSitesConfirm', access, groupName);
        external_CoreHome_["Matomo"].helper.modalConfirm('#confirmUpdateAccessToAllSites', {
          yes: () => this.updateGroupAccess(idSite, groupName, access)
        });
      } else {
        this.updateGroupAccess(idSite, groupName, access);
      }
    },
    updateGroupAccess(idSite, groupName, access) {
      this.isLoading = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.setGroupAccess'
      }, {
        idSites: idSite,
        name: groupName,
        access
      }, {
        errorElement: '#ajaxErrorAccessGroupMember'
      }).then(() => {
        this.groupAccess.set(groupName, access);
      }).finally(() => {
        this.isLoading = false;
      });
    },
    updateGroupAccessList() {
      this.isLoading = true;
      const idSite = this.site.id;
      if (idSite === 'all') {
        external_CoreHome_["AjaxHelper"].post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getAllGroups'
        }, {
          filter_limit: -1
        }, {
          errorElement: '#ajaxErrorAccessGroupMember'
        }).then(response => {
          this.groupAccess.clear();
          const groupAccessTmp = [];
          response.forEach(group => {
            groupAccessTmp.push(group.name);
          });
          groupAccessTmp.sort().forEach(group => {
            this.groupAccess.set(group, 'noaccess');
          });
        }).finally(() => {
          this.isLoading = false;
        });
      } else {
        external_CoreHome_["AjaxHelper"].post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getGroupAccessFromSite'
        }, {
          idSite: this.site.id,
          filter_limit: -1
        }, {
          errorElement: '#ajaxErrorAccessGroupMember'
        }).then(response => {
          this.groupAccess.clear();
          Object.keys(response).sort().forEach(group => {
            this.groupAccess.set(group, response[group]);
          });
        }).finally(() => {
          this.isLoading = false;
        });
      }
    }
  },
  computed: {
    hasSuperUserAccess() {
      return !!external_CoreHome_["Matomo"].hasSuperUserAccess;
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroupAccess.vue



TabManageGroupAccessvue_type_script_lang_ts.render = render

/* harmony default export */ var TabManageGroupAccess = (TabManageGroupAccessvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=template&id=409769a8

const TabManageGroupsvue_type_template_id_409769a8_hoisted_1 = {
  class: "card"
};
const TabManageGroupsvue_type_template_id_409769a8_hoisted_2 = {
  class: "card-content",
  style: {
    "width": "600px"
  }
};
const TabManageGroupsvue_type_template_id_409769a8_hoisted_3 = {
  id: "ajaxErrorManageGroups",
  ref: "errorContainer"
};
function TabManageGroupsvue_type_template_id_409769a8_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_CreateGroup = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("CreateGroup");
  const _component_multiselect = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("multiselect");
  const _component_ManageGroup = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ManageGroup");
  const _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("p", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DescriptionGroupsTab')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_CreateGroup, {
    onGroupCreated: _cache[0] || (_cache[0] = $event => _ctx.onGroupCreated($event))
  }), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TabManageGroupsvue_type_template_id_409769a8_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TabManageGroupsvue_type_template_id_409769a8_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_ManageGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_multiselect, {
    options: _ctx.groups,
    "track-by": "idGroup",
    label: "name",
    modelValue: _ctx.selectedGroup,
    "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => _ctx.selectedGroup = $event)
  }, null, 8, ["options", "modelValue"]), _ctx.selectedGroup ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(_component_ManageGroup, {
    key: 0,
    group: _ctx.selectedGroup,
    onGroupRenamed: _cache[2] || (_cache[2] = $event => _ctx.onGroupRenamed($event)),
    onGroupDeleted: _cache[3] || (_cache[3] = $event => _ctx.onGroupDeleted($event))
  }, null, 8, ["group"])) : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("", true)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", TabManageGroupsvue_type_template_id_409769a8_hoisted_3, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isLoadingGroups || _ctx.isLoadingDefaultGroup,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"])], 64);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=template&id=409769a8

// CONCATENATED MODULE: ./plugins/GroupPermissions/node_modules/vue-multiselect/dist/vue-multiselect.esm.js


function isEmpty (opt) {
  if (opt === 0) return false
  if (Array.isArray(opt) && opt.length === 0) return true
  return !opt
}

function not (fun) {
  return (...params) => !fun(...params)
}

function includes (str, query) {
  /* istanbul ignore else */
  if (str === undefined) str = 'undefined';
  if (str === null) str = 'null';
  if (str === false) str = 'false';
  const text = str.toString().toLowerCase();
  return text.indexOf(query.trim()) !== -1
}

function stripGroups (options) {
  return options.filter((option) => !option.$isLabel)
}

function flattenOptions (values, label) {
  return (options) =>
    options.reduce((prev, curr) => {
      /* istanbul ignore else */
      if (curr[values] && curr[values].length) {
        prev.push({
          $groupLabel: curr[label],
          $isLabel: true
        });
        return prev.concat(curr[values])
      }
      return prev
    }, [])
}

const flow = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

var multiselectMixin = {
  data () {
    return {
      search: '',
      isOpen: false,
      preferredOpenDirection: 'below',
      optimizedHeight: this.maxHeight
    }
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
      default (option, label) {
        if (isEmpty(option)) return ''
        return label ? option[label] : option
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
      default () {
        return []
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
  mounted () {
    /* istanbul ignore else */
    if (!this.multiple && this.max) {
      console.warn('[Vue-Multiselect warn]: Max prop should not be used when prop Multiple equals false.');
    }
    if (
      this.preselectFirst &&
      !this.internalValue.length &&
      this.options.length
    ) {
      this.select(this.filteredOptions[0]);
    }
  },
  computed: {
    internalValue () {
      return this.modelValue || this.modelValue === 0
        ? Array.isArray(this.modelValue) ? this.modelValue : [this.modelValue]
        : []
    },
    filteredOptions () {
      const search = this.search || '';
      const normalizedSearch = search.toLowerCase().trim();

      let options = this.options.concat();

      /* istanbul ignore else */
      if (this.internalSearch) {
        options = this.groupValues
          ? this.filterAndFlat(options, normalizedSearch, this.label)
          : this.filterOptions(options, normalizedSearch, this.label, this.customLabel);
      } else {
        options = this.groupValues ? flattenOptions(this.groupValues, this.groupLabel)(options) : options;
      }

      options = this.hideSelected
        ? options.filter(not(this.isSelected))
        : options;

      /* istanbul ignore else */
      if (this.taggable && normalizedSearch.length && !this.isExistingOption(normalizedSearch)) {
        if (this.tagPosition === 'bottom') {
          options.push({ isTag: true, label: search });
        } else {
          options.unshift({ isTag: true, label: search });
        }
      }

      return options.slice(0, this.optionsLimit)
    },
    valueKeys () {
      if (this.trackBy) {
        return this.internalValue.map((element) => element[this.trackBy])
      } else {
        return this.internalValue
      }
    },
    optionKeys () {
      const options = this.groupValues ? this.flatAndStrip(this.options) : this.options;
      return options.map((element) => this.customLabel(element, this.label).toString().toLowerCase())
    },
    currentOptionLabel () {
      return this.multiple
        ? this.searchable ? '' : this.placeholder
        : this.internalValue.length
          ? this.getOptionLabel(this.internalValue[0])
          : this.searchable ? '' : this.placeholder
    }
  },
  watch: {
    internalValue: {
      handler () {
      /* istanbul ignore else */
        if (this.resetAfter && this.internalValue.length) {
          this.search = '';
          this.$emit('update:modelValue', this.multiple ? [] : null);
        }
      },
      deep: true
    },
    search () {
      this.$emit('search-change', this.search);
    }
  },
  emits: ['open', 'search-change', 'close', 'select', 'update:modelValue', 'remove', 'tag'],
  methods: {
    /**
     * Returns the internalValue in a way it can be emited to the parent
     * @returns {Object||Array||String||Integer}
     */
    getValue () {
      return this.multiple
        ? this.internalValue
        : this.internalValue.length === 0
          ? null
          : this.internalValue[0]
    },
    /**
     * Filters and then flattens the options list
     * @param  {Array}
     * @return {Array} returns a filtered and flat options list
     */
    filterAndFlat (options, search, label) {
      return flow(
        this.filterGroups(search, label, this.groupValues, this.groupLabel, this.customLabel),
        flattenOptions(this.groupValues, this.groupLabel)
      )(options)
    },
    /**
     * Flattens and then strips the group labels from the options list
     * @param  {Array}
     * @return {Array} returns a flat options list without group labels
     */
    flatAndStrip (options) {
      return flow(
        flattenOptions(this.groupValues, this.groupLabel),
        stripGroups
      )(options)
    },
    /**
     * Updates the search value
     * @param  {String}
     */
    updateSearch (query) {
      this.search = query;
    },
    /**
     * Finds out if the given query is already present
     * in the available options
     * @param  {String}
     * @return {Boolean} returns true if element is available
     */
    isExistingOption (query) {
      return !this.options
        ? false
        : this.optionKeys.indexOf(query) > -1
    },
    /**
     * Finds out if the given element is already present
     * in the result value
     * @param  {Object||String||Integer} option passed element to check
     * @returns {Boolean} returns true if element is selected
     */
    isSelected (option) {
      const opt = this.trackBy
        ? option[this.trackBy]
        : option;
      return this.valueKeys.indexOf(opt) > -1
    },
    /**
     * Finds out if the given option is disabled
     * @param  {Object||String||Integer} option passed element to check
     * @returns {Boolean} returns true if element is disabled
     */
    isOptionDisabled (option) {
      return !!option.$isDisabled
    },
    /**
     * Returns empty string when options is null/undefined
     * Returns tag query if option is tag.
     * Returns the customLabel() results and casts it to string.
     *
     * @param  {Object||String||Integer} Passed option
     * @returns {Object||String}
     */
    getOptionLabel (option) {
      if (isEmpty(option)) return ''
      /* istanbul ignore else */
      if (option.isTag) return option.label
      /* istanbul ignore else */
      if (option.$isLabel) return option.$groupLabel

      const label = this.customLabel(option, this.label);
      /* istanbul ignore else */
      if (isEmpty(label)) return ''
      return label
    },
    /**
     * Add the given option to the list of selected options
     * or sets the option as the selected option.
     * If option is already selected -> remove it from the results.
     *
     * @param  {Object||String||Integer} option to select/deselect
     * @param  {Boolean} block removing
     */
    select (option, key) {
      /* istanbul ignore else */
      if (option.$isLabel && this.groupSelect) {
        this.selectGroup(option);
        return
      }
      if (this.blockKeys.indexOf(key) !== -1 ||
        this.disabled ||
        option.$isDisabled ||
        option.$isLabel
      ) return
      /* istanbul ignore else */
      if (this.max && this.multiple && this.internalValue.length === this.max) return
      /* istanbul ignore else */
      if (key === 'Tab' && !this.pointerDirty) return
      if (option.isTag) {
        this.$emit('tag', option.label, this.id);
        this.search = '';
        if (this.closeOnSelect && !this.multiple) this.deactivate();
      } else {
        const isSelected = this.isSelected(option);

        if (isSelected) {
          if (key !== 'Tab') this.removeElement(option);
          return
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
    selectGroup (selectedGroup) {
      const group = this.options.find((option) => {
        return option[this.groupLabel] === selectedGroup.$groupLabel
      });

      if (!group) return

      if (this.wholeGroupSelected(group)) {
        this.$emit('remove', group[this.groupValues], this.id);

        const groupValues = this.trackBy ? group[this.groupValues].map(val => val[this.trackBy]) : group[this.groupValues];
        const newValue = this.internalValue.filter(
          option => groupValues.indexOf(this.trackBy ? option[this.trackBy] : option) === -1
        );

        this.$emit('update:modelValue', newValue);
      } else {
        const optionsToAdd = group[this.groupValues].filter(
          option => !(this.isOptionDisabled(option) || this.isSelected(option))
        );

        // if max is defined then just select options respecting max
        if (this.max) {
          optionsToAdd.splice(this.max - this.internalValue.length);
        }

        this.$emit('select', optionsToAdd, this.id);
        this.$emit(
          'update:modelValue',
          this.internalValue.concat(optionsToAdd)
        );
      }

      if (this.closeOnSelect) this.deactivate();
    },
    /**
     * Helper to identify if all values in a group are selected
     *
     * @param {Object} group to validated selected values against
     */
    wholeGroupSelected (group) {
      return group[this.groupValues].every((option) => this.isSelected(option) || this.isOptionDisabled(option)
      )
    },
    /**
     * Helper to identify if all values in a group are disabled
     *
     * @param {Object} group to check for disabled values
     */
    wholeGroupDisabled (group) {
      return group[this.groupValues].every(this.isOptionDisabled)
    },
    /**
     * Removes the given option from the selected options.
     * Additionally checks this.allowEmpty prop if option can be removed when
     * it is the last selected option.
     *
     * @param  {type} option description
     * @return {type}        description
     */
    removeElement (option, shouldClose = true) {
      /* istanbul ignore else */
      if (this.disabled) return
      /* istanbul ignore else */
      if (option.$isDisabled) return
      /* istanbul ignore else */
      if (!this.allowEmpty && this.internalValue.length <= 1) {
        this.deactivate();
        return
      }

      const index = typeof option === 'object'
        ? this.valueKeys.indexOf(option[this.trackBy])
        : this.valueKeys.indexOf(option);

      if (this.multiple) {
        const newValue = this.internalValue.slice(0, index).concat(this.internalValue.slice(index + 1));
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
    removeLastElement () {
      /* istanbul ignore else */
      if (this.blockKeys.indexOf('Delete') !== -1) return
      /* istanbul ignore else */
      if (this.search.length === 0 && Array.isArray(this.internalValue) && this.internalValue.length) {
        this.removeElement(this.internalValue[this.internalValue.length - 1], false);
      }
    },
    /**
     * Opens the multiselect’s dropdown.
     * Sets this.isOpen to TRUE
     */
    activate () {
      /* istanbul ignore else */
      if (this.isOpen || this.disabled) return

      this.adjustPosition();
      /* istanbul ignore else  */
      if (this.groupValues && this.pointer === 0 && this.filteredOptions.length) {
        this.pointer = 1;
      }

      this.isOpen = true;
      /* istanbul ignore else  */
      if (this.searchable) {
        if (!this.preserveSearch) this.search = '';
        if (!this.preventAutofocus) this.$nextTick(() => this.$refs.search && this.$refs.search.focus());
      } else if (!this.preventAutofocus) {
        if (typeof this.$el !== 'undefined') this.$el.focus();
      }
      this.$emit('open', this.id);
    },
    /**
     * Closes the multiselect’s dropdown.
     * Sets this.isOpen to FALSE
     */
    deactivate () {
      /* istanbul ignore else */
      if (!this.isOpen) return

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
    toggle () {
      this.isOpen
        ? this.deactivate()
        : this.activate();
    },
    /**
     * Updates the hasEnoughSpace variable used for
     * detecting where to expand the dropdown
     */
    adjustPosition () {
      if (typeof window === 'undefined') return

      const spaceAbove = this.$el.getBoundingClientRect().top;
      const spaceBelow = window.innerHeight - this.$el.getBoundingClientRect().bottom;
      const hasEnoughSpaceBelow = spaceBelow > this.maxHeight;

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
    filterOptions (options, search, label, customLabel) {
      return search
        ? options
          .filter((option) => includes(customLabel(option, label), search))
          .sort((a, b) => {
            if (typeof this.filteringSortFunc === 'function') {
              return this.filteringSortFunc(a, b)
            }
            return customLabel(a, label).length - customLabel(b, label).length
          })
        : options
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
    filterGroups (search, label, values, groupLabel, customLabel) {
      return (groups) => groups.map((group) => {
        /* istanbul ignore else */
        if (!group[values]) {
          console.warn('Options passed to vue-multiselect do not contain groups, despite the config.');
          return []
        }
        const groupOptions = this.filterOptions(group[values], search, label, customLabel);

        return groupOptions.length
          ? {
              [groupLabel]: group[groupLabel], [values]: groupOptions
            }
          : []
      })
    }
  }
};

var pointerMixin = {
  data () {
    return {
      pointer: 0,
      pointerDirty: false
    }
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
    pointerPosition () {
      return this.pointer * this.optionHeight
    },
    visibleElements () {
      return this.optimizedHeight / this.optionHeight
    }
  },
  watch: {
    filteredOptions () {
      this.pointerAdjust();
    },
    isOpen () {
      this.pointerDirty = false;
    },
    pointer () {
      this.$refs.search && this.$refs.search.setAttribute('aria-activedescendant', this.id + '-' + this.pointer.toString());
    }
  },
  methods: {
    optionHighlight (index, option) {
      return {
        'multiselect__option--highlight': index === this.pointer && this.showPointer,
        'multiselect__option--selected': this.isSelected(option)
      }
    },
    groupHighlight (index, selectedGroup) {
      if (!this.groupSelect) {
        return [
          'multiselect__option--disabled',
          { 'multiselect__option--group': selectedGroup.$isLabel }
        ]
      }

      const group = this.options.find((option) => {
        return option[this.groupLabel] === selectedGroup.$groupLabel
      });

      return group && !this.wholeGroupDisabled(group)
        ? [
            'multiselect__option--group',
            { 'multiselect__option--highlight': index === this.pointer && this.showPointer },
            { 'multiselect__option--group-selected': this.wholeGroupSelected(group) }
          ]
        : 'multiselect__option--disabled'
    },
    addPointerElement ({ key } = 'Enter') {
      /* istanbul ignore else */
      if (this.filteredOptions.length > 0) {
        this.select(this.filteredOptions[this.pointer], key);
      }
      this.pointerReset();
    },
    pointerForward () {
      /* istanbul ignore else */
      if (this.pointer < this.filteredOptions.length - 1) {
        this.pointer++;
        /* istanbul ignore next */
        if (this.$refs.list && this.$refs.list.scrollTop <= this.pointerPosition - (this.visibleElements - 1) * this.optionHeight) {
          this.$refs.list.scrollTop = this.pointerPosition - (this.visibleElements - 1) * this.optionHeight;
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerForward();
      }
      this.pointerDirty = true;
    },
    pointerBackward () {
      if (this.pointer > 0) {
        this.pointer--;
        /* istanbul ignore else */
        if (this.$refs.list && this.$refs.list.scrollTop >= this.pointerPosition) {
          this.$refs.list.scrollTop = this.pointerPosition;
        }
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[this.pointer].$isLabel &&
          !this.groupSelect
        ) this.pointerBackward();
      } else {
        /* istanbul ignore else */
        if (
          this.filteredOptions[this.pointer] &&
          this.filteredOptions[0].$isLabel &&
          !this.groupSelect
        ) this.pointerForward();
      }
      this.pointerDirty = true;
    },
    pointerReset () {
      /* istanbul ignore else */
      if (!this.closeOnSelect) return
      this.pointer = 0;
      /* istanbul ignore else */
      if (this.$refs.list) {
        this.$refs.list.scrollTop = 0;
      }
    },
    pointerAdjust () {
      /* istanbul ignore else */
      if (this.pointer >= this.filteredOptions.length - 1) {
        this.pointer = this.filteredOptions.length
          ? this.filteredOptions.length - 1
          : 0;
      }

      if (this.filteredOptions.length > 0 &&
        this.filteredOptions[this.pointer].$isLabel &&
        !this.groupSelect
      ) {
        this.pointerForward();
      }
    },
    pointerSet (index) {
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
      default () {
        return []
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
      default: (count) => `and ${count} more`
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
     * Uses Vue Teleport's feature. Teleports the open dropdown to the bottom of the body element
     * @default false
     * @type {Boolean}
     */
    useTeleport: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      dropdownStyles: {},
      ready: false
    }
  },
  computed: {
    hasOptionGroup () {
      return this.groupValues && this.groupLabel && this.groupSelect
    },
    isSingleLabelVisible () {
      return (
        (this.singleValue || this.singleValue === 0) &&
          (!this.isOpen || !this.searchable) &&
          !this.visibleValues.length
      )
    },
    isPlaceholderVisible () {
      return !this.internalValue.length && (!this.searchable || !this.isOpen)
    },
    visibleValues () {
      return this.multiple ? this.internalValue.slice(0, this.limit) : []
    },
    singleValue () {
      return this.internalValue[0]
    },
    deselectLabelText () {
      return this.showLabels ? this.deselectLabel : ''
    },
    deselectGroupLabelText () {
      return this.showLabels ? this.deselectGroupLabel : ''
    },
    selectLabelText () {
      return this.showLabels ? this.selectLabel : ''
    },
    selectGroupLabelText () {
      return this.showLabels ? this.selectGroupLabel : ''
    },
    selectedLabelText () {
      return this.showLabels ? this.selectedLabel : ''
    },
    inputStyle () {
      if (
        this.searchable ||
          (this.multiple && this.modelValue && this.modelValue.length)
      ) {
        // Hide input by setting the width to 0 allowing it to receive focus
        return this.isOpen
          ? { width: '100%' }
          : { width: '0', position: 'absolute', padding: '0' }
      }
      return ''
    },
    contentStyle () {
      return this.options.length
        ? { display: 'inline-block' }
        : { display: 'block' }
    },
    isAbove () {
      if (this.openDirection === 'above' || this.openDirection === 'top') {
        return true
      } else if (
        this.openDirection === 'below' ||
          this.openDirection === 'bottom'
      ) {
        return false
      } else {
        return this.preferredOpenDirection === 'above'
      }
    },
    showSearchInput () {
      return (
        this.searchable &&
          (this.hasSingleSelectedSlot &&
            (this.visibleSingleValue || this.visibleSingleValue === 0)
            ? this.isOpen
            : true)
      )
    },
    isRequired () {
      if (this.required === false) {
        return false
      }
      // if we have a value, any value, then this isn't required
      return this.internalValue.length <= 0
    }
  },
  watch: {
    isOpen (val) {
      if (val) {
        if (this.useTeleport) {
          this.ready = false;
          // This helps with the positioning of the open dropdown when teleport is being used
          this.$nextTick(() => {
            const rect = this.$el.getBoundingClientRect();
            this.dropdownStyles = {
              position: 'absolute',
              top: `${rect.bottom + window.scrollY}px`,
              left: `${rect.left + window.scrollX}px`,
              width: `${rect.width}px`,
              zIndex: 9999
            };
            this.ready = true;
          });
        } else {
          this.ready = true;
        }
      }
    }
  }
};

const vue_multiselect_esm_hoisted_1 = ["tabindex", "aria-expanded", "aria-owns", "aria-activedescendant"];
const vue_multiselect_esm_hoisted_2 = {
  ref: "tags",
  class: "multiselect__tags"
};
const vue_multiselect_esm_hoisted_3 = { class: "multiselect__tags-wrap" };
const vue_multiselect_esm_hoisted_4 = ["textContent"];
const vue_multiselect_esm_hoisted_5 = ["onKeypress", "onMousedown"];
const vue_multiselect_esm_hoisted_6 = ["textContent"];
const vue_multiselect_esm_hoisted_7 = { class: "multiselect__spinner" };
const vue_multiselect_esm_hoisted_8 = ["name", "id", "spellcheck", "placeholder", "required", "value", "disabled", "tabindex", "aria-label", "aria-controls"];
const vue_multiselect_esm_hoisted_9 = ["id", "aria-multiselectable"];
const vue_multiselect_esm_hoisted_10 = { key: 0 };
const vue_multiselect_esm_hoisted_11 = { class: "multiselect__option" };
const vue_multiselect_esm_hoisted_12 = ["aria-selected", "id", "role"];
const vue_multiselect_esm_hoisted_13 = ["onClick", "onMouseenter", "data-select", "data-selected", "data-deselect"];
const _hoisted_14 = ["data-select", "data-deselect", "onMouseenter", "onMousedown"];
const _hoisted_15 = { class: "multiselect__option" };
const _hoisted_16 = { class: "multiselect__option" };

function vue_multiselect_esm_render(_ctx, _cache, $props, $setup, $data, $options) {
  return (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
    tabindex: _ctx.searchable ? -1 : $props.tabindex,
    class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([{ 'multiselect--active': _ctx.isOpen, 'multiselect--disabled': $props.disabled, 'multiselect--above': $options.isAbove, 'multiselect--has-options-group': $options.hasOptionGroup }, "multiselect"]),
    onFocus: _cache[14] || (_cache[14] = $event => (_ctx.activate())),
    onBlur: _cache[15] || (_cache[15] = $event => (_ctx.searchable ? false : _ctx.deactivate())),
    onKeydown: [
      _cache[16] || (_cache[16] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.pointerForward()), ["self","prevent"]), ["down"])),
      _cache[17] || (_cache[17] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.pointerBackward()), ["self","prevent"]), ["up"]))
    ],
    onKeypress: _cache[18] || (_cache[18] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.addPointerElement($event)), ["stop","self"]), ["enter","tab"])),
    onKeyup: _cache[19] || (_cache[19] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])($event => (_ctx.deactivate()), ["esc"])),
    role: "combobox",
    "aria-expanded": _ctx.isOpen,
    "aria-owns": 'listbox-'+_ctx.id,
    "aria-activedescendant": _ctx.isOpen && _ctx.pointer !== null ? _ctx.id + '-' + _ctx.pointer : null
  }, [
    Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "caret", { toggle: _ctx.toggle }, () => [
      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", {
        onMousedown: _cache[0] || (_cache[0] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.toggle()), ["prevent","stop"])),
        class: "multiselect__select"
      }, null, 32 /* NEED_HYDRATION */)
    ]),
    Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "clear", { search: _ctx.search }),
    Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_2, [
      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "selection", {
        search: _ctx.search,
        remove: _ctx.removeElement,
        values: $options.visibleValues,
        isOpen: _ctx.isOpen
      }, () => [
        Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_3, [
          (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])($options.visibleValues, (option, index) => {
            return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "tag", {
              option: option,
              search: _ctx.search,
              remove: _ctx.removeElement
            }, () => [
              (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
                class: "multiselect__tag",
                key: index,
                onMousedown: _cache[1] || (_cache[1] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(() => {}, ["prevent"]))
              }, [
                Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
                  textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option))
                }, null, 8 /* PROPS */, vue_multiselect_esm_hoisted_4),
                Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("i", {
                  tabindex: "1",
                  onKeypress: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.removeElement(option)), ["prevent"]), ["enter"]),
                  onMousedown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.removeElement(option)), ["prevent"]),
                  class: "multiselect__tag-icon"
                }, null, 40 /* PROPS, NEED_HYDRATION */, vue_multiselect_esm_hoisted_5)
              ], 32 /* NEED_HYDRATION */))
            ])
          }), 256 /* UNKEYED_FRAGMENT */))
        ], 512 /* NEED_PATCH */), [
          [external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $options.visibleValues.length > 0]
        ]),
        (_ctx.internalValue && _ctx.internalValue.length > $props.limit)
          ? Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "limit", { key: 0 }, () => [
              Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("strong", {
                class: "multiselect__strong",
                textContent: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])($props.limitText(_ctx.internalValue.length - $props.limit))
              }, null, 8 /* PROPS */, vue_multiselect_esm_hoisted_6)
            ])
          : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)
      ]),
      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Transition"], { name: "multiselect__loading" }, {
        default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [
          Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "loading", {}, () => [
            Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", vue_multiselect_esm_hoisted_7, null, 512 /* NEED_PATCH */), [
              [external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.loading]
            ])
          ])
        ]),
        _: 3 /* FORWARDED */
      }),
      (_ctx.searchable)
        ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("input", {
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
            onInput: _cache[2] || (_cache[2] = $event => (_ctx.updateSearch($event.target.value))),
            onFocus: _cache[3] || (_cache[3] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.activate()), ["prevent"])),
            onBlur: _cache[4] || (_cache[4] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.deactivate()), ["prevent"])),
            onKeyup: _cache[5] || (_cache[5] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])($event => (_ctx.deactivate()), ["esc"])),
            onKeydown: [
              _cache[6] || (_cache[6] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.pointerForward()), ["prevent"]), ["down"])),
              _cache[7] || (_cache[7] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.pointerBackward()), ["prevent"]), ["up"])),
              _cache[9] || (_cache[9] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.removeLastElement()), ["stop"]), ["delete"]))
            ],
            onKeypress: _cache[8] || (_cache[8] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withKeys"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.addPointerElement($event)), ["prevent","stop","self"]), ["enter"])),
            class: "multiselect__input",
            "aria-controls": 'listbox-'+_ctx.id
          }, null, 44 /* STYLE, PROPS, NEED_HYDRATION */, vue_multiselect_esm_hoisted_8))
        : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true),
      ($options.isSingleLabelVisible)
        ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
            key: 1,
            class: "multiselect__single",
            onMousedown: _cache[10] || (_cache[10] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => (_ctx.toggle && _ctx.toggle(...args)), ["prevent"]))
          }, [
            Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "singleLabel", { option: $options.singleValue }, () => [
              Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.currentOptionLabel), 1 /* TEXT */)
            ])
          ], 32 /* NEED_HYDRATION */))
        : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true),
      ($options.isPlaceholderVisible)
        ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
            key: 2,
            class: "multiselect__placeholder",
            onMousedown: _cache[11] || (_cache[11] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])((...args) => (_ctx.toggle && _ctx.toggle(...args)), ["prevent"]))
          }, [
            Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "placeholder", {}, () => [
              Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.placeholder), 1 /* TEXT */)
            ])
          ], 32 /* NEED_HYDRATION */))
        : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)
    ], 512 /* NEED_PATCH */),
    (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Teleport"], {
      to: "body",
      disabled: !$props.useTeleport
    }, [
      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Transition"], { name: "multiselect" }, {
        default: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withCtx"])(() => [
          (_ctx.isOpen && $data.ready)
            ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", {
                key: 0,
                class: "multiselect__content-wrapper",
                onFocus: _cache[12] || (_cache[12] = (...args) => (_ctx.activate && _ctx.activate(...args))),
                tabindex: "-1",
                onMousedown: _cache[13] || (_cache[13] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])(() => {}, ["prevent"])),
                style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])([$data.dropdownStyles, { maxHeight: _ctx.optimizedHeight + 'px' }]),
                ref: "list"
              }, [
                Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("ul", {
                  class: "multiselect__content",
                  style: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeStyle"])($options.contentStyle),
                  role: "listbox",
                  id: 'listbox-'+_ctx.id,
                  "aria-multiselectable": _ctx.multiple
                }, [
                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "beforeList"),
                  (_ctx.multiple && _ctx.max === _ctx.internalValue.length)
                    ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", vue_multiselect_esm_hoisted_10, [
                        Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", vue_multiselect_esm_hoisted_11, [
                          Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "maxElements", {}, () => [
                            Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("Maximum of " + Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.max) + " options selected. First remove a selected option to select another.", 1 /* TEXT */)
                          ])
                        ])
                      ]))
                    : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true),
                  (!_ctx.max || _ctx.internalValue.length < _ctx.max)
                    ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], { key: 1 }, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.filteredOptions, (option, index) => {
                        return (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("li", {
                          class: "multiselect__element",
                          key: index,
                          "aria-selected": _ctx.isSelected(option),
                          id: _ctx.id + '-' + index,
                          role: !(option && (option.$isLabel || option.$isDisabled)) ? 'option' : null
                        }, [
                          (!(option && (option.$isLabel || option.$isDisabled)))
                            ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
                                key: 0,
                                class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([_ctx.optionHighlight(index, option), "multiselect__option"]),
                                onClick: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.select(option)), ["stop"]),
                                onMouseenter: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.pointerSet(index)), ["self"]),
                                "data-select": option && option.isTag ? _ctx.tagPlaceholder : $options.selectLabelText,
                                "data-selected": $options.selectedLabelText,
                                "data-deselect": $options.deselectLabelText
                              }, [
                                Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "option", {
                                  option: option,
                                  search: _ctx.search,
                                  index: index
                                }, () => [
                                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option)), 1 /* TEXT */)
                                ])
                              ], 42 /* CLASS, PROPS, NEED_HYDRATION */, vue_multiselect_esm_hoisted_13))
                            : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true),
                          (option && (option.$isLabel || option.$isDisabled))
                            ? (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("span", {
                                key: 1,
                                "data-select": _ctx.groupSelect && $options.selectGroupLabelText,
                                "data-deselect": _ctx.groupSelect && $options.deselectGroupLabelText,
                                class: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["normalizeClass"])([_ctx.groupHighlight(index, option), "multiselect__option"]),
                                onMouseenter: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.groupSelect && _ctx.pointerSet(index)), ["self"]),
                                onMousedown: Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withModifiers"])($event => (_ctx.selectGroup(option)), ["prevent"])
                              }, [
                                Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "option", {
                                  option: option,
                                  search: _ctx.search,
                                  index: index
                                }, () => [
                                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.getOptionLabel(option)), 1 /* TEXT */)
                                ])
                              ], 42 /* CLASS, PROPS, NEED_HYDRATION */, _hoisted_14))
                            : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)
                        ], 8 /* PROPS */, vue_multiselect_esm_hoisted_12))
                      }), 128 /* KEYED_FRAGMENT */))
                    : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true),
                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", null, [
                    Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_15, [
                      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "noResult", { search: _ctx.search }, () => [
                        _cache[20] || (_cache[20] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("No elements found. Consider changing the search query."))
                      ])
                    ])
                  ], 512 /* NEED_PATCH */), [
                    [external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.showNoResults && (_ctx.filteredOptions.length === 0 && _ctx.search && !$props.loading)]
                  ]),
                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("li", null, [
                    Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", _hoisted_16, [
                      Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "noOptions", {}, () => [
                        _cache[21] || (_cache[21] = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createTextVNode"])("List is empty."))
                      ])
                    ])
                  ], 512 /* NEED_PATCH */), [
                    [external_commonjs_vue_commonjs2_vue_root_Vue_["vShow"], $props.showNoOptions && ((_ctx.options.length === 0 || ($options.hasOptionGroup === true && _ctx.filteredOptions.length === 0)) && !_ctx.search && !$props.loading)]
                  ]),
                  Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderSlot"])(_ctx.$slots, "afterList")
                ], 12 /* STYLE, PROPS */, vue_multiselect_esm_hoisted_9)
              ], 36 /* STYLE, NEED_HYDRATION */))
            : Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createCommentVNode"])("v-if", true)
        ]),
        _: 3 /* FORWARDED */
      })
    ], 8 /* PROPS */, ["disabled"]))
  ], 42 /* CLASS, PROPS, NEED_HYDRATION */, vue_multiselect_esm_hoisted_1))
}

script.render = vue_multiselect_esm_render;



// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/CreateGroup.vue?vue&type=template&id=1b52b64a

const CreateGroupvue_type_template_id_1b52b64a_hoisted_1 = {
  class: "card"
};
const CreateGroupvue_type_template_id_1b52b64a_hoisted_2 = {
  class: "card-content",
  style: {
    "width": "600px"
  }
};
const CreateGroupvue_type_template_id_1b52b64a_hoisted_3 = ["value"];
const CreateGroupvue_type_template_id_1b52b64a_hoisted_4 = {
  id: "ajaxErrorCreateGroup",
  ref: "errorContainer"
};
function CreateGroupvue_type_template_id_1b52b64a_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("div", CreateGroupvue_type_template_id_1b52b64a_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", CreateGroupvue_type_template_id_1b52b64a_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_CreateNewGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "text",
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => _ctx.groupName = $event)
  }, null, 512), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], _ctx.groupName]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "button",
    value: _ctx.translate('GroupPermissions_CreateNewGroupButton'),
    style: {
      "padding": "8px"
    },
    onClick: _cache[1] || (_cache[1] = $event => _ctx.createGroup(_ctx.groupName))
  }, null, 8, CreateGroupvue_type_template_id_1b52b64a_hoisted_3)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", CreateGroupvue_type_template_id_1b52b64a_hoisted_4, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isCreatingGroup,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"])])])]);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/CreateGroup.vue?vue&type=template&id=1b52b64a

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/CreateGroup.vue?vue&type=script&lang=ts


/* harmony default export */ var CreateGroupvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"]
  },
  data() {
    return {
      groupName: '',
      isCreatingGroup: false
    };
  },
  emits: ['group-created'],
  methods: {
    createGroup(groupName) {
      this.isCreatingGroup = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.createGroup'
      }, {
        groupName
      }, {
        errorElement: '#ajaxErrorCreateGroup'
      }).then(response => {
        this.$emit('group-created', response);
        this.groupName = '';
      }).finally(() => {
        this.isCreatingGroup = false;
      });
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/CreateGroup.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/CreateGroup.vue



CreateGroupvue_type_script_lang_ts.render = CreateGroupvue_type_template_id_1b52b64a_render

/* harmony default export */ var CreateGroup = (CreateGroupvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroup.vue?vue&type=template&id=40328eec

const ManageGroupvue_type_template_id_40328eec_hoisted_1 = {
  style: {
    "margin-top": "70px"
  }
};
const ManageGroupvue_type_template_id_40328eec_hoisted_2 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_3 = {
  class: "ui-confirm",
  id: "confirmRenameGroup"
};
const ManageGroupvue_type_template_id_40328eec_hoisted_4 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_5 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_6 = {
  id: "ajaxErrorRenameGroup",
  ref: "errorContainer"
};
const ManageGroupvue_type_template_id_40328eec_hoisted_7 = {
  style: {
    "margin-top": "70px"
  }
};
const ManageGroupvue_type_template_id_40328eec_hoisted_8 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_9 = {
  class: "ui-confirm",
  id: "confirmDeleteGroup"
};
const ManageGroupvue_type_template_id_40328eec_hoisted_10 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_11 = ["value"];
const ManageGroupvue_type_template_id_40328eec_hoisted_12 = {
  id: "ajaxErrorDeleteGroup",
  ref: "errorContainer"
};
function ManageGroupvue_type_template_id_40328eec_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ManageGroupMembers = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ManageGroupMembers");
  const _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ManageGroupMembers, {
    group: _ctx.group
  }, null, 8, ["group"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_RenameGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["withDirectives"])(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "text",
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => this.newGroupName = $event)
  }, null, 512), [[external_commonjs_vue_commonjs2_vue_root_Vue_["vModelText"], this.newGroupName]]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "button",
    value: _ctx.translate('GroupPermissions_RenameGroupButton'),
    style: {
      "padding": "8px"
    },
    onClick: _cache[1] || (_cache[1] = $event => _ctx.confirmRenameGroup())
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_2)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_3, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmRenameGroupText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_4), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_5)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_6, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isRenaming,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_7, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_DeleteGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "button",
    value: _ctx.translate('GroupPermissions_DeleteGroupButton'),
    style: {
      "padding": "8px"
    },
    onClick: _cache[2] || (_cache[2] = $event => _ctx.confirmDeleteGroup())
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_8)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_9, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmDeleteGroupText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_10), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, ManageGroupvue_type_template_id_40328eec_hoisted_11)]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupvue_type_template_id_40328eec_hoisted_12, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isDeleting,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"])], 64);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroup.vue?vue&type=template&id=40328eec

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-babel/node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/@vue/cli-plugin-babel/node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist/templateLoader.js??ref--6!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroupMembers.vue?vue&type=template&id=f47bbfe4

const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_1 = {
  class: "entityContainer",
  style: {
    "width": "600px",
    "margin-top": "16px"
  }
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_2 = {
  class: "entityTable dataTable",
  style: {
    "display": "inline-table",
    "width": "550px"
  }
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_3 = {
  class: "login"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_4 = {
  class: "text-center"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_5 = ["onClick", "title"];
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_6 = /*#__PURE__*/Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("span", {
  class: "icon-delete"
}, null, -1);
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_7 = [ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_6];
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_8 = {
  id: "ajaxErrorLoadMembers",
  ref: "errorContainer"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_9 = {
  style: {
    "margin-top": "70px"
  }
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_10 = {
  class: "groupPermissionsGroupAddMemberWrapper"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_11 = ["value"];
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_12 = {
  id: "ajaxErrorLoadLogins",
  ref: "errorContainer"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_13 = {
  id: "ajaxErrorAddMember",
  ref: "errorContainer"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_14 = {
  class: "ui-confirm",
  id: "confirmRemoveMember",
  ref: "confirmRemoveMember"
};
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_15 = ["value"];
const ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_16 = ["value"];
function ManageGroupMembersvue_type_template_id_f47bbfe4_render(_ctx, _cache, $props, $setup, $data, $options) {
  const _component_ActivityIndicator = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("ActivityIndicator");
  const _component_multiselect = Object(external_commonjs_vue_commonjs2_vue_root_Vue_["resolveComponent"])("multiselect");
  return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_ManageGroupMembers')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_1, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("table", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_2, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("thead", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tr", null, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('General_Username')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("th", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_RemoveFromGroup')), 1)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("tbody", null, [(Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(true), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])(external_commonjs_vue_commonjs2_vue_root_Vue_["Fragment"], null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["renderList"])(_ctx.members, login => {
    return Object(external_commonjs_vue_commonjs2_vue_root_Vue_["openBlock"])(), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementBlock"])("tr", {
      key: login
    }, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_3, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(login), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("td", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_4, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("button", {
      class: "groupPermissionsRemoveMember btn btn-flat",
      onClick: $event => _ctx.confirmRemoveMember(login),
      title: _ctx.translate('GroupPermissions_RemoveFromGroup')
    }, ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_7, 8, ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_5)])]);
  }), 128))])])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_8, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isLoadingMembers,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_9, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h3", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.translate('GroupPermissions_AddUserToGroup')), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_10, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_multiselect, {
    options: _ctx.logins,
    placeholder: _ctx.translate('GroupPermissions_SelectNewUser'),
    modelValue: _ctx.selectedLoginToAdd,
    "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => _ctx.selectedLoginToAdd = $event)
  }, null, 8, ["options", "placeholder", "modelValue"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    type: "button",
    onClick: _cache[1] || (_cache[1] = $event => _ctx.addMember()),
    value: _ctx.translate('GroupPermissions_AddUserToGroupButton'),
    style: {
      "padding": "8px",
      "margin-top": "8px"
    }
  }, null, 8, ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_11)])]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_12, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_13, null, 512), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createVNode"])(_component_ActivityIndicator, {
    loading: _ctx.isLoadingLogins || _ctx.isAddingMember,
    style: {
      "padding-top": "10px"
    }
  }, null, 8, ["loading"]), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("div", ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_14, [Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("h2", null, Object(external_commonjs_vue_commonjs2_vue_root_Vue_["toDisplayString"])(_ctx.confirmRemoveMemberText), 1), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "yes",
    type: "button",
    value: _ctx.translate('General_Yes')
  }, null, 8, ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_15), Object(external_commonjs_vue_commonjs2_vue_root_Vue_["createElementVNode"])("input", {
    role: "no",
    type: "button",
    value: _ctx.translate('General_No')
  }, null, 8, ManageGroupMembersvue_type_template_id_f47bbfe4_hoisted_16)], 512)], 64);
}
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroupMembers.vue?vue&type=template&id=f47bbfe4

// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroupMembers.vue?vue&type=script&lang=ts



/* harmony default export */ var ManageGroupMembersvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    Multiselect: script
  },
  data() {
    return {
      members: [],
      logins: [],
      selectedLoginToAdd: '',
      confirmRemoveMemberText: '',
      isLoadingMembers: false,
      isLoadingLogins: false,
      isAddingMember: false,
      isRemovingMember: false
    };
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.loadGroupMembers();
    this.loadLogins();
  },
  methods: {
    loadGroupMembers() {
      this.isLoadingMembers = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.getMembersOfGroup'
      }, {
        idGroup: this.group.idGroup,
        filter_limit: -1
      }, {
        errorElement: '#ajaxErrorLoadMembers'
      }).then(response => {
        this.members = response.reduce((acc, member) => {
          acc.push(member.login);
          return acc;
        }, []);
        this.members.sort();
      }).finally(() => {
        this.isLoadingMembers = false;
      });
    },
    loadLogins() {
      this.isLoadingLogins = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'UsersManager.getUsersLogin'
      }, {
        filter_limit: -1
      }, {
        errorElement: '#ajaxErrorLoadLogins'
      }).then(response => {
        this.logins = response;
        this.logins.sort();
      }).finally(() => {
        this.isLoadingLogins = false;
      });
    },
    addMember() {
      this.isAddingMember = true;
      const loginToAdd = this.selectedLoginToAdd;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.addUserToGroup'
      }, {
        idGroup: this.group.idGroup,
        login: loginToAdd
      }, {
        errorElement: '#ajaxErrorAddMember'
      }).then(() => {
        this.members.push(loginToAdd);
        this.members.sort();
        this.selectedLoginToAdd = '';
      }).finally(() => {
        this.isAddingMember = false;
      });
    },
    confirmRemoveMember(member) {
      this.confirmRemoveMemberText = Object(external_CoreHome_["translate"])('GroupPermissions_RemoveFromGroupConfirm', member, this.group.name);
      external_CoreHome_["Matomo"].helper.modalConfirm('#confirmRemoveMember', {
        yes: () => this.removeMember(member)
      });
    },
    removeMember(member) {
      this.isRemovingMember = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.removeUserFromGroup'
      }, {
        idGroup: this.group.idGroup,
        login: member
      }, {
        errorElement: '#ajaxErrorManageGroupMembers'
      }).then(() => {
        this.members = this.members.filter(login => login !== member);
      }).finally(() => {
        this.isRemovingMember = false;
      });
    }
  },
  watch: {
    group() {
      this.loadGroupMembers();
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroupMembers.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroupMembers.vue



ManageGroupMembersvue_type_script_lang_ts.render = ManageGroupMembersvue_type_template_id_f47bbfe4_render

/* harmony default export */ var ManageGroupMembers = (ManageGroupMembersvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroup.vue?vue&type=script&lang=ts



/* harmony default export */ var ManageGroupvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    ManageGroupMembers: ManageGroupMembers
  },
  data() {
    return {
      newGroupName: '',
      confirmRenameGroupText: '',
      confirmDeleteGroupText: '',
      isRenaming: false,
      isDeleting: false
    };
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  emits: ['group-renamed', 'group-deleted'],
  mounted() {
    this.onGroupUpdated();
  },
  methods: {
    onGroupUpdated() {
      this.newGroupName = this.group.name;
      external_CoreHome_["MatomoUrl"].updateHash(Object.assign(Object.assign({}, external_CoreHome_["MatomoUrl"].hashParsed.value), {}, {
        idGroup: this.group.idGroup
      }));
    },
    confirmRenameGroup() {
      this.confirmRenameGroupText = Object(external_CoreHome_["translate"])('GroupPermissions_RenameGroupConfirm', this.group.name, this.newGroupName);
      external_CoreHome_["Matomo"].helper.modalConfirm('#confirmRenameGroup', {
        yes: () => this.renameGroup()
      });
    },
    renameGroup() {
      this.isRenaming = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.renameGroup'
      }, {
        idGroup: this.group.idGroup,
        newName: this.newGroupName
      }, {
        errorElement: '#ajaxErrorRenameGroup'
      }).then(() => {
        this.$emit('group-renamed', {
          idGroup: this.group.idGroup,
          name: this.newGroupName
        });
      }).finally(() => {
        this.isRenaming = false;
      });
    },
    confirmDeleteGroup() {
      this.confirmDeleteGroupText = Object(external_CoreHome_["translate"])('GroupPermissions_DeleteGroupConfirm', this.group.name);
      external_CoreHome_["Matomo"].helper.modalConfirm('#confirmDeleteGroup', {
        yes: () => this.deleteGroup()
      });
    },
    deleteGroup() {
      this.isDeleting = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.deleteGroup'
      }, {
        idGroup: this.group.idGroup
      }, {
        errorElement: '#ajaxErrorDeleteGroup'
      }).then(() => {
        this.$emit('group-deleted', this.group);
      }).finally(() => {
        this.isDeleting = false;
      });
    }
  },
  watch: {
    group() {
      this.onGroupUpdated();
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroup.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/ManageGroup.vue



ManageGroupvue_type_script_lang_ts.render = ManageGroupvue_type_template_id_40328eec_render

/* harmony default export */ var ManageGroup = (ManageGroupvue_type_script_lang_ts);
// CONCATENATED MODULE: ./node_modules/@vue/cli-plugin-typescript/node_modules/cache-loader/dist/cjs.js??ref--15-0!./node_modules/babel-loader/lib!./node_modules/@vue/cli-plugin-typescript/node_modules/ts-loader??ref--15-2!./node_modules/@vue/cli-service/node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/@vue/cli-service/node_modules/vue-loader-v16/dist??ref--1-1!./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=script&lang=ts





/* harmony default export */ var TabManageGroupsvue_type_script_lang_ts = (Object(external_commonjs_vue_commonjs2_vue_root_Vue_["defineComponent"])({
  components: {
    ActivityIndicator: external_CoreHome_["ActivityIndicator"],
    Multiselect: script,
    CreateGroup: CreateGroup,
    ManageGroup: ManageGroup
  },
  data() {
    return {
      groups: [],
      selectedGroup: undefined,
      isLoadingGroups: false,
      isLoadingDefaultGroup: false
    };
  },
  mounted() {
    this.loadGroupList();
  },
  methods: {
    loadGroupList() {
      this.isLoadingGroups = true;
      external_CoreHome_["AjaxHelper"].post({
        module: 'API',
        format: 'json',
        method: 'GroupPermissions.getAllGroups'
      }, {
        filter_limit: -1
      }, {
        errorElement: '#ajaxErrorManageGroups'
      }).then(response => {
        this.groups = response;
      }).finally(() => {
        this.isLoadingGroups = false;
        this.loadDefaultGroup();
      });
    },
    loadDefaultGroup() {
      const idGroup = external_CoreHome_["MatomoUrl"].getSearchParam('idGroup');
      if (idGroup) {
        this.isLoadingDefaultGroup = true;
        external_CoreHome_["AjaxHelper"].post({
          module: 'API',
          format: 'json',
          method: 'GroupPermissions.getGroupWithId'
        }, {
          idGroup
        }, {
          errorElement: '#ajaxErrorManageGroups'
        }).then(response => {
          this.selectedGroup = {
            idGroup: response.idGroup,
            name: response.name
          };
        }).finally(() => {
          this.isLoadingDefaultGroup = false;
        });
      } else if (this.groups.length > 0) {
        [this.selectedGroup] = this.groups;
      }
    },
    onGroupCreated(group) {
      this.groups.push(group);
      this.sortGroups();
      this.selectedGroup = group;
    },
    onGroupRenamed(group) {
      const groupIndex = this.groups.findIndex(g => g.idGroup === group.idGroup);
      this.groups[groupIndex].name = group.name;
      this.sortGroups();
      this.selectedGroup = group;
    },
    onGroupDeleted(group) {
      this.groups = this.groups.filter(g => g.idGroup !== group.idGroup);
      this.selectedGroup = this.groups.length > 0 ? this.groups[0] : undefined;
    },
    sortGroups() {
      this.groups.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
}));
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue?vue&type=script&lang=ts
 
// CONCATENATED MODULE: ./plugins/GroupPermissions/vue/src/GroupPermissions/TabManageGroups.vue



TabManageGroupsvue_type_script_lang_ts.render = TabManageGroupsvue_type_template_id_409769a8_render

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