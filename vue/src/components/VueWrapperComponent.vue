<template>
  <div>
  <div v-pre>
    <dashboard api=api wrapper="true" editmode="false" iframe="true" selectedpage="0" public="false" class="flex layout-column" v-pre></dashboard>
  </div>
  <script v-on:load="st=1" v-if="!alreadyloaded" type="application/javascript" v-bind:src="platformbase + '/controlpanel/static/dashboards/scripts/vendor.js'"></script>
  <script v-on:load="st=2" v-if="st>0" type="application/javascript" v-bind:src="platformbase + '/controlpanel/static/dashboards/gridster.js'"></script>
  <script v-on:load="vt=1" v-if="!alreadyloaded" type="application/javascript" v-bind:src="platformbase + '/controlpanel/static/vendor/onesait-ds/lib/vue.min.js'"></script>
  <script v-on:load="vt=2" v-if="vt>0" type="application/javascript" v-bind:src="platformbase + '/controlpanel/static/vendor/onesait-ds/lib/index.js'"></script>
  <script v-on:load="startApp()" v-if="st>1 && vt>1" type="application/javascript" v-bind:src="platformbase + '/controlpanel/static/dashboards/scripts/app.js'"></script>
  </div>
</template>

<script>

export default {
  /*global angular*/
  /*eslint no-undef: "error"*/
  name: 'dashboard-wrapper',
  props: ['id', 'token', 'model', 'i18n', 'api', 'dashboard', 'editmode', 'params', 'platformbase'],
  created: function () {
    this.getURLParameters = function() {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      var urlParametersMap = {};
      for (var i = 0; i < sURLVariables.length; i++) {
        if (sURLVariables[i].length > 0) {
          var sParameterName = sURLVariables[i].split('=');
          if (sParameterName[0] !== "oauthtoken") {
            urlParametersMap[sParameterName[0]] = sParameterName[1];
          }
        }
      }

      return urlParametersMap;
    }
    this.isEmptyJson = function(obj) {
      return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
    this.setConfig = function(token, params, platformbase) {
      this.__env = window.__env || {};
      this.__env.socketEndpointConnect = (platformbase?platformbase:'') + '/dashboardengine/dsengine/solver';
      this.__env.socketEndpointSend = '/dsengine/solver';
      this.__env.socketEndpointSubscribe = '/dsengine/broker';
      this.__env.endpointControlPanel = (platformbase?platformbase:'') + '/controlpanel';
      this.__env.endpointDashboardEngine = (platformbase?platformbase:'') + '/dashboardengine';
      this.__env.dashboardEngineUsername = '';
      this.__env.dashboardEnginePassword = '';
      this.__env.dashboardEngineOauthtoken = token;
      this.__env.dashboardEngineLoginRest = '/loginRest';
      this.__env.enableDebug = false;
      if(!params){
        this.__env.urlParameters = this.getURLParameters();
      }
      else{
        this.__env.urlParameters = params;
      }
      this.__env.dashboardEngineBungleMode = true;
      
      angular.module('dashboardFramework').constant('__env', this.__env);
      window.__env = this.__env;
      console.info("__env defined manually")
    }

    this.setCacheValue = function(model) {
      angular.module('dashboardFramework').value('cacheBoard', model);
    }

    this.drawError = function(error) {
      document.getElementsByTagName("dashboard")[0].innerHTML = "<div style='padding:15px;background:#fbecec'><div class='no-data-title'>Dashboard Engine Error " + (error.status ? error.status : "") + "</div><div class='no-data-text'>" + (error.config ? "Rest Call: " + error.config.url + ". " : "") + "Detail: " + (error.data ? JSON.stringify(error.data) : error) + "</div></div>";
    }

    this.clearApp = function(parent, subapp) {
      var ngapp = angular.element(subapp);
      var $rootScope = ngapp.injector().get('$rootScope');
      ngapp.data("$injector", "");
      $rootScope.$destroy();
      ngapp.empty();
    }

    this.generateDSApi = function(appRootNode) {
      var app = angular.element(appRootNode);
      var api = app.isolateScope().vm.api;
      api.sendValue = function (gadgetOrigin, key, value) {
        api.sendFilter(gadgetOrigin, key, value, null, "value");
      };
      api.sendFilter = function (gadgetOrigin, key, value, op, typeAction) {
        var jsonModel = {}
        jsonModel[key] = {
          value: value,
          id: gadgetOrigin,
          op: op ? op : "=",
          typeAction: typeAction ? typeAction : "filter"
        }
        app.injector().get('interactionService').sendBroadcastFilter(gadgetOrigin, jsonModel);
      };
      api.ds = {};
      api.ds.get = app.injector().get('datasourceSolverService').get;
      api.ds.getOne = app.injector().get('datasourceSolverService').getOne;
      api.ds.from = app.injector().get('datasourceSolverService').from;
      api.msgApi = window.DSMessageApi;
      api.getModel = function(){
        return app.isolateScope().vm.dashboard;
      }
      api.setModel = function(dashboard){
        return app.isolateScope().vm.dashboard = dashboard;
      }
      api.getDropElementEvent = function(){
        return app.isolateScope().vm.dashboard.gridOptions.emptyCellDropCallback;
      }
      api.setDropElementEvent = function(dropElementEvent){
        app.isolateScope().vm.dashboard.gridOptions.emptyCellDropCallback = dropElementEvent;
      }
      api.enableEventEdit = function(){
        app.isolateScope().vm.dashboard.gridOptions.eventedit = true;
      }
      api.disableEventEdit = function(){
        app.isolateScope().vm.dashboard.gridOptions.eventedit = false;
      }
      api.datalink = app.injector().get("interactionService");
      api.params = app.injector().get("urlParamService");
      api.sendParam = app.injector().get("urlParamService").sendBroadcastParam;
      api.sendParams = app.injector().get("urlParamService").sendBroadcastParams;
      api.gmanagerService = app.injector().get("gadgetManagerService");
      api.favoriteService = app.injector().get("favoriteGadgetService");
      api.setInlineDragType = function(type){
        return app.isolateScope().vm.dashboard.dragGadgetType = type;
      }
      api.forceRender = function(){
        app.injector().get("utilsService").forceRender(app.isolateScope());
      };
      return api;
    }

    this.loadApp = function(id, token, appRootNode, i18n, api, dashboard) {
      var scope = this;
      if (i18n == true) {
        fetch(this.__env.endpointControlPanel + "/dashboards/i18n/" + dashboard, {
          method: 'get',
          headers: new Headers({
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          })
        }).then(function (res) {
          if (res && res.status == 401) {
            res.config = {
              url: this.__env.endpointControlPanel + "/dashboards/i18n/" + dashboard
            }
            res.data = res.statusText;
            throw res;
          }
          return res.json();
        }).then(
          function (i18n) {
            scope.__env.i18njson = i18n;
            angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
            scope.api["api"] = scope.generateDSApi(appRootNode);
            if (!window.DSApi) {
              window.DSApi = {}
            }
            window.DSApi[id] = scope.api;
          }
        ).catch(
          scope.drawError
        )
      }
      else {
        if (i18n) {
          scope.__env.i18njson = i18n;
        }
        angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
        scope.api["api"] = scope.generateDSApi(appRootNode);
        if (!window.DSApi) {
          window.DSApi = {}
        }
        window.DSApi[id] = scope.api;
      }
    }
  },
  mounted: function () {

    var baseop = this.platformbase;

    let l1  = document.createElement('link');
    l1.rel  = 'stylesheet';
    l1.type = 'text/css';
    l1.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(l1);

    let l2  = document.createElement('link');
    l2.rel  = 'stylesheet';
    l2.type = 'text/css';
    l2.href = baseop + '/controlpanel/static/dashboards/styles/vendor.css';
    document.head.appendChild(l2);

    let l3  = document.createElement('link');
    l3.rel  = 'stylesheet';
    l3.type = 'text/css';
    l3.href = baseop + '/controlpanel/static/dashboards/gridster.css';
    document.head.appendChild(l3);

    let l4  = document.createElement('link');
    l4.rel  = 'stylesheet';
    l4.type = 'text/css';
    l4.href = baseop + '/controlpanel/static/dashboards/styles/app.css';
    document.head.appendChild(l4);

    let l5  = document.createElement('link');
    l5.rel  = 'stylesheet';
    l5.type = 'text/css';
    l5.href = baseop + '/controlpanel/static/vendor/onesait-ds/lib/theme-onesait/index.css';
    document.head.appendChild(l5);
    if(window.DSApi) {
      this.startApp();
    }
  },
  watch: {
    dashboard: function (newVal) { // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      this.clearApp(parent, subapp);
      subapp.id = this.dashboard;
      this.loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
    },
    params: function (newVal) { // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      this.clearApp(parent, subapp);
      subapp.id = this.dashboard;
      this.setConfig(this.token, this.params, this.platformbase);
      this.loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
    }
  },
  beforeDestroy: function () {
    this.clearApp(this.$el, this.$el.getElementsByTagName("dashboard")[0]);
  },
  data: function () {
    return {
      st: 0,
      vt: 0,
      alreadyloaded: !!window.DSApi
    }
  },
  methods: {
    startApp: function() {
      var scope = this;
      scope.setConfig(scope.token, scope.params, scope.platformbase);

      if (scope.model) {
        scope.setCacheValue(scope.model);
      }

      var subapp = scope.$el.getElementsByTagName("dashboard")[0];
      subapp.id = scope.dashboard;
      subapp.setAttribute("editmode", scope.editmode ? scope.editmode : "false");

      scope.loadApp(scope.id, scope.token, subapp, scope.i18n ? scope.i18n == 'true': false, scope.api, scope.dashboard);
    }
  }
}
</script>

<style>

</style>
