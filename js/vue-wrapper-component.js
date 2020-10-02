//Aux Functions
function getURLParameters() {
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

function isEmptyJson(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

//Dashboard functions
function setConfig(token, i18n, params, platformbase) {
  __env = window.__env || {};
  __env.socketEndpointConnect = (platformbase?platformbase:'') + '/dashboardengine/dsengine/solver';
  __env.socketEndpointSend = '/dsengine/solver';
  __env.socketEndpointSubscribe = '/dsengine/broker';
  __env.endpointControlPanel = (platformbase?platformbase:'') + '/controlpanel';
  __env.endpointDashboardEngine = (platformbase?platformbase:'') + '/dashboardengine';
  __env.dashboardEngineUsername = '';
  __env.dashboardEnginePassword = '';
  __env.dashboardEngineOauthtoken = token;
  __env.dashboardEngineLoginRest = '/loginRest';
  __env.enableDebug = false;
  if(!params){
    __env.urlParameters = getURLParameters();
  }
  else{
    __env.urlParameters = params;
  }
  __env.dashboardEngineBungleMode = true;

  angular.module('dashboardFramework').constant('__env', __env);
  console.info("__env defined manually")
}

function setCacheValue(model) {
  angular.module('dashboardFramework').value('cacheBoard', model);
}

function drawError(error) {
  document.getElementsByTagName("dashboard")[0].innerHTML = "<div style='padding:15px;background:#fbecec'><div class='no-data-title'>Dashboard Engine Error " + (error.status ? error.status : "") + "</div><div class='no-data-text'>" + (error.config ? "Rest Call: " + error.config.url + ". " : "") + "Detail: " + (error.data ? JSON.stringify(error.data) : error) + "</div></div>";
}

function clearApp(parent, subapp) {
  var ngapp = angular.element(subapp);
  var $rootScope = ngapp.injector().get('$rootScope');
  ngapp.data("$injector", "");
  $rootScope.$destroy();
  ngapp.empty();
}

function generateDSApi(appRootNode) {
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
    app.isolateScope().vm.dashboard = dashboard;
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
  api.setInlineDragType = function(type){
    return app.isolateScope().vm.dashboard.dragGadgetType = type;
  };
  api.forceRender = function(){
    app.injector().get("utilsService").forceRender(app.isolateScope());
  };
  return api;
}

function loadApp(id, token, appRootNode, i18n, api, dashboard) {
  if (i18n == true) {
    fetch(__env.endpointControlPanel + "/dashboards/i18n/" + dashboard, {
      method: 'get',
      headers: new Headers({
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      })
    }).then(function (res) {
      if (res && res.status == 401) {
        res.config = {
          url: __env.endpointControlPanel + "/dashboards/i18n/" + dashboard
        }
        res.data = res.statusText;
        throw res;
      }
      return res.json();
    }).then(
      function (i18n) {
        __env.i18njson = i18n;
        angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
        this.api = generateDSApi(appRootNode);
        if (!window.DSApi) {
          window.DSApi = {}
        }
        window.DSApi[id] = this.api;
      }
    ).catch(
      drawError
    )
  }
  else {
    if (i18n) {
      __env.i18njson = i18n;
    }
    angular.bootstrap(angular.element(appRootNode), ['dashboardFramework']);
    this.api = generateDSApi(appRootNode);
    if (!window.DSApi) {
      window.DSApi = {}
    }
    window.DSApi[id] = this.api;
  }
}

Vue.component('dashboard-wrapper', {
  props: ['id', 'token', 'model', 'i18n', 'api', 'dashboard', 'editmode', 'params', 'platformbase'],
  template: '<div v-pre><dashboard api=api wrapper="true" editmode="false" iframe="true" selectedpage="0" public="false" class="flex layout-column" v-pre></dashboard></div>',
  mounted: function () {
    setConfig(this.token, this.i18n, this.params, this.platformbase);

    if (this.model) {
      setCacheValue(this.model);
    }

    var subapp = this.$el.getElementsByTagName("dashboard")[0];
    subapp.id = this.dashboard;
    subapp.setAttribute("editmode", this.editmode ? "true" : "false");

    loadApp(this.id, this.token, subapp, this.i18n, this.api, this.dashboard);

  },
  watch: {
    dashboard: function (newVal, oldVal) { // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      clearApp(parent, subapp);
      subapp.id = this.dashboard;
      loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
    },
    params: function (newVal, oldVal) { // watch it
      var parent = this.$el;
      var subapp = this.$el.getElementsByTagName("dashboard")[0];
      clearApp(parent, subapp);
      subapp.id = this.dashboard;
      setConfig(this.token, this.i18n, this.params, this.platformbase);
      loadApp(this.id, this.token, subapp, this.i18n, this.api, newVal);
    }
  },
  beforeDestroy: function () {
    clearApp(this.$el, this.$el.getElementsByTagName("dashboard")[0]);
  }
});