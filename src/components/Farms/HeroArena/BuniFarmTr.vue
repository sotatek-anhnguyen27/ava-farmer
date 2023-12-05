<template>
  <div class="farm-row">
    <div class="row-info" @click="toggleDetail">
      <div class="farm-column farm-name column-sm text-left">
        <div class="farm-name-wrapper">
          <Pie
            :tokens="[
              {
                denormWeight: 10,
                color: singleToken === 'BUNI' ? '#f47820' : '#B06C2E'
              }
            ]"
            size="34"
          />
          <div class="wrap-list-tokens">
            <div class="d-flex flex-items-center mr-2 column-pool">
              <Icon name="bullet" size="16" :style="`color: #f47820`" />
              {{ _shorten(singleToken, 5) }}
            </div>
          </div>
        </div>
      </div>
      <div class="farm-column farm-info text-left hide">
        <div class="label-row" :class="_isThemeGame ? 'game' : ''">
          {{ $t('earned') }}
        </div>
        <div class="data" :class="_isThemeGame ? 'game' : ''">
          {{ (buniEarned && buniEarned.toFixed(4)) || '-' }}
        </div>
      </div>
      <div class="farm-column farm-info text-left mobile-show">
        <div class="label-row" :class="_isThemeGame ? 'game' : ''">
          {{ $t('apr') }}
        </div>
        <div class="content" style="padding-right: 10px">
          <UiNum
            :value="originalValue / 100"
            format="percent"
            class="apr-content"
          />
          <span @click="handleRoiModal">
            <img
              v-if="_isThemeGame"
              src="~/@/assets/icon/game/calc.png"
              class="ml-2 mb-1"
              style="width: 12px"
            />
            <Icon v-else name="calculator" size="15" class="help-icon ml-2" />
          </span>
        </div>
      </div>
      <div class="farm-column farm-info text-left hide">
        <div
          class="label-row"
          :class="_isThemeGame ? 'game' : ''"
          v-html="$t('myLiquidity')"
        />
        <div class="content">
          <div v-text="_num(details.myLiquidity, 'usd-long')" />
          <span
            class="tooltipped tooltipped-n"
            :class="_isThemeGame ? 'game-tooltip' : ''"
            :aria-label="$t('myLiquidityTooltip')"
          >
            <img
              v-if="_isThemeGame"
              src="~/@/assets/icon/game/help.png"
              class="ml-2 mb-1"
              style="width: 15px"
            />
            <Icon v-else name="help" size="14" class="help-icon ml-2" />
          </span>
        </div>
      </div>
      <div class="farm-column farm-info text-left hide">
        <div class="label-row" :class="_isThemeGame ? 'game' : ''">
          {{ $t('liquidity') }}
        </div>
        <div class="content">
          <div v-text="_num(stake, 'usd-long')" />
          <span
            class="tooltipped tooltipped-n"
            :class="_isThemeGame ? 'game-tooltip' : ''"
            :aria-label="$t('lpFund')"
          >
            <img
              v-if="_isThemeGame"
              src="~/@/assets/icon/game/help.png"
              class="ml-2 mb-1"
              style="width: 15px"
            />
            <Icon v-else name="help" size="14" class="help-icon ml-2" />
          </span>
        </div>
      </div>
      <div class="farm-column farm-info text-left hide">
        <div class="label-row" :class="_isThemeGame ? 'game' : ''">
          {{ $t('multiplier') }}
        </div>
        <div class="content">
          {{ reward }}
          <span
            class="tooltipped tooltipped-n"
            :class="_isThemeGame ? 'game-tooltip' : ''"
            :aria-label="$t('multiplierRepresent')"
          >
            <img
              v-if="_isThemeGame"
              src="~/@/assets/icon/game/help.png"
              class="ml-2 mb-1"
              style="width: 15px"
            />
            <Icon v-else name="help" size="14" class="help-icon ml-2" />
          </span>
        </div>
      </div>
      <div class="detail-column">
        <div class="link hide">{{ $t('detail') }}</div>
        <Icon
          name="chevron-down"
          class="toggle-icon"
          :class="openDetail && 'flipped'"
          size="5"
          v-if="!_isThemeGame"
        />
        <img v-else src="~/@/assets/icon/game/arrow-down-1.png" class="ml-4" />
      </div>
    </div>
    <div v-show="openDetail" class="detail" :class="_isThemeGame ? 'game' : ''">
      <div class="harvest text-left detail-show card-wrapper hide">
        <div
          v-if="buniEarned > 0 && $store.state.theme.vestingMode === 'NFT'"
          class="card-game"
          @click="openGameCardModal(currentLevel.imgUrl)"
        >
          <img :src="currentLevel.smallImgUrl" />
        </div>
      </div>
      <div class="harvest text-left detail-show">
        <div
          class="label-input"
          :class="_isThemeGame ? 'game mb-2 game-label-input' : ''"
        >
          {{ $t(`BUNI Earned`) }}
        </div>
        <div class="wrapper" :class="_isThemeGame ? 'game-btn-input-2' : ''">
          <div class="earned">
            <div
              class="earned-number"
              :class="_isThemeGame ? 'game game-label-input' : ''"
            >
              {{ (buniEarned && buniEarned.toFixed(4)) || '?' }}
            </div>
            <div class="currency" :class="_isThemeGame ? 'game ' : ''">
              ~ {{ earningsBusd.toFixed(4) }}
            </div>
          </div>
        </div>
      </div>
      <div class="farming text-left detail-show">
        <staked-column
          :is-stacked-buni="true"
          :isSinglePool="true"
          :singleToken="singleToken"
          :pid="details.pid"
          :farm-data="details"
          :poolLink="`${poolLink}?addLiquidity=true`"
          :currentLevelName="currentLevel.name"
          :currentUrlImage="currentLevel.imgUrl"
        ></staked-column>
      </div>
      <div class="mobile-display">
        <div class="farm-info">
          <div
            class="label-row-mobile"
            :class="_isThemeGame && 'game-text-mobile'"
          >
            {{ $t('earned') }}
          </div>
          <div class="content">
            <div class="data" :class="_isThemeGame ? 'game' : ''">
              {{ (buniEarned && buniEarned.toFixed(4)) || '-' }}
            </div>
          </div>
        </div>
        <div class="farm-info">
          <div
            class="label-row-mobile"
            :class="_isThemeGame && 'game-text-mobile'"
            v-html="$t('myLiquidity')"
          />

          <div class="content">
            <div v-text="_num(details.myLiquidity, 'usd')" />
            <div
              class="tooltipped tooltipped-n tooltip-farms"
              :class="_isThemeGame ? 'game-tooltip' : ''"
              :aria-label="$t('myLiquidityTooltip')"
            >
              <img
                v-if="_isThemeGame"
                src="~/@/assets/icon/game/help.png"
                class="ml-2 mb-1"
                style="width: 15px"
              />
              <Icon v-else name="help" size="14" class="help-icon ml-2" />
            </div>
          </div>
        </div>
        <div class="farm-info">
          <div
            class="label-row-mobile"
            :class="_isThemeGame && 'game-text-mobile'"
          >
            {{ $t('liquidity') }}
          </div>
          <div class="content">
            <div v-text="_num(stake, 'usd')" />
            <div
              class="tooltipped tooltipped-n tooltip-farms"
              :class="_isThemeGame ? 'game-tooltip' : ''"
              :aria-label="$t('liquidityTooltip')"
            >
              <img
                v-if="_isThemeGame"
                src="~/@/assets/icon/game/help.png"
                class="ml-2 mb-1"
                style="width: 15px"
              />
              <Icon v-else name="help" size="14" class="help-icon ml-2" />
            </div>
          </div>
        </div>
        <div class="farm-info">
          <div
            class="label-row-mobile"
            :class="_isThemeGame && 'game-text-mobile'"
          >
            {{ $t('multiplier') }}
          </div>
          <div class="content">
            {{ reward }}
            <div
              class="tooltipped tooltipped-n tooltip-farms"
              :class="_isThemeGame ? 'game-tooltip' : ''"
              :aria-label="$t('multiplierTooltip')"
            >
              <img
                v-if="_isThemeGame"
                src="~/@/assets/icon/game/help.png"
                class="ml-2 mb-1"
                style="width: 15px"
              />
              <Icon v-else name="help" size="14" class="help-icon ml-2" />
            </div>
          </div>
        </div>
        <div class="detail-infos text-left card-game-wrapper">
          <div
            class="harvest text-left detail-show buni-card-wrapper"
            v-if="$store.state.theme.vestingMode === 'NFT'"
          >
            <div
              v-if="buniEarned > 0 && $store.state.theme.vestingMode === 'NFT'"
              class="card-game"
              @click="openGameCardModal(currentLevel.imgUrl)"
            >
              <img :src="currentLevel.smallImgUrl" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <portal to="modal">
      <ModalROI
        :open="openRoiModal"
        @closeRoiModal="handleRoiModal"
        :buniPrice="buniPrice"
        :isBuniFarm="true"
        :apy="originalValue"
        :liquidityUrl="`${poolLink}?addLiquidity=true`"
      />
      <ModalWarningHarvestNFTFarm
        :imgUrlCurLevel="currentLevel.imgUrl"
        :imgUrlNextLevel="nextLevel ? nextLevel.imgUrl : ''"
        :buniToNextLevel="nextLevel ? nextLevel.lowestBuni - buniEarned : 0"
        :open="openModalWarningHarvestNFTFarm"
        @closeModalWarningHarvestNFTFarm="closeModalWarningHarvestNFTFarm"
        @harvestNFTFarm="onReward"
        :currentLevelName="currentLevel.name"
        :nextLevelName="nextLevel ? nextLevel.name : ''"
        :loading="isHarvesting"
      />
      <div class="game-card" v-if="openGameCard">
        <div class="content">
          <div class="close-icon" @click="closeGameCardModal">
            <img src="@/assets/close-vesting-card.svg" />
          </div>
          <div class="card-img">
            <img :src="gameCardUrl" class="tokenImage" />
          </div>
        </div>
      </div>
    </portal>
  </div>
</template>
<script>
import StakedColumn from '@/components/Farms/StakedColumn';
import ModalROI from '@/components/Ui/Modal/ModalROI';
import Helper from '@/helpers/BlockchainHelper';
import BigNumber from 'bignumber.js';
import { getMasterChefAddress } from '@/helpers/farm';
import { getPoolLink, getStablePoolLink } from '@/utils/helpers';
import config from '@/config';
import ModalWarningHarvestNFTFarm from '../../Ui/Modal/ModalWarningHarvestNFTFarm.vue';
import _ from 'lodash';

export default {
  name: 'BuniFarmTr',
  data() {
    return {
      openDetail: false,
      openRoiModal: false,
      isHarvesting: false,
      gameCardUrl: '',
      openGameCard: false,
      openModalWarningHarvestNFTFarm: false
    };
  },
  components: {
    StakedColumn,
    ModalROI,
    ModalWarningHarvestNFTFarm
  },
  props: {
    poolTokens: {
      type: Array,
      require: true,
      default: () => []
    },
    poolId: {
      type: String,
      require: true
    },
    buniEarned: {
      type: Number,
      require: false
    },
    apy: {
      require: true
    },
    stake: {
      require: true
    },
    reward: {
      require: true
    },
    details: {
      type: Object
    },
    buniPrice: {
      require: true
    },
    originalValue: {
      require: true
    },
    nftReward: {
      type: String,
      require: true
    },
    singleToken: {
      default: 'BUNI'
    }
  },
  computed: {
    currentLevel() {
      return this.getCardGame(this.buniEarned);
    },
    isLoadingFarmData() {
      return this.$store.state.farm.isLoadingUserData;
    },

    earningsBusd() {
      return this.buniEarned
        ? new BigNumber(this.buniEarned).multipliedBy(this.buniPrice).toNumber()
        : 0;
    },
    account() {
      const { connector, address } = this.$store.state.account;
      if (!connector || !connector.id || !address) {
        return '';
      }
      return address;
    },
    bscLink() {
      if (!this.details) {
        return '#';
      }
      const farm = this.details;
      return `${config.explorer}/address/${farm.lpAddresses}`;
    },
    poolLink() {
      if (!this.details) {
        return '#';
      }
      return this.details.poolType === 'tokens'
        ? getPoolLink(this.details.poolAddress, this.details.poolType)
        : getStablePoolLink(this.details, this.details.poolType);
    }
  },
  methods: {
    closeModalWarningHarvestNFTFarm() {
      this.openModalWarningHarvestNFTFarm = false;
    },
    openGameCardModal(imageUrl) {
      this.openGameCard = true;
      this.gameCardUrl = imageUrl;
    },
    closeGameCardModal() {
      this.openGameCard = false;
      this.gameCardUrl = '';
    },
    toggleDetail() {
      this.openDetail = !this.openDetail;
    },
    handleRoiModal() {
      this.openRoiModal = !this.openRoiModal;
    },
    async onReward() {
      if (this.isDisable) {
        return;
      }

      if (new BigNumber(this.buniEarned).isZero()) {
        return;
      }

      this.isHarvesting = true;

      const provider = await this.$store.getters['account/provider'];

      try {
        const harvestType = this.$store.state.theme.vestingMode;
        await Helper.harvest(
          provider,
          getMasterChefAddress(this.details.pid),
          this.details.pid,
          harvestType
        );
        this.$store.dispatch('farm/getFarmUserData');
        if (this.$store.state.theme.vestingMode === 'NFT') {
          setTimeout(() => this.$router.push({ name: 'vesting' }), 2000);
        }
      } catch (e) {
        console.error(
          `Action onReward Buni farm has error ${e.message()}`,
          JSON.stringify(e)
        );
      } finally {
        this.isHarvesting = false;
      }
    }
  }
};
</script>

<style lang="scss">
@media only screen and (max-width: 767px) {
  .table-farm .detail .detail-infos.card-game-wrapper {
    width: 100% !important;
  }
  .card-game {
    margin-right: 0 !important;
  }
}

.game-card {
  background-image: url('../../../assets/vesting-modal-bg.svg');
  position: fixed;
  display: flex;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  background-position: center;
  background-repeat: no-repeat;
  background-color: rgba($color: #000000, $alpha: 0.5);
  z-index: 10;
  .content {
    position: relative;
    display: flex;
    justify-content: center;
    .close-icon {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 100%;
      width: 45px;
      height: 45px;
      @media only screen and (max-width: 767px) {
        left: 85%;
        top: -50px;
      }
    }
    .card-img {
      width: 450px;
      @media only screen and (max-width: 767px) {
        width: calc(100% - 40px);
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}
.card-game-wrapper {
  .buni-card-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
.card-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  .card-game {
    cursor: pointer;
    margin-right: 30px;
  }
}
.table-farm-wrapper {
  margin-top: 30px;
}

.table-farm {
  .line {
    padding: 0 !important;
  }
  .farm-row {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .row-info {
    display: flex;
    padding: 1rem 1.5rem;
    cursor: pointer;
    background: var(--panel-background);
    &:hover {
      background: var(--hover-background) !important;
    }
    @media only screen and (max-width: 768px) {
      &:hover {
        background-color: var(--panel-background) !important;
      }
    }
  }
  .rows {
    &:first-child {
      .row-info {
        border-top-left-radius: 15px;
        border-top-right-radius: 15px;
        @media only screen and (max-width: 768px) {
          border-radius: 0 !important;
        }
      }
    }
    &:last-child {
      .row-info {
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        @media only screen and (max-width: 768px) {
          border-radius: 0 !important;
        }
      }
    }
  }
  .detail-column {
    display: flex;
    align-items: center;
    white-space: nowrap;
    .toggle-icon {
      margin-left: 7px;
      color: var(--link-color);
      display: flex;
      align-items: center;
      margin-top: 4px;
    }

    .toggle-icon.flipped {
      transform: rotate(180deg);
    }
  }
  .apr-content {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .farm-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    .content {
      display: flex;
      align-items: center;
    }
    .label-row {
      color: var(--label-row-color);
      font-size: 13px;
      font-family: $font-weight-regular;
    }
    &.farm-name {
      width: 20%;
      display: flex;
      justify-content: center;
      .farm-name-wrapper {
        display: flex;
        align-items: center;
        .tokens {
          position: relative;
          .token-img,
          .token-img-2 {
            width: 30px;
            height: 30px;
            object-fit: contain;
          }
          img:last-child {
            margin-left: -10px;
            margin-right: 15px;
          }
        }
      }
    }
    &.farm-info {
      width: 15%;
    }
  }
  .earned {
    display: flex;
  }
  .detail {
    padding: 1rem 1.5rem;
    background: var(--detail-row-background);
    display: flex;
    .detail-infos {
      width: 32% !important;
      color: var(--link-color);
      line-height: 25px;
      .detail-info {
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }

        @media only screen and (max-width: 768px) {
          font-size: 13px;
        }
      }
    }
    .harvest,
    .farming {
      width: 32%;
    }
    .farming {
      display: flex;
      flex-direction: column;
    }
    .harvest {
      .wrapper {
        background: var(--input-background);
        height: 50px;
        width: 80%;
        border: 1px solid var(--border-button-input);
        box-sizing: border-box;
        box-shadow: inset 1px 2px 3px var(--box-shadow-input);
        border-radius: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 5px;
        padding: 8px 15px;
        .earned {
          display: flex;
          flex-direction: column;
          .earned-number {
            font-size: 18px;
            line-height: 20px;
            margin-top: 5px;
          }
          .currency {
            color: var(--color-arrow-down);
            font-size: 10px;
            line-height: 16px;
          }
        }
      }
    }
    &:hover {
      background: var(--hover-background) !important;
    }
    @media only screen and (max-width: 768px) {
      &:hover {
        background-color: var(--detail-row-background) !important;
      }
    }
  }
  .external-link {
    color: var(--link-color);
  }
  .label-input {
    color: (--text-color);
    line-height: 20px;
    font-size: 13px;
    font-family: $font-weight-regular;
  }

  .game-label-input {
    font-size: 11px !important;
  }
  .harvest-btn {
    white-space: nowrap;
    background: $btn-bg-color;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    border-radius: 100px;
    border: none;
    width: fit-content;
    padding: 0 15px;
    height: 35px;
    line-height: 35px;
    &.disable {
      opacity: 0.3;
      cursor: not-allowed;
    }
    &:hover {
      background: $btn-bg-hover-color;
    }
  }

  .unlock-wrapper {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 8px 0;
    margin-top: 5px;
  }
}
.external-link {
  &:hover {
    color: var(--link-color) !important;
  }
}
.column-pool {
  max-width: 72px !important;
  width: auto !important;
  margin-right: 5px;
}
.wrap-list-tokens {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  max-width: 330px;
  margin-left: 15px;
  flex: 1;
}
.mobile-display {
  display: none;
}
.data {
  overflow: hidden;
  text-overflow: ellipsis;
}
.data.game {
  @media only screen and (max-width: 768px) {
    padding-top: 5px;
    line-height: 20px;
  }
}

.detail.game {
  .detail-info {
    font-size: 10px !important;
  }
}
@media only screen and (max-width: 1024px) {
  .table-farm .detail .harvest .wrapper {
    padding: 8px 10px !important;
    .harvest-btn {
      padding: 0 8px;
      height: 30px;
      font-size: 13px;
    }
  }
}

@media only screen and (max-width: 768px) {
  .mobile-display {
    display: block;
    margin-top: 16px;
    .farm-info {
      line-height: 28px;
      display: flex;
      justify-content: space-between;
      .label-row-mobile {
        color: var(--color-arrow-down);
        font-size: 13px;
      }
      .content {
        display: flex;
        max-width: 50%;
        justify-content: flex-end;
        span {
          max-width: 80%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
    .detail-infos {
      width: 100% !important;
      line-height: 28px;
      margin-top: 10px;
    }
  }
  .detail-show {
    width: 100% !important;
  }
  .mobile-show {
    width: 40% !important;
  }
  .hide {
    display: none !important;
  }
  .detail {
    flex-direction: column !important;
    .harvest {
      .wrapper {
        width: 100% !important;
        margin-bottom: 15px;
      }
    }
  }
  .farm-name {
    width: 50% !important;
  }
  .detail-column {
    width: 10%;
  }
  .row-info {
    display: flex !important;
    justify-content: space-between;
  }
  .wrap-list-tokens {
    max-width: 70px;
  }

  .earned-number.game {
    font-size: 10px !important;
    margin-bottom: 5px !important;
    margin-top: 5px !important;
  }

  .currency.game {
    font-size: 9px !important;
  }

  .detail.game {
    padding: 10px !important;
  }
}
.label-row.game {
  font-size: 10px !important;
  margin-bottom: 5px;
}

.game-border-btn-add {
  border-radius: 0 !important;
  height: 20px !important;
  font-size: 10px !important;
}

.game-btn-input-2.wrapper {
  border-radius: 0 !important;
  height: 40px !important;
}

.game-text-mobile {
  font-size: 11px !important;
}
</style>
