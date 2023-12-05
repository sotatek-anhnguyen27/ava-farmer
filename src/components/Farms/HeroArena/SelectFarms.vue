<template>
  <div class="select-item">
    <div
      @click="open = !open"
      :class="
        `selected-item ${open ? 'show' : ''} ${
          _isThemeGame ? 'game game-border-btn-search' : ''
        }`
      "
    >
      <div>
        {{ $t(`${selected}`) }}
      </div>
      <div class="icon-drop">
        <Icon v-if="!_isThemeGame" name="menu-down" size="6" />
        <img
          v-else
          src="~@/assets/icon/game/arrow-down-icon.png"
          style="width: 30px;"
        />
      </div>
    </div>
    <div
      class="items"
      :class="
        `${open ? 'show' : ''}  list-item-${optionSelect.length} ${
          _isThemeGame && open ? 'game-border-btn-search' : ''
        }`
      "
    >
      <div
        v-for="item in optionSelect"
        :key="item.value"
        class="item"
        @click="selectItem(item)"
        v-html="$t(`${item.value}`)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: 'hot',
      options: [
        { value: 'hot' },
        { value: 'apr' },
        { value: 'earned' },
        { value: 'liquidity' },
        { value: 'myLiquidity' }
      ],
      open: false
    };
  },
  computed: {
    optionSelect() {
      return this.options.filter(item => item.value !== this.selected);
    }
  },
  methods: {
    selectItem(item) {
      this.open = false;
      this.selected = item.value;
      this.$emit('select-items', item.value);
    }
  },
  created() {
    window.addEventListener('click', e => {
      if (!this.$el.contains(e.target)) {
        this.open = false;
      }
    });
  }
};
</script>

<style scoped lang="scss">
.select-item {
  position: relative;
  color: var(--secondary-text-color);

  @for $i from 1 through 10 {
    $heightChild: $i * 35px;
    .items.show.list-item-#{$i} {
      height: $heightChild;
      background: var(--bg-select);
    }
  }
}

.selected-item.game-border-btn-search {
  border-radius: 0 !important;
  height: 30px;
  padding-right: 0 !important;
}

.items.game-border-btn-search {
  width: 92%;
  border-radius: 0 !important;
}

.selected-item {
  height: 35px;
  background-color: var(--bg-select);
  border-radius: 25px;
  width: 140px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border-select);
  justify-content: space-between;
  box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.075);
  cursor: pointer;

  .icon-drop {
    transition: transform 0.4s;
    color: var(--color-arrow-down);
  }
}

.selected-item.show {
  border-radius: 18px 18px 0 0;
  transition: border-radius 0.15s ease 0s;
  .icon-drop {
    transform: rotate(-180deg);
    transition: transform 0.4s;
  }
}

.items {
  background-color: var(--bg-select);
  position: absolute;
  top: 35px;
  height: 0;
  overflow: hidden;
  width: 100%;
  transition: height 0.1s;
}

.item {
  height: 35px;
  padding-left: 15px;
  display: flex;
  align-items: center;
  width: 140px;
  cursor: pointer;
  color: var(--secondary-text-color);
  background-color: var(--bg-select);
  &:hover {
    color: $color-primary;
  }
}

.game-border-btn-search {
  .item {
    font-size: 11px !important;
  }
}

.items.show {
  border: 1px solid var(--color-border-select);
  border-top: 0;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.25);
  background: var(--bg-select);
  z-index: 999;
}
</style>
