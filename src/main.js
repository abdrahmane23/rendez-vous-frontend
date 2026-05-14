import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initKeycloak } from './services/keycloak';
import './style.css';

const app = createApp(App);

initKeycloak(() => {
  app.use(router);
  app.mount('#app');
});