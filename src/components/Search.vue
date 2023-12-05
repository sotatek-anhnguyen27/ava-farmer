<template>
  <div
    :class="
      `d-flex flex-items-center position-relative ${
        customClass ? customClass : ''
      } ${tokenList && tokenList.length ? 'item-selected' : ''}`
    "
  >
    <div class="list-token-select" v-if="tokenList && tokenList.length">
      <div
        v-for="(token, i) in tokenList"
        :key="i"
        :class="
          `topic mr-2 ${_isThemeGame ? 'game-border-toggle-notactive' : ''}`
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
    <span
      v-if="!tokenList || !tokenList.length"
      class="h3 px-1 position-absolute i-search icon-search-token"
    >
      <Icon v-if="!_isThemeGame" name="search-1" />
      <img
        v-else
        class="position-absolute icon-search-token game"
        src="~@/assets/icon/game/search-icon.png"
        style="width: 30px"
      />
    </span>
    <input
      :class="
        `input flex-auto ${tokenList && tokenList.length ? 'full' : ''} ${
          _isThemeGame ? 'query-input game-placeholder' : ''
        }`
      "
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
    />
  </div>
</template>

<script>
export default {
  props: ['value', 'placeholder', 'customClass', 'tokenList'],
  methods: {
    handleInput(e) {
      this.$emit('input', e.target.value.trim());
    },
    deleteToken(i) {
      this.$emit('deleteToken', i);
    },
    isDarkMode() {
      return Storage.getModeTheme() === 'dark';
    }
  }
};
</script>

<style scoped lang="scss">
.input-search-token {
  border: 1px solid var(--border-input) !important;
  flex-direction: column;
  margin: 0 16px;
  border-radius: 25px;
  padding: 0 20px;
  background-color: var(--bg-input-search);
  box-shadow: inset 1px 2px 3px var(--border-shadow-toggle);
  input {
    border: 0 !important;
    color: var(--secondary-text-color);
    font-family: $font-weight-semibold;
    font-size: 14px;
    padding: 9px 25px;
    width: 100%;
    border-radius: 0 !important;
    background-color: inherit !important;
    background: none !important;
    box-shadow: none !important;
  }
  input::placeholder {
    color: var(--color-plachoder-search);
    font-family: $font-weight-regular;
    font-size: 16px;
  }

  .full {
    padding-left: 12px !important;
  }

  .i-search {
    left: 12px;
    top: 9px;
  }

  .icon-search-token {
    color: var(--button-color-checkbox);
  }

  .icon-search-token.active {
    color: $color-primary;
  }

  .list-token-select {
    display: flex;
    margin: 8px 0 0 0;
    width: 100%;
    padding-left: 12px;
    flex-wrap: wrap;
  }

  .topic {
    background-color: $color-primary;
    color: $text-white;
    border-radius: 100px;
    position: relative;
    font-size: 13px;
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    border: 1px solid $color-primary;

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
}

.item-selected {
  padding: 0 !important;
}

@media only screen and (max-width: 768px) {
  .input-search-token {
    margin: 0;
  }

  .input-search-token .i-search {
    top: 12px;
  }
}

.game-border-btn-search {
  border-radius: 0 !important;
  padding-right: 0;
  padding-left: 30px;
  background-color: #ffffff !important;

  input {
    font-family: $font-forward;
    padding: 0 15px;
  }
  input::placeholder {
    font-family: $font-forward;
    padding: 0 15px;
    font-size: 14px;
  }
  .icon-search-token {
    top: 2px !important;
    left: 2px;
  }
}
</style>
