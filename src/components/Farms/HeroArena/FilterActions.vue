<template>
  <div class="d-flex filter-actions">
    <div class="filter-left">
      <Toggle :value="type" :options="farmsTypes" @select="selectType" />
    </div>
    <div class="d-flex filter-right" :class="_isThemeGame ? 'game' : ''">
      <div class="d-flex">
        <div
          class="d-flex stacked-switch align-center"
          :class="_isThemeGame ? 'game' : ''"
        >
          <div class="label-filter" :class="_isThemeGame ? 'game mr-4' : ''">
            {{ $t('stakedOnly') }}
          </div>
          <div>
            <b-form-checkbox v-model="stakedOnly" name="check-button" switch />
          </div>
        </div>
        <div class="d-flex align-center sort-farm"></div>
      </div>

      <div
        class="search-farms"
        :class="_isThemeGame ? 'game-border-btn-search' : ''"
      >
        <span class="position-absolute icon-search-farms">
          <Icon v-if="!_isThemeGame" name="search-1" />
          <img
            v-else
            class="position-absolute icon-search-farms game"
            src="~@/assets/icon/game/search-icon.png"
            style="width: 25px"
          />
        </span>
        <input
          class="input-search-farms"
          :class="_isThemeGame ? 'game-placeholder query-input' : ''"
          :placeholder="$t('searchFarm')"
          type="text"
          v-model="searchKeyword"
          @input="onInputChange()"
        />
      </div>
    </div>
    <portal to="modal">
      <ModalWarningNFTFarm
        :open="openModalWarningNFTFarm"
        :pid="1"
        @closeModalWarningNFTFarm="openModalWarningNFTFarm = false"
        @onTurnOffNFTFarm="onTurnOffNFTFarm"
      />
    </portal>
  </div>
</template>

<script>
import { VestingMode } from '@/utils/storage';
import ModalWarningNFTFarm from '../../Ui/Modal/ModalWarningNFTFarm.vue';

export default {
  name: 'FilterActions',
  components: {
    ModalWarningNFTFarm
  },
  props: {
    defaultType: {
      type: String,
      default: 'live'
    }
  },
  mounted() {
    this.type = this.defaultType;
    this.$emit('switchTab', this.type);
  },
  data() {
    return {
      stakedOnly: false,
      type: 'live',
      farmsTypes: {
        live: this.$t('live'),
        finished: this.$t('finished')
      },
      searchKeyword: '',
      nftMode: this.$store.state.theme.vestingMode === VestingMode.NFT,
      openModalWarningNFTFarm: false
    };
  },
  watch: {
    stakedOnly() {
      this.$emit('stakedToggle', this.stakedOnly);
    }
  },
  methods: {
    onChangeEventHandler(value) {
      if (!value.value) {
        this.nftMode = true;
        this.$refs.toggleNFT.toggled = true;
        this.openModalWarningNFTFarm = true;
      }
      this.$store.dispatch(
        'theme/setVestingMode',
        this.nftMode ? VestingMode.NFT : VestingMode.BUNI
      );
    },
    onTurnOffNFTFarm() {
      this.nftMode = false;
      this.$refs.toggleNFT.toggled = false;
      this.openModalWarningNFTFarm = false;
      this.$store.dispatch(
        'theme/setVestingMode',
        this.nftMode ? VestingMode.NFT : VestingMode.BUNI
      );
    },
    selectType(farmsType) {
      this.type = farmsType;
      this.$emit('switchTab', this.type);
    },

    selectItems(value) {
      this.$emit('sort', value);
    },
    onInputChange() {
      this.$emit('inputSearch', this.searchKeyword);
    }
  }
};
</script>

<style scoped lang="scss">
.filter-left {
  display: flex;
  align-items: center;
  @media only screen and (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
.harvest-mode {
  @media only screen and (max-width: 768px) {
    margin-top: 16px;
    margin-left: 0;
  }
  margin-left: 26px;
  display: flex;
  align-items: center;
}
.harvest-mode-lb {
  margin-right: 4px;
  color: var(--button-color-checkbox);
}
.label-filter.game {
  font-size: 10px;
}

.game-border-btn-search {
  .item {
    font-size: 11px !important;
  }
}

.filter-actions {
  justify-content: space-between;
  width: 100%;
  input {
    ::placeholder {
      font-size: 14px;
      font-family: $font-bold;
    }
  }

  @media only screen and (max-width: 768px) {
    flex-direction: column;

    .filter-right {
      flex-direction: column;
      width: 100%;
      align-items: center;
      margin-top: 5px;
    }

    .sort-farm {
      margin: 10px 0 10px 15px !important;
    }

    .search-farms {
      width: 100%;
      margin-top: 5px;
    }

    .label-filter.game {
      font-size: 9px;
    }

    .filter-right.game {
      margin-top: 20px;
    }

    .search-farms.game-border-btn-search {
      width: 100% !important;
      margin-top: 20px;
    }
  }
}

.search-farms {
  border: 1px solid var(--color-border-select);
  box-sizing: border-box;
  box-shadow: inset 1px 2px 3px rgba(0, 0, 0, 0.075);
  border-radius: 100px;
  height: 35px;
  padding: 7px 40px 5px 15px;
  position: relative;
  width: 140px;
  background-color: var(--bg-input-search);
  .icon-search-farms {
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-primary;
  }

  input {
    color: var(--secondary-text-color);
  }
}

.search-farms.game-border-btn-search {
  border-radius: 0 !important;
  width: 200px;
  padding: 5px 40px 5px 15px;
  height: 30px;

  .icon-search-farms.game {
    right: 0;
  }
}

.label-filter {
  font-size: 13px;
  line-height: 16px;
  color: var(--color-arrow-down);
  margin-right: 10px;
  font-family: $font-weight-regular;
}

.sort-farm {
  margin: 0 15px 0 30px;
}
.vue-js-switch {
  margin-bottom: 0px !important;
}
</style>
