<template>
  <div id="app">
    <modal-idle
      v-if="isSession && isIdle"
      :is-idle="isIdle"
    />
    <router-view />
  </div>
</template>

<script>
// components and mixins
import ModalIdle from '@/components/ADempiere/ModalIdle'

export default {
  name: 'App',
  components: { ModalIdle },
  computed: {
    isIdle() {
      return this.$store.state.idleVue.isIdle
    },
    isSession() {
      return this.$store.getters['user/getIsSession']
    },
    getRole() {
      return this.$store.getters['user/getRole']
    },
    getResourceName() {
      if (this.isEmptyValue(this.getRole) && this.isEmptyValue(this.getRole.client)) return ''
      return this.$store.getters['user/getRole'].client.logo
    },
    defaultImageLogo() {
      return require('@/image/ADempiere/logo.jpg')
    },
    nameSystem() {
      const { name } = this.$store.getters['user/getSystem']
      if (name) return name
      return 'ADempiere'
    }
  },
  async mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.getWindowWidth)
      window.addEventListener('resize', this.getWindowHeight)

      this.getWindowWidth()
      this.getWindowHeight()
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth)
    window.removeEventListener('resize', this.getWindowHeight)
  },
  methods: {
    getWindowWidth(event) {
      this.$store.dispatch('setWidth', document.documentElement.clientWidth)
    },
    getWindowHeight(event) {
      this.$store.dispatch('setHeight', document.documentElement.clientHeight)
    }
  }
}
</script>
