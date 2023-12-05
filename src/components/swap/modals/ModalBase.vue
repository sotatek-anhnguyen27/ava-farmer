<template>
  <transition name="appear">
    <div v-if="open" class="modal-wrapper">
      <div class="backdrop" @click="$emit('close')" />
      <div :class="!_isThemeGame ? 'modal' : 'modal game-border-popup'">
        <div v-bind:class="['header', !_isThemeGame ? '' : 'game']">
          <div>
            {{ title }}
          </div>
          <span @click="$emit('close')" class="icon-close-modal ">
            <Icon v-if="!_isThemeGame" name="close" size="20" />
            <img
              v-else
              src="~@/assets/icon/game/close-icon.png"
              style="width: 35px"
            />
          </span>
        </div>
        <div class="body modal-body">
          <slot />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import Icon from "@/components/swap/Icon.vue";

export default {
  components: {
    // Icon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped lang="scss">
.appear-enter {
  opacity: 0;
}

.appear-enter-active {
  animation: appear 0.2s ease-out;
}

.appear-leave-active {
  animation: appear 0.2s ease-out reverse;
}

.header,
.icon-close-modal i {
  color: var(--secondary-text-color);
}

.modal-wrapper {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .header {
    margin-bottom: 0 !important;
  }
}

.backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.8);
}

.modal {
  width: 440px;
  max-height: 500px;
  z-index: 3;
  display: flex;
  margin: auto;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-table-pooloverviwe);
  border-radius: var(--border-radius-large);

  .icon-close-modal {
    cursor: pointer;
  }
}

.game-border-popup {
  width: 440px !important;
  z-index: 3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-table-pooloverviwe);
  padding: 20px !important;
  border-radius: 0 !important;

  .icon-close-modal {
    cursor: pointer;
  }

  .header {
    position: relative;
  }
}

@media only screen and (max-width: 768px) {
  .setting-modal {
    .game-border-popup {
      padding: 20px 0 !important;
      height: 260px !important;
    }
  }
}

.modal-select-token-swap {
  .modal-body {
    background: var(--panel-background) !important;
  }
  .game-border-popup {
    padding: 20px 0 0 0 !important;
    background-color: #ff9342;

    .modal-body {
      padding-top: 20px !important;
      background-color: #fff !important;
      z-index: 1 !important;

      &:after {
        content: '';
        height: 90px;
        width: calc(100% - 7px);
        background-color: #f4791a;
        box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 0;
        z-index: -1;
      }
    }
    .header {
      position: relative;

      &:after {
        content: '';
        height: 28px;
        width: calc(100% - 8px);
        background-color: #f4791a;
        box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 4px;
        z-index: -1;
      }
    }
  }
}

.appear-enter > .modal {
  transform: scale(0.9);
}

.appear-enter-active > .modal {
  animation: grow 0.2s cubic-bezier(0.38, 0, 0.6, 1.48);
}

.appear-leave-active > .modal {
  animation: grow 0.2s cubic-bezier(0.38, 0, 0.6, 1.48) reverse;
}

.header {
  min-height: 80px;
  box-sizing: border-box;
  padding: 0 18px 20px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 25px;
  font-family: $font-weight-semibold;
  width: 90%;
}

.game {
  min-height: 0px !important;
  font-family: $font-forward !important;
  width: 100%;
  font-size: 18px !important;
}

.body {
  overflow-y: auto;
  width: 90%;
}

.modal-select-token-swap {
  .modal-body {
    width: 100%;
    overflow-y: hidden;
    padding: 0;
    padding-bottom: 20px;
  }

  .modal {
    height: 594px;
    max-height: 594px;
    width: 420px;
  }
}
.connect-modal {
  .modal {
    max-width: 420px;
    margin-left: auto !important;
    margin-right: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      color: var(--secondary-text-color);
      background-color: var(--tab-background);
      border-bottom: 1px solid #dee2e6 !important;

      font-size: 22px;
      line-height: 35px;
      padding: 20px 40px !important;
      width: 100% !important;
      .icon-close-modal {
        position: absolute;
        top: 1.1rem;
        right: 1.5rem;
      }
    }
    .modal-body {
      background: var(--panel-background);
      padding: 20px 40px;
      width: 100%;
    }
  }
}

.connect-modal.game {
  .game-border-popup {
    padding: 0 !important;
    width: 400px;
    max-width: 90%;
    height: 500px;
    max-height: 90%;
  }

  .header {
    position: relative;
    background-color: #ff9342;
    z-index: 1;
    padding: 20px 40px !important;

    &:after {
      content: '';
      height: 50%;
      width: calc(100% - 8px);
      background-color: #f4791a;
      box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 4px;
      z-index: -1;
    }
  }
}
@keyframes appear {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes grow {
  0% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
  }
}

@media only screen and (max-width: 768px) {
  .modal-wrapper {
    align-items: flex-start;
  }
  .modal-select-token-swap {
    .modal {
      width: 335px;
      border-radius: 25px;
      max-height: 90%;
    }

    .game-border-popup {
      width: 335px !important;
    }
  }
  .connect-modal {
    .modal {
      width: 95%;
    }

    .header.game {
      font-size: 15px !important;
    }
  }
}
</style>
