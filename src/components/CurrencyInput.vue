<template>
  <masked-input
    ref="input"
    :mask="createNumberMask"
    :guide="false"
    v-model="internalValue"
    type="text"
    @paste.native="onPaste"
    @keypress="onKeyPress"
    @keyup.native="onKeyUp"
    @focus="onFocus"
    @blur="onBlur"
    @input="$emit('handleInputChange', internalValue)"
  />
</template>
<script>
import MaskedInput from 'vue-text-mask';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

export default {
  components: {
    MaskedInput
  },
  props: {
    // eslint-disable-next-line vue/require-prop-type-constructor
    value: '',
    focusHandler: {
      default: null
    },
    precision: {}
  },
  data() {
    return {
      internalValue: '',
      internalPrecision: 0,
      isPasted: false
    };
  },
  watch: {
    value(val) {
      if (val === undefined || val === '' || !val) {
        this.internalValue = undefined;
        return;
      }

      if (`${val}`.length !== new BigNumber(`${val}`).toString().length) {
        this.internalValue = new BigNumber(val).toString();
      }

      if (new BigNumber(val).comparedTo(this.internalValue) === 0) {
        return;
      }
      if (val !== '' && val !== this.internalValue) {
        this.updateValue(val);
      }
    },
    internalValue(val) {
      const standardizedValue = this.standardize(val);
      // const formattedValue = this.formatNumber(standardizedValue);
      const formattedValue = standardizedValue;

      if (val !== formattedValue) {
        this.internalValue = formattedValue;
        this.$refs.input.$el.value = this.internalValue;
        return;
      }

      if (
        (val === '' && this.value === '0') ||
        (val === '0' && this.value === '') ||
        (val === '0' && this.value === undefined) ||
        this.standardize(val || '0') !==
          new BigNumber(this.value || '0').toString()
      ) {
        this.updateValue(val);
      }
    },
    precision(val) {
      if (this.internalPrecision !== val) {
        this.internalPrecision = val;
      }
    }
  },
  created() {
    BigNumber.config({ EXPONENTIAL_AT: 30, DECIMAL_PLACES: 30 });
    this.internalPrecision = this.precision;
    this.internalValue = this.value || '';
    if (this.internalValue !== '' && this.internalValue !== undefined) {
      this.internalValue = new BigNumber(`${this.internalValue}`).toString();
    }
    this.$emit('input', this.internalValue);
  },
  mounted() {
    this.$refs.input.$refs.input.autocomplete = 'off';
    this.$refs.input.$refs.input.maxLength = 21;
  },
  methods: {
    onPaste(event) {
      const value = (event.clipboardData || window.clipboardData).getData(
        'Text'
      );
      if (!this.isNumber(value)) {
        event.preventDefault();
      }
      this.isPasted = true;
    },
    onKeyPress(event) {
      if (this.isFullWidthChar(event.key)) {
        event.preventDefault();
      }
      return true;
    },
    isFullWidthChar(charCode) {
      return (0xff00 < charCode && charCode < 0xff5f) || 0x3000 === charCode;
    },
    onKeyUp(event) {
      const charCode = event.which ? event.which : event.keyCode;
      if (
        charCode === 190 &&
        (this.internalValue === '' || this.internalValue === undefined)
      ) {
        this.internalValue = '0.';
      }
      this.$emit('keyup');
    },
    createNumberMask(value) {
      const standardizedValue = this.standardize(value);
      let formatedValue = standardizedValue;
      // let formatedValue = this.formatNumber(standardizedValue);
      formatedValue =
        formatedValue.length > 20
          ? formatedValue.substring(0, 21)
          : formatedValue;
      if (this.isPasted) {
        this.isPasted = false;
      }
      const result = [];
      for (let i = 0; i < formatedValue.length; i++) {
        const char = formatedValue.charAt(i);
        if (char >= '0' && char <= '9') {
          result.push(/\d/);
        } else if (char === '.') {
          result.push(/\./);
        } else {
          result.push(char);
        }
      }
      return result;
    },

    updateValue(value) {
      if (value === undefined) {
        this.internalValue = undefined;
        return;
      }
      const stringValue = value ? this.removeExponent(value.toString()) : value;
      const standardizedValue = this.standardize(stringValue);
      // const formattedValue = this.formatNumber(standardizedValue);
      const formattedValue = standardizedValue;
      this.internalValue = formattedValue;
      const newValue = standardizedValue
        ? new BigNumber(standardizedValue)
        : undefined;
      // if (
      //   this.formatNumber(this.standardize(this.internalValue)).length > 21 &&
      //   this.formatNumber(this.standardize(this.value)).length < 21
      // ) {
      //   this.$refs.input.$el.value = this.value;
      //   return (this.internalValue = this.value);
      // }
      if (
        this.standardize(this.internalValue).length > 21 &&
        this.standardize(this.value).length < 21
      ) {
        this.$refs.input.$el.value = this.value;
        return (this.internalValue = this.value);
      }

      if (
        (newValue === undefined && newValue !== value && value !== '') ||
        (value && !value.isBigNumber) ||
        (newValue && !newValue.eq(value))
      ) {
        if (
          newValue === undefined &&
          newValue !== value &&
          value !== '' &&
          this.internalValue === ''
        ) {
          return this.$emit('input', newValue);
        }
        this.$emit('input', new BigNumber(newValue).toString());
      } else if (
        this.internalValue === '' &&
        value === '' &&
        this.value !== this.internalValue
      ) {
        return this.$emit('input', '');
      }
    },

    removeExponent(data) {
      const result = String(data).split(/[eE]/);
      if (result.length === 1) {
        return result[0];
      }

      let tail = '';
      const sign = result[0][0] === '-' ? '-' : '';
      const str = result[0].replace('.', '');
      let mag = Number(result[1]) + 1;

      if (mag < 0) {
        tail = `${sign}0.${'0'.repeat(Math.abs(mag))}`;
        return tail + str.replace(/^-/, '');
      }
      mag -= str.length;
      tail = '0'.repeat(Math.abs(mag));
      return str + tail;
    },

    removeDotIfNeed() {
      const value = `${this.internalValue}`;
      const dotIndex = value.indexOf('.');
      if (dotIndex === value.length - 1) {
        this.internalValue = new BigNumber(`${this.internalValue}`).toString();
      }
    },

    onFocus() {
      this.$emit('focus');
    },

    onBlur() {
      this.removeDotIfNeed();
      this.$emit('blur');
    },

    standardize(value = '') {
      const precision = this.internalPrecision;
      let result = value.trim().replace(/[^0-9.]/g, '');
      const dotIndex = result.indexOf('.');
      if (dotIndex === 0) {
        result = `0${result}`;
      } else if (dotIndex > 0) {
        result =
          result.substring(0, dotIndex + 1) +
          result.substring(dotIndex + 1).replace(/[.]/g, '');
        if (precision > 0) {
          result = result.slice(0, dotIndex + precision + 1);
        } else {
          result = result.slice(0, dotIndex);
        }
      }
      result = this.removeLeadingZeros(result);
      return result;
    },

    removeLeadingZeros(value) {
      let result = value;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (result.length < 2) {
          break;
        }
        if (result.charAt(0) === '0' && result.charAt(1) !== '.') {
          result = result.slice(1);
        } else {
          break;
        }
      }
      return result;
    },

    isNumber(value) {
      const rawValue = _.replace(value, /,/g, '') || '';
      if (rawValue.indexOf('.') === 0 || rawValue.split('.').length - 1 > 1) {
        return false;
      }
      return !isNaN(BigNumber(rawValue).toNumber());
    },

    formatNumber(value) {
      let result = `${value}`;
      const x0 = result.split('.');
      let x1 = x0[0];
      const x2 = x0.length > 1 ? `.${x0[1]}` : '';
      const rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1,$2');
      }
      result = x1 + x2;
      return result;
    },

    setPrecision(precision) {
      this.internalPrecision = precision;
    },

    focus() {
      this.$refs.input.$refs.input.focus();
    },

    onEnter(callback) {
      this.$refs.input.$refs.input.onkeypress = function(event) {
        if (event.keyCode === 13) {
          // enter
          callback();
        }
      };
    }
  }
};
</script>
