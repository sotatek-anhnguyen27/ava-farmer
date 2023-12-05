import { mapState } from 'vuex';
import store from '@/store';
import config from '@/config';
import { shortenAddress, shorten, trunc, formatNumber, roundedCurrency } from '@/helpers/utils';
import { BNB_KEY, isMobile } from './utils/helpers';
import BigNumber from 'bignumber.js';

// @ts-ignore
const modules = Object.entries(store.state).map(module => module[0]);
export const ADDRESS_LIMIT_DECIMAL = [
  '0x0B22E57e4e1E236f1E4C4d68c15E064E1Cc2e265', //USDC
  '0x9792F3977Ac74833EA55Da9B2Aa63277eaB05A5C', //USDT
  '0x0675A944CbEa834cddA62F24a08cE42d0fbb83A3', //BUSD
  '0x55d398326f99059fF775485246999027B3197955', //BSC USDT
  '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', //BSC USDC
  '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' //BSC BUSD
];
export default {
  data() {
    return {
      config
    };
  },
  computed: {
    ...mapState(modules),
    _isMobile(): boolean {
      return isMobile();
    },
    _isThemeGame(): boolean {
      // @ts-ignore
      return this.$store.state.theme.mode === 'game';
    },
    isAuthenticated() {
      // @ts-ignore
      return this.$store.state.account.address;
    }
  },
  methods: {
    _getPrecision(address: string) {
      return this._hasLimitedDecimalToken(address) ? 6 : 18;
    },
    _num(number, key) {
      return formatNumber(number, key);
    },
    _roundedCurrency(number) {
      return roundedCurrency(number);
    },
    _shortenAddress(str: string): string {
      return shortenAddress(str);
    },
    _shorten(str: string, max?): string {
      return shorten(str, max);
    },
    _trunc(value: number, decimals: number): number {
      return trunc(value, decimals);
    },
    _etherscanLink(str: string, type = 'address'): string {
      return `${config.explorer}/${type}/${str}`;
    },
    _ticker(address: string): string {
      if (address === BNB_KEY) return BNB_KEY.toUpperCase();
      const token =
        config.tokens[address] || config.tokens[address.toLowerCase()];
      return token ? token.symbol : this._shortenAddress(address);
    },
    _precision(rawValue: number, address: string): number {
      const tokenConfig = config.tokens[address] || {};
      const precision = tokenConfig.precision || config.defaultPrecision;
      const value = rawValue.toFixed(precision);
      return parseFloat(value);
    },
    _hasLimitedDecimalToken(address: string) {
      return (
        ADDRESS_LIMIT_DECIMAL.findIndex(
          addressToken => addressToken.toLowerCase() == address.toLowerCase()
        ) >= 0
      );
    },
    _validInputNumber(value: string, numDecimal?: number): string {
      value = new BigNumber(value || 0).toString();
      if (value && value.includes('.')) {
        return (
          value.split('.')[0] +
          '.' +
          value.split('.')[1].slice(0, numDecimal || 18)
        );
      }
      return new BigNumber(value).toString();
    },
    _checkMinValue(value) {
      return parseFloat(value) > 1e-8
        ? parseFloat(value).toFixed(8)
        : '< 0.00000001';
    },
    _checkMyPoolSharePercent(value) {
      if (value === 0) return '-';
      else if (value < 1e-4) {
        return '< 0.01%';
      }
      return this._num(value, 'percent');
    },
    _checkMyPoolSharePercentResult(value) {
      if (value === 0) return '0%';
      else if (value < 1e-4) {
        return '< 0.01%';
      }
      return this._num(value, 'percent');
    },
    _checkValueBalance(value) {
      if (value < 1e-4) {
        return '< $0.0001';
      }
      return this._num(value, 'usd');
    }
  }
};
