<template>
  <div v-if="open" class="modal mx-auto">
    <div class="backdrop" @click="$emit('close')" />
    <div
      :class="
        `shell overflow-hidden anim-scale-in position-relative ${
          _isThemeGame ? 'game-popup' : ''
        }`
      "
    >
      <slot />
      <a
        @click="$emit('close')"
        class="position-absolute right-0 p-4 a icon-close-modal"
      >
        <Icon v-if="!_isThemeGame" name="close" size="20" />
        <img
          v-else
          src="~@/assets/icon/game/close-icon.png"
          style="width: 35px"
        />
      </a>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: {
    open: Boolean
  },
  watch: {
    open(val, prev) {
      if (val !== prev) this.toggleModal(val);
    }
  },
  methods: {
    ...mapActions(['toggleModal'])
  }
};
</script>

<style lang="scss">
.a {
  color: var(--text-color);
}
.modal {
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 99;
    background: rgba(0, 0, 0, 0.4);
  }
  .icon-close-modal {
    i {
      color: var(--text-color);
    }
    z-index: 1;
  }

  .shell {
    display: flex;
    flex-direction: column;
    z-index: 999;
    margin: 0 auto;
    width: 100%;
    max-height: 90%;
    border-radius: 25px;

    @media (max-width: 767px) {
      margin: 0 15px !important;
    }

    .modal-body {
      text-align: initial;
      overflow-y: auto;
      overflow-x: hidden;

      @media (max-width: 767px) {
        padding: 0 !important;
        padding-top: 1rem !important;
      }
    }
  }
}

@media (max-width: 767px) {
  .modal-liquidity {
    .shell {
      max-height: 100%;
      border-radius: 0;
      height: 100%;
      margin: 0 !important;
    }
  }
}

.modal-select-token {
  .modal-body {
    background-color: var(--input-hover-border);
    margin-right: 10px;
    padding: 0;
  }

  .icon-close-modal {
    padding: 35px 40px !important;
    z-index: 1 !important;
  }

  @media only screen and (max-width: 768px) {
    .icon-close-modal {
      padding: 25px !important;
    }
  }
}

.modal-wrapper {
  .modal-body {
    padding-bottom: 0px;
    padding-top: 0px;
  }

  .icon-close {
    color: var(--text-color) !important;
  }
}

.modal-activity {
  .icon-close {
    color: var(--text-color) !important;
  }
}

.modal-create-pool.modal {
  .icon-close {
    color: var(--text-color) !important;
  }
  .modal-body {
    padding: 20px !important;
  }
}

.modal-create-pool.modal.game {
  .modal-body {
    padding: 55px 20px !important;
  }
}

.modal-detail {
  .modal-body {
    padding-bottom: 0px;
    padding-top: 0px;
  }

  .icon-close {
    color: var(--text-color) !important;
  }
}

.modal-liquidity {
  .icon-close-modal {
    padding-right: 40px !important;
    padding-top: 40px !important;
  }
}

.modal-account {
  .icon-close-modal {
    padding-right: 40px !important;
  }
}
.modal-test-nest-warning {
  .modal-body {
    min-height: 50px !important;
    padding: 16px !important;
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
.modal-setting-pool {
  .icon-close {
    color: var(--text-color);
  }

  .icon-close-modal {
    @media (max-width: 768px) {
      padding: 30px 20px !important;
    }
  }

  .form-search {
    background-color: var(--tab-background);
    border-bottom: 1px solid var(--border-color);
  }
}
.modal-setting-pool.game {
  max-width: 100% !important;
}

.modal-setting-pool.game {
  .title,
  .gradual-weight-update-title,
  .edit-title,
  .edit-swap-fee-title {
    font-family: $font-forward;
    font-size: 16px;
    line-height: 1.5;

    @media (max-width: 768px) {
      max-width: 230px;
      margin: 0 auto;
      line-height: 2;
    }
  }

  .description {
    line-height: 2;

    @media (max-width: 768px) {
      font-size: 14px !important;
    }
  }

  .description.game {
    font-size: 14px;

    @media only screen and (max-width: 768px) {
      font-size: 11px;
    }
  }
}

.edit-swap-fee {
  .icon-close {
    color: var(--text-color);
  }
}
.gradual-weight-update,
.modal-roi,
.modal-stake {
  .icon-close {
    color: var(--text-color);
  }
}

@media (max-width: 767px) {
  .custom-token-modal {
    max-width: 95% !important;
    .shell {
      min-height: fit-content !important;
      border-radius: 20px;
      .modal-body {
        padding: 25px 20px !important;
        border-radius: 20px;
        padding-top: 30px !important;
      }
    }
  }

  .modal-account,
  .modal-stake {
    .icon-close-modal {
      padding-right: 20px !important;
      padding-top: 18px !important;
    }
  }

  .modal-wrapper {
    .icon-close-modal {
      padding: 0 !important;
    }
  }

  .modal-wrap {
    .icon-close-modal {
      padding: 20px !important;
    }
  }

  .modal-activity {
    .icon-close-modal {
      padding: 20px !important;
    }
  }

  .modal-create-pool,
  .modal-roi,
  .modal-stake-nft {
    .icon-close-modal {
      padding: 20px !important;
    }
  }

  .modal-stake {
    .content {
      padding: 20px 15px !important;
    }
  }
}

.game-popup {
  width: auto !important;
  min-width: 400px !important;
  margin: inherit !important;
  border-radius: 0 !important;

  .text-header {
    font-family: $font-forward !important;
    font-size: 18px !important;
  }

  @media only screen and (max-width: 768px) {
    min-width: 335px !important;

    .text-header {
      font-size: 15px !important;
    }
  }
}
</style>
