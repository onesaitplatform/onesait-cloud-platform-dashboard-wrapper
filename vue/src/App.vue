<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <dashboard-wrapper id="inst1" style="height:700px;width:80%;position:absolute" editmode="true" :dashboard="dashboard" :token="token" i18n="false">
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
  data:{
    dashboard: "{dashboardid}",
    token: "{token}"
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
