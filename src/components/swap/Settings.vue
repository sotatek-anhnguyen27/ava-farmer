<template>
  <div class="setting-wrapper ">
    <div class="setting-btn" @click="openSettingsModal">
      <Icon v-if="!_isThemeGame" :name="'setting'" class="setting-icon" />
      <img v-else src="~/@/assets/icon/game/setting.png" class="icon-game" />
    </div>
  </div>
</template>

<script>
export default {
  props: ['forKurve'],
  components: {
    // Icon
  },
  methods: {
    openSettingsModal() {
      this.$store.dispatch('openSettingsModal', { forKurve: this.forKurve });
    }
  }
};
</script>

<style lang="scss" scoped>
.setting-btn {
  background: var(--swap-btn-background) !important;
  border-radius: 100% !important;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--setting-color);
  cursor: pointer;
  margin: 0 4px;
}
.setting-btn:hover {
  background: $line-hover-color !important;
}
.button:hover {
  background: var(--background-primary);
}
.setting-wrapper {
  width: fit-content;
  display: flex;
  align-items: center;
  .setting-icon {
    font-size: 20px;
  }
}
.alarm-icon {
  line-height: 0 !important;
}
.icon {
  width: 18px;
  height: 18px;
}

.icon-game {
  @media only screen and (max-width: 768px) {
    width: 30px;
    height: 30px;
  }
}
</style>
