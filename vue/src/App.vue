<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <dashboard-wrapper id="inst1" style="height:700px;width:80%;position:absolute" editmode="true" dashboard="MASTER-Dashboard-2" token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6Im9uZXNhaXRwbGF0Zm9ybSIsInVzZXJfbmFtZSI6ImFkbWluaXN0cmF0b3IiLCJ2ZXJ0aWNhbCI6Im9uZXNhaXRwbGF0Zm9ybSIsInZlcnRpY2FscyI6WyJvbmVzYWl0cGxhdGZvcm0iXSwiYXV0aG9yaXRpZXMiOlsiUk9MRV9BRE1JTklTVFJBVE9SIl0sImNsaWVudF9pZCI6Im9uZXNhaXRwbGF0Zm9ybSIsInByaW5jaXBhbCI6ImFkbWluaXN0cmF0b3IiLCJzY29wZSI6WyJvcGVuaWQiXSwibmFtZSI6ImFkbWluaXN0cmF0b3IiLCJleHAiOjE2MDEzMjQ4OTIsImdyYW50VHlwZSI6InBhc3N3b3JkIiwicGFyYW1ldGVycyI6eyJ2ZXJ0aWNhbCI6bnVsbCwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwidXNlcm5hbWUiOiJhZG1pbmlzdHJhdG9yIn0sImp0aSI6Ijg3Y2FkNTM4LTQ2NzAtNDRmOS04NjRiLTA4NDhiZmNjY2JmYyIsInRlbmFudCI6ImRldmVsb3BtZW50X29uZXNhaXRwbGF0Zm9ybSJ9.DkeQkWrJBJTnooo-V_7-szBj-vGzujCYrcl4utSAj90" i18n="false">
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
