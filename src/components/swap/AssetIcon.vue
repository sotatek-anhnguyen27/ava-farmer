<template>
  <img v-if="assetIcon" :src="assetIcon" @error="handleError" />
  <avatar v-else :address="address" size="22" />
</template>

<script>
import { isEmpty } from 'lodash';
import { getAddress } from '@ethersproject/address';

export default {
  props: {
    address: {
      type: String,
      required: true
    },
    metadata: {
      type: Object
    }
  },
  data() {
    return {
      loadingFailed: false
    };
  },
  watch: {
    address() {
      this.loadingFailed = false;
    }
  },
  computed: {
    assetIcon() {
      let metadata = this.metadata;
      if (isEmpty(metadata)) {
        metadata = this.$store.getters['assets/metadata'];
      }
      const assetMetadata =
        metadata[this.address] || metadata[this.address.toLowerCase()];
      if (!assetMetadata || this.loadingFailed) {
        return null;
      }
      return assetMetadata.logoURI;
    }
  },
  methods: {
    handleError() {
      this.loadingFailed = true;
    }
  }
};
</script>
