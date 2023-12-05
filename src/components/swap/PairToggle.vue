<template>
  <div
    v-if="!_isThemeGame"
    class="icon-wrapper"
    @click="toggle"
    :class="transactionPending && 'disable'"
  >
    <div class="icon" :class="{ rotated: isRotated }" :title="'pairToggle'">
      <svg
        width="21"
        height="18"
        viewBox="0 0 21 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.26444 2.74713L6.09586 2.74713L6.09586 14.4942L9.06508 11.5249L10.3601 12.82L5.18004 18L0 12.82L1.29501 11.5249L4.26444 14.4944L4.26444 2.74713Z"
          fill="#FF8B0A"
        />
        <path
          d="M16.1685 15.2529L14.3371 15.2529L14.3371 3.50584L11.3678 6.47505L10.0728 5.18004L15.2529 -1.40653e-06L20.4329 5.18004L19.1379 6.47506L16.1685 3.50563L16.1685 15.2529Z"
          fill="#7F7F7F"
        />
      </svg>
    </div>
  </div>
  <div v-else @click="toggle" class="icon-game-wrapper">
    <div
      class="icon-game-rotate"
      :class="{ rotated: isRotated }"
      :title="'pairToggle'"
    >
      <img src="~/@/assets/icon/game/switch.png" class="icon-game" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    transactionPending: {
      type: Boolean,
      require: true
    }
  },
  emits: ['toggle'],
  data() {
    return {
      isRotated: false
    };
  },
  methods: {
    toggle() {
      this.isRotated = !this.isRotated;
      this.$emit('toggle');
    }
  }
};
</script>

<style scoped>
.disable {
  pointer-events: none;
  opacity: 0.5;
}
.icon-wrapper {
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--swap-btn-background);
  border-radius: 50%;
  cursor: pointer;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
  transition: transform 0.35s ease-in-out;
}

.icon.rotated {
  transform: rotate(360deg);
}

.icon-game {
  width: 30px;
  height: 30px;
}

.icon-game-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.icon-game-rotate {
  width: 30px;
  height: 30px;
  color: var(--text-primary);
  transition: transform 0.35s ease-in-out;
}

.icon-game-rotate.rotated {
  transform: rotate(360deg);
}

.arrow-a,
.arrow-b {
  fill: var(--text-primary);
  transition: fill-opacity 0.35s ease-in-out;
}

.arrow-a {
  fill-opacity: 0.5;
}

.icon.rotated .arrow-a {
  fill-opacity: 1;
}

.icon.rotated .arrow-b {
  fill-opacity: 0.5;
}
</style>
