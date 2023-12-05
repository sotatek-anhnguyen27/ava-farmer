<template>
  <div>
    <UiModal
      v-if="!openStakeNFTModal"
      :open="open"
      @close="$emit('closeStakeNFTModal')"
      style="max-width: 600px;"
      class="modal-stake-nft"
      :class="_isThemeGame ? 'game' : ''"
    >
      <template #default>
        <div class="header" :class="_isThemeGame && 'game-header'">
          <div>Stake NFT</div>
          <div
            v-if="nftType === 'bounty'"
            class="stakeNFT-warning"
            :class="_isThemeGame && 'game-border-message-error'"
          >
            <Icon v-if="!_isThemeGame" name="warning" size="22" class="text" />
            <img
              v-else
              src="~/@/assets/icon/game/error.png"
              style="width: 30px;"
              class="icon-warning"
            />
            <div>
              You can not unstake once the NFT has been staked in the Bounty NFT
              Farm!
            </div>
          </div>
        </div>
        <div class="content">
          <div class="nft-row nft-header-label">
            <div class="nft-id">ID</div>
            <div class="nft-name">NFT Name</div>
            <div class="hash-rate">
              {{ nftType === 'bounty' ? 'Hash Rate' : 'Backed BUNI' }}
            </div>
          </div>
          <template v-if="listNFTs.length > 0">
            <div
              class="nft-row nft-info"
              :class="selectedNFT === nftItem.tokenId ? 'selected' : ''"
              v-for="nftItem in listNFTs"
              :key="'bountyNFT-' + nftItem.tokenId"
              @click="selectedNFT = nftItem.tokenId"
            >
              <div class="nft-id">{{ nftItem.tokenId }}</div>
              <div class="nft-name">{{ nftItem.name }}</div>
              <div class="hash-rate">{{ _num(nftItem.hashRate) }}</div>
            </div>
          </template>
          <template v-else>
            <div class="blank-state">
              <div>
                <img v-if="!_isThemeGame" src="~@/assets/icon/no-search.svg" />
                <img v-else src="~@/assets/icon/game/no-search.png" />
              </div>
              <div
                :class="`mt-4 ${_isThemeGame ? 'game' : ''}`"
                class="not-found"
              >
                {{ $t('noTokenFound') }}
              </div>
            </div>
          </template>
        </div>
        <div class="retangle"></div>
        <div class="button-flex button-footer">
          <UiButton
            :requireLogin="true"
            type="submit"
            class="button-wrapper button"
            :class="
              `${(isLoading || !selectedNFT) && 'disable'} ${
                _isThemeGame ? 'game-border-btn-add' : ''
              }`
            "
            @click="onStakeNFT"
          >
            <UiLoading v-if="isLoading" />
            <span v-else>{{ $t('confirm') }}</span>
          </UiButton>

          <UiButton
            @click="$emit('closeStakeNFTModal')"
            type="button"
            class="button button-cancel"
            :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
          >
            {{ $t('cancel') }}
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>
<script>
import config from '@/config';
import Helper from '@/helpers/BlockchainHelper';
import abi from '@/helpers/abi';
export default {
  data() {
    return {
      openStakeNFTModal: false,
      selectedNFT: null,
      isLoading: false
    };
  },
  props: {
    open: {
      type: Boolean,
      require: true,
      default: false
    },
    listNFTs: {
      type: Array,
      default: () => []
    },
    myAddress: {
      type: String,
      ndefault: ''
    },
    nftType: {
      type: String,
      default: 'bounty'
    }
  },
  watch: {
    open() {
      this.isLoading = false;
      this.selectedNFT = null;
    }
  },
  methods: {
    async onStakeNFT() {
      if (this.isLoading || !this.selectedNFT) return;
      const provider = await this.$store.getters['account/provider'];
      this.isLoading = true;
      try {
        this.nftType === 'bounty'
          ? await Helper.stakeNFT(
              provider,
              config.addresses.bounty_nft,
              abi['BountyNFT'],
              this.myAddress,
              config.addresses.buniBountyFarm,
              this.selectedNFT
            )
          : this.nftType === 'vBuniNew'
          ? await Helper.stakeNFT(
              provider,
              config.addresses.vbuni,
              abi['VBuni'],
              this.myAddress,
              config.addresses.vBuniNFTFarmNew,
              this.selectedNFT
            )
          : await Helper.stakeNFT(
              provider,
              config.addresses.vbuni,
              abi['VBuni'],
              this.myAddress,
              config.addresses.vBuniNFTFarm,
              this.selectedNFT
            );
        this.$emit('refresh');
      } catch (e) {
        console.error(
          `Action onStakeNFT has error ${e.message}`,
          JSON.stringify(e)
        );
      } finally {
        this.isLoading = false;
        this.$emit('closeStakeNFTModal');
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.header {
  font-weight: bold;
  font-size: 22px;
  line-height: 35px;
  color: var(--text-color);
  padding: 20px 40px;
  background: var(--tab-background);
  .stakeNFT-warning {
    color: $error;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: 13px;
    padding: 8px 16px;
    line-height: 18px;
    background-color: rgba(235, 98, 91, 0.15);
    border-radius: 5px;
    margin: 8px 0;
  }
  .stakeNFT-warning.game-border-message-error {
    color: $game-error-text-color;
    margin-top: 15px !important;
    margin-bottom: 15px !important;
    max-width: 500px;
  }
}
.game-header.header {
  font-family: $font-forward;

  background-color: #ff9342 !important;
  position: relative;
  z-index: 1;

  &:after {
    content: '';
    height: 50%;
    width: calc(100% - 8px);
    background-color: #f4791a;
    box-shadow: 0 -8px #f4791a, 0 0 0 4px #f4791a !important;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    z-index: -1;
  }
}
.content {
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
  position: relative;
  .nft-row.nft-header-label {
    position: sticky;
    width: 100%;
    top: 0;
    background: var(--panel-background);
    color: var(--color-arrow-down);
  }
  .nft-row {
    padding: 8px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .nft-info {
    cursor: pointer;
    color: var(--text-color-liquidity);
  }
  .nft-info:hover {
    background-color: var(--hover-background);
  }
  .nft-row.selected {
    background-color: var(--hover-background);
  }
  .nft-id {
    width: 20%;
  }
  .nft-name {
    text-align: left;
  }
  .hash-rate {
    width: 30%;
    text-align: right;
  }
  .nft-name {
    width: 50%;
  }
}
.retangle {
  width: 100%;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}
.button-flex {
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.button-footer {
  padding: 0px 20px;
}
.game-border-btn-add.button {
  width: 150px;
  font-family: $font-forward !important;
  height: 35px !important;
  margin: 15px 5px 30px 30px;

  font-size: 12px !important;
}
.button {
  min-width: 150px !important;

  @media only screen and (max-width: 768px) {
    min-width: 100px !important;
  }
}
.button-wrapper.button {
  background: $color-primary !important;
  color: $secondary-button-text !important;
  margin: 15px 0 30px 0;
  font-family: $font-bold !important;
  font-size: 16px !important;
  border: 0 !important;
  width: 190px;

  &:enabled {
    &:hover {
      background: $game-btn-hover-color !important;
    }
  }

  &.disable {
    background: $color-primary;
    opacity: 0.4;
    cursor: not-allowed;

    &:hover {
      background: $color-primary !important;
    }
  }

  @media only screen and (max-width: 768px) {
    width: 150px;
    &:hover {
      background: $color-primary !important;
      color: $secondary-button-text !important;
    }
  }
}
.button-cancel {
  margin: 15px 0 30px 0;
  width: 190px !important;
  font-size: 16px;
  color: $color-primary;
  border: 2px solid $color-primary !important;
  background-color: inherit !important;

  &:hover {
    background: $color-primary !important;
  }

  @media only screen and (max-width: 768px) {
    width: 150px;
    &:hover {
      background-color: inherit !important;
      color: $color-primary !important;
    }
  }
}
.blank-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}
.not-found {
  color: var(--color-arrow-down);
}
</style>
