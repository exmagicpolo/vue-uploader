import Vue from 'vue'
import uploader from '../src'
import App from './App.vue'
import iView from 'iview'
import 'iview/dist/styles/iview.css'

Vue.use(uploader)
Vue.use(iView)

/* eslint-disable no-new */
new Vue({
  render(createElement) {
    return createElement(App)
  }
}).$mount('#app')
