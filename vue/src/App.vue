<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <!--
    
      Dashboard openflights ids, you can change for yours
    
    -->
    <button v-on:click="api.api.sendFilter('livehtml_1527725378122','country','Spain')">Send param </button>
    <button v-if="params['$gadgetid']=='MASTER-Gadget-6'" size="small" v-on:click="params={}">Go to dashboard</button>
    <button v-if="params['$gadgetid']!='MASTER-Gadget-6'" size="small" v-on:click="params={'$gadgetid':'MASTER-Gadget-6'}">Show Only MASTER-Gadget-6</button>
    
    <dashboard-wrapper :api="api" :params="params" id="inst1" style="height:700px;width:80%;position:absolute" editmode="true" :dashboard="dashboard" :token="token" :platformbase="platformbase" i18n="false">
    </dashboard-wrapper>
  </div>
</template>

<script>

import HelloWorld from './components/HelloWorld.vue';
import dashboardWrapper from './components/VueWrapperComponent.vue';

export default {
  name: 'App',
  components: {
    HelloWorld,
    dashboardWrapper
  },
  data: function(){
    return {
      dashboard: "{{dashboardID}}",
      token: "{{token}}",
      platformbase: "{{platformbase}}",
      params: {},
      api: {}
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
