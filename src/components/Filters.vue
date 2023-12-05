<template>
  <div
    class="d-flex flex-justify-between filter-select-token"
    style="align-items: flex-end"
  >
    <div
      class="d-flex justify-content-between align-items-center mb-4 filter-left"
    >
      <Toggle :value="type" :options="poolTypes" @select="selectType" />
    </div>

    <div class="d-flex filter-right">
      <div class="mb-4">
        <router-link
          :to="{ name: 'create' }"
          class="d-flex flex-items-center link-create"
        >
          <button
            :class="
              `btn-create-kalancer ${
                _isThemeGame
                  ? 'game-border-btn-add d-flex align-items-center'
                  : ''
              }`
            "
          >
            <span>{{ $t('create') }}</span>
            <Icon v-if="!_isThemeGame" name="plus" />
            <img
              v-else
              src="~/@/assets/icon/game/plus.png"
              style="width: 12px"
            />
          </button>
        </router-link>
      </div>
      <div
        :class="
          `d-flex flex-items-center mb-4 pr-3 pl-3 float-none float-sm-right btn-search-token
           ${tokens.length ? 'full-item' : 'no-item'}
           ${_isThemeGame ? 'game-border-btn-search' : ''}`
        "
      >
        <div
          v-for="(token, i) in tokens"
          :key="i"
          :class="`${_isThemeGame ? 'ml-1' : ''}`"
        >
          <div
            :class="
              `topic ml-2  ${
                _isThemeGame ? 'game-border-toggle-notactive' : ''
              }`
            "
          >
            <button
              class="topic-button text-center line-height-0 position-absolute right-0"
              @click="deleteToken(i)"
            >
              <Icon v-if="!_isThemeGame" name="remove-1" size="9" />
              <img v-else src="~@/assets/icon/game/icon-close-small.png" />
            </button>
            <span class="ml-2 pl-1 tag-token" v-text="_ticker(token)" />
          </div>
        </div>
        <div class="d-flex">
          <div @click="modalOpen = true" class="topic-button btn-search d-flex">
            <div
              v-text="$t('searchToken')"
              :class="`btn-text ${tokens.length ? 'btn-text-hide' : ''}`"
            />

            <span class="icon-search-token active">
              <Icon v-if="!_isThemeGame" name="search-1" />
              <img
                v-else
                src="~@/assets/icon/game/search-icon.png"
                style="width: 25px"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
    <portal to="modal">
      <ModalSelectToken
        :open="modalOpen"
        @close="modalOpen = false"
        @input="addToken"
        :not="tokens"
        :tokenList="tokens"
        @deleteToken="deleteToken"
      />
    </portal>
  </div>
</template>

<script>
import { formatFilters } from '@/helpers/utils';

export default {
  props: ['value'],
  data() {
    return {
      input: {},
      tokens: [],
      type: 'shared',
      poolTypes: {
        shared: 'Shared',
        smart: 'Smart'
        // private: 'Private'
      },
      modalOpen: false
    };
  },
  methods: {
    addToken(token) {
      this.tokens.push(token);
      this.$emit('input', {
        type: this.type,
        token: this.tokens
      });
    },
    deleteToken(i) {
      delete this.tokens[i];
      this.tokens = this.tokens.filter(() => true);
      this.$emit('input', {
        type: this.type,
        token: this.tokens
      });
    },
    selectType(poolType) {
      this.type = poolType;
      this.$emit('input', {
        type: this.type,
        token: this.tokens
      });
    }
  },
  created() {
    const filters = formatFilters(this.value);
    this.tokens = filters.token;
    this.type = filters.type;
  }
};
</script>

<style scoped lang="scss">
.link-create {
  margin-right: 15px;
}

.btn-create-kalancer {
  height: 37px;
  background: $btn-bg-color;
  border-radius: 100px;
  border: 0;
  padding: 0 13px 0 17px;
  font-size: 14px;
  font-family: $font-bold;
  color: $text-white;

  &:hover {
    background: $btn-bg-hover-color;
  }

  span {
    padding-right: 5px;
  }
}
.btn-create-kalancer.game-border-btn-add {
  background: $color-primary;
  border-radius: 0 !important;
  height: 30px !important;
  font-family: $font-forward;
  font-size: 11px !important;

  &:hover {
    background: $game-btn-hover-color;
  }
}
.topic {
  background-color: $color-primary;
  color: $text-white;
  position: relative;
  font-size: 13px;
  display: flex;
  align-items: center;
  border: 1px solid $color-primary;
  margin: 2px 0;
  border-radius: 100px;

  .topic-button {
    background-color: $color-primary;
    color: $text-white;
    border: 0;
    width: 20px;
    border-radius: 100px;

    img {
      width: 7px;
      height: 7px;
    }
  }

  .tag-token {
    padding: 3px 30px 3px 7px;
    line-height: 13px;
  }
}

.topic.game-border-toggle-notactive {
  border-radius: 0 !important;
  margin-bottom: 5px !important;
  margin-top: 5px !important;
  font-size: 9px !important;

  .tag-token {
    padding: 0 20px 0 3px !important;
  }
}

.btn-search-token {
  background: var(--bg-toggle);
  padding: 7px 16px;
  position: relative;
  max-width: 500px;
  flex-wrap: wrap;
  box-shadow: inset 1px 2px 3px var(--border-shadow-search);
  border-radius: 25px;
  border: 1px solid var(--border-search);
}

.btn-search-token.game-border-btn-search {
  border-radius: 0 !important;
  padding: 5px 16px !important;
  line-height: 20px;
  margin-right: 9px;

  .btn-text {
    font-family: $font-forward;
    font-size: 11px;
  }
  .icon-search-token {
    right: 5px;
  }
  .tag-token {
    font-size: 9px !important;
    padding: 2px 30px 2px 7px;
  }
}

.full-item {
  padding: 6px 16px 6px 10px !important;
}

.btn-text {
  font-family: $font-weight-semibold;
  font-size: 14px;
}

.btn-text-hide {
  display: none;
}

.filter-right {
  align-items: center;
}

.btn-search {
  cursor: pointer;
  color: var(--text-btn-search);
  padding-right: 25px;

  &:hover {
    color: var(--theme-mode-icon);
  }

  .icon-search-token {
    margin-left: 12px;
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
  }

  .icon-search-token.active {
    color: $color-primary;
  }
}

.no-item {
  div {
    width: 100%;
  }
}

@media only screen and (max-width: 768px) {
  .filter-select-token {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .filter-left {
    width: 100%;
  }

  .filter-right {
    width: 100%;
    justify-content: space-between;
  }

  .btn-search-token {
    min-height: 35px;
    border-radius: 25px;
    padding: 8px 15px !important;
    width: 100%;
  }
}
</style>
