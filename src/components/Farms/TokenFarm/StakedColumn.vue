<template>
  <div>
    <div
      class="label-input"
      :class="_isThemeGame ? 'game game-label-input' : ''"
    >
      {{ labelInput }}
    </div>
    <div class="unlock-wrapper" :class="_isThemeGame && 'game-unlock-wrap'">
      <template v-if="!myAccount">
        <button
          class="stake-btn"
          @click="unlock"
          :class="`${_isThemeGame ? 'game-border-btn-enable' : ''}`"
        >
          {{ $t('unlock') }}
        </button>
      </template>
      <template v-else-if="isApproved && rawStakedBalance">
        <div class="onPrensent" :class="_isThemeGame ? 'game-btn-input-2' : ''">
          <div class="earned" :class="_isThemeGame ? 'game-label-input' : ''">
            {{ displayBalance }}
          </div>
          <div class="stake-btn-wrapper">
            <button
              class="stake-btn quantity"
              @click="onPresentWithdraw"
              :class="`${_isThemeGame ? 'game-border-btn-add mr-3' : ''}`"
              :disabled="
                buttonLoadingStatus.unstake || $store.state.account.wrongNetwork
              "
            >
              <UiLoading v-if="buttonLoadingStatus.unstake" />
              <Icon v-else-if="!_isThemeGame" name="remove" />
              <img
                v-else
                src="~/@/assets/icon/game/minus.png"
                style="width: 10px"
              />
            </button>
            <button
              class="stake-btn quantity"
              @click="onPresentDeposit"
              :class="`${_isThemeGame ? 'game-border-btn-add' : ''}`"
              :disabled="
                buttonLoadingStatus.stake || $store.state.account.wrongNetwork
              "
            >
              <UiLoading v-if="buttonLoadingStatus.stake" />
              <Icon v-else-if="!_isThemeGame" name="add" />
              <img
                v-else
                src="~/@/assets/icon/game/plus.png"
                style="width: 10px"
              />
            </button>
          </div>
        </div>
      </template>
      <template v-else-if="isApproved">
        <button
          class="stake-btn"
          @click="onPresentDeposit"
          :class="`${_isThemeGame ? 'game-border-btn-enable' : ''}`"
          :disabled="
            buttonLoadingStatus.stake || $store.state.account.wrongNetwork
          "
        >
          <UiLoading v-if="buttonLoadingStatus.stake" />
          <span v-else>
            {{ isSinglePool ? $t('Stake TOP') : $t('stakeLP') }}
          </span>
        </button>
      </template>
      <template v-else>
        <button
          class="stake-btn"
          @click="handleClick"
          v-if="!isApproved"
          :disabled="
            buttonLoadingStatus.enable_farm || $store.state.account.wrongNetwork
          "
          :class="`${_isThemeGame ? 'game-border-btn-enable' : ''}`"
        >
          <UiLoading v-if="buttonLoadingStatus.enable_farm" />
          <span v-else>
            {{ $t('enable') }}
          </span>
        </button>
      </template>
    </div>
    <portal to="modal">
      <ModalStakeToken
        :open="openStakeModal"
        :isTopSinglePool="isSinglePool"
        @closeStakeModal="closeStakeModal"
        @loadingStatusUpdated="onStakingStatusUpdated"
        :label="farmData.lpSymbol"
        :actionType="actionType"
        :tokenBalance="farmData.userData && farmData.userData.tokenBalance"
        :stakedBalance="farmData.userData && farmData.userData.stakedBalance"
        :farmData="farmData"
        :pid="pid"
        :liquidityUrl="poolLink"
      />
    </portal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import BigNumber from 'bignumber.js';
import { getBalanceNumber } from '@/helpers/farm';
import ModalStakeToken from '@/components/Farms/TokenFarm/ModalStakeToken';
import config from '@/config';
import abi from '@/helpers/abi';
import { Contract } from '@ethersproject/contracts';
import { handleApproveToken } from '@/utils/approve-utils';

export default {
  name: 'StakedColumn',
  components: {
    ModalStakeToken
  },
  props: {
    pid: {
      required: true
    },
    farmData: {
      required: true
    },
    poolLink: {
      type: String
    },
    isSinglePool: {
      type: Boolean
    }
  },
  data() {
    return {
      modalOpen: {
        account: false,
        activity: false
      },
      openStakeModal: false,
      actionType: 'Stake',
      buttonLoadingStatus: {
        enable_farm: false,
        stake: false,
        unstake: false
      }
    };
  },
  computed: {
    myAccount() {
      return this.$store.state.account.address;
    },
    wrongNetwork() {
      return this.$store.state.account.wrongNetwork;
    },
    allowance() {
      if (!this.farmData || !this.farmData.lpAddresses) {
        return 0;
      }
      const allowances = this.$store.state.account.allowances;
      const masterChef = config.addresses.tokenMasterChef;
      const tokenAllowance =
        allowances[
          `${masterChef}-${this.farmData.poolAddress}-${this.farmData.pid}`
        ];

      if (!tokenAllowance) {
        return 0;
      }
      return new BigNumber(
        tokenAllowance[this.farmData.lpAddresses] || 0
      ).toString();
    },
    isApproved() {
      return this.myAccount && new BigNumber(this.allowance).comparedTo(0) > 0;
    },
    displayBalance() {
      const rawStakedBalance = new BigNumber(this.rawStakedBalance).toFixed(8);
      return !new BigNumber(this.fullToken).isZero() &&
        this.rawStakedBalance <= 1e-4
        ? '<0.0001'
        : new BigNumber(rawStakedBalance).toString();
    },
    rawStakedBalance() {
      if (!this.farmData || this.farmData.pid !== this.pid) {
        return 0;
      }

      const stakedBalance = this.farmData.userData
        ? new BigNumber(this.farmData.userData.stakedBalance)
        : new BigNumber(0);
      return !this.wrongNetwork ? getBalanceNumber(stakedBalance) : null;
    },
    labelInput() {
      if (!this.myAccount) {
        return this.$t('startFarming');
      }
      if (this.isApproved) {
        if (this.rawStakedBalance) {
          return this.isSinglePool
            ? `TOP ${this.$t('Staked')}`
            : `LP ${this.$t('Staked')}`;
        }
        return this.isSinglePool
          ? `${this.$t('stake')} TOP`
          : `${this.$t('stake')} LP`;
      }
      return this.$t('Enable Farm');
    }
  },
  methods: {
    ...mapActions(['login']),
    async unlock() {
      this.$store.dispatch('openAccountModal');
    },
    onPresentDeposit() {
      this.openStakeModal = true;
      this.actionType = 'Stake';
    },
    onPresentWithdraw() {
      this.openStakeModal = true;
      this.actionType = 'Unstake';
    },
    async handleClick() {
      if (this.buttonLoadingStatus.enable_farm) {
        return;
      }

      const provider = await this.$store.getters['account/provider'];

      this.buttonLoadingStatus.enable_farm = true;

      try {
        const MasterChefContract = new Contract(
          config.addresses.tokenMasterChef,
          abi['MasterChef'],
          provider.getSigner()
        );
        const buniContract = new Contract(
          this.farmData.lpAddresses,
          abi['ERC20'],
          provider.getSigner()
        );

        await handleApproveToken(
          provider,
          MasterChefContract,
          buniContract,
          this.$store.state.account.address,
          1
        );
        this.$root.$emit('UPDATE_TOKEN_FARM_USER_ALLOWANCES');
        this.$root.$emit('UPDATE_TOKEN_FARM_USER_DATA');
      } catch (e) {
        console.log(
          `Action handleClick-unlockFarm has error ${e.message}`,
          JSON.stringify(e)
        );
      } finally {
        this.buttonLoadingStatus.enable_farm = false;
      }
    },
    closeStakeModal() {
      this.openStakeModal = false;
    },
    onStakingStatusUpdated(stakingAction, status) {
      this.buttonLoadingStatus[stakingAction] = status;
    }
  }
};
</script>

<style lang="scss" scoped>
.stake-btn {
  background: transparent;
  color: $color-primary;
  display: flex;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border-radius: 100px;
  border: 1.5px solid $color-primary;
  width: 144px;
  height: 35px;
  line-height: 35px;
  &:enabled {
    &:hover {
      background: $btn-bg-hover-color !important;
      color: #fff !important;
    }
  }

  @media only screen and (max-width: 768px) {
    &:hover {
      background: transparent !important;
      color: $color-primary !important;
    }
  }
  &.quantity {
    width: 35px;
    height: 35px;
    margin: 0 3px;
    border-radius: 100px;
  }
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

.unlock-wrapper {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-top: 5px;
}
.onPrensent {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  background: var(--input-background);
  height: 50px;
  width: 80%;
  border: 1px solid var(--border-button-input);
  box-sizing: border-box;
  box-shadow: inset 1px 2px 3px var(--box-shadow-input);
  border-radius: 5px;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  padding: 8px 15px;
  @media only screen and (max-width: 768px) {
    width: 100% !important;
  }
}
.stake-btn-wrapper {
  display: flex;
  margin-left: 28px;
}
.earned {
  font-size: 18px;
}

.icon-add,
.icon-remove {
  margin-right: 0 !important;
  margin-top: 3px !important;
}

.quantity.game-border-btn-add {
  background-color: $color-primary;
  height: 18px !important;
  width: 25px;

  &:hover {
    background-color: $game-btn-hover-color !important;
  }
}

.game-border-btn-enable {
  border-radius: 0 !important;
  height: 20px !important;
  font-size: 10px !important;
  border: 0px !important;
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.game-btn-input-2 {
  border-radius: 0 !important;
  height: 37px;
  margin-top: 0px !important;
}

.game-unlock-wrap {
  margin-top: 2px !important;
}
</style>
