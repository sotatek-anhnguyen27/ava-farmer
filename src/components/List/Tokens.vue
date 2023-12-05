<template>
  <div class="table-body">
    <ListToken
      v-for="token in pool.tokens"
      :key="token.address"
      :pool="pool"
      :bPool="bPool"
      :token="token"
      :class="'table-tr'"
    />
  </div>
</template>

<script>
export default {
  props: ['pool', 'bPool']
};
</script>
<style lang="scss">
.table-body {
  // border: 1px solid var(--border-table-body);
  // border-bottom-left-radius: 5px;
  // border-bottom-right-radius: 5px;
  border-top: none;
  overflow: hidden;
}
.table-tr {
  height: 50px !important;
}
</style>
