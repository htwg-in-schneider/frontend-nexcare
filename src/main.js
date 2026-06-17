import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'

const pinia = createPinia()

const auth0 = createAuth0({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirect_uri: window.location.origin + import.meta.env.BASE_URL,
    // Force login screen – no sign-up tab
    screen_hint: 'login',
  },
})

createApp(App)
  .use(router)
  .use(pinia)
  .use(auth0)
  .mount('#app')
