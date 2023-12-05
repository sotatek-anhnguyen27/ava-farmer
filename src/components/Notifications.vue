<template>
  <div
    v-if="items && items.length"
    class="position-fixed left-0 right-0 bottom-0 text-right"
    style="z-index: 99999; margin-bottom: 30px;"
  >
    <div class="">
      <div v-for="(item, key) in items" :key="key" class="mb-2">
        <UiButton
          class="notification d-inline-block anim-scale-in"
          :class="
            _isThemeGame
              ? `game-notification-${item.type}`
              : `notification-${item.type}`
          "
          v-if="now < item.timestamp + duration && !item.hide"
          @click="item.hide = true"
          style="padding-left: 0px;"
        >
          <div class="d-flex flex-items-center p-2 text-left">
            <div>
              <Icon
                v-if="!_isThemeGame"
                :name="`${item.type == 'error' ? 'warning' : 'success'}`"
                :class="
                  `${item.type == 'error' ? 'icon-fail' : 'icon-success'}`
                "
                size="22"
              />
              <img
                v-if="item.type == 'error' && _isThemeGame"
                src="~/@/assets/icon/game/fail.png"
                class="icon-game icon-fail"
              />
              <img
                v-if="item.type != 'error' && _isThemeGame"
                src="~/@/assets/icon/game/success.png"
                class="icon-game icon-success"
              />
            </div>
            <div v-if="item.message.text">
              {{ $t(item.message.text) }}
              <a
                v-if="item.message.link"
                :href="item.message.link"
                target="_blank"
                class="noti-link"
              >
                {{
                  $t('viewOnExplorer', {
                    explorer: config.explorerName || 'BscScan'
                  })
                }}
              </a>
            </div>
            <div v-else>
              {{ item.message }}
            </div>
          </div>
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script>
const DURATION = 4000;

export default {
  data() {
    return {
      now: Date.now(),
      duration: DURATION
    };
  },
  computed: {
    items() {
      return this.$store.state.notifications.items;
    }
  },
  mounted() {
    setInterval(() => (this.now = Date.now()), 1000);
  }
};
</script>

<style scoped lang="scss">
.notification {
  height: fit-content !important;
}
.icon-fail {
  color: $secondary-button-text !important;
  display: inline-flex;
  align-items: center;
  margin-right: 10px !important;
  margin-left: 17px !important;
}
.icon-success {
  color: $secondary-button-text !important;
  display: inline-flex;
  align-items: center;
  margin-right: 10px !important;
  margin-left: 17px !important;
}
.noti-link {
  color: $color-primary;
  margin-left: 10px;
}
.icon-game {
  width: 23px;
  height: 23px;

  @media only screen and (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
}
</style>
