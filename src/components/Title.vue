<template>
  <div :class="`${_isThemeGame ? 'title-game' : ''}`" class="wrapper">
    <div>
      <div class="title" v-text="title" />
      <div v-if="subTitle" class="sub-title" v-html="subTitle" />
    </div>
    <div v-if="totalMyLiquidity" class="tvl">
<!--      <div class="tvl-block">-->
<!--        <span-->
<!--          v-if="subTitle"-->
<!--          :class="_isThemeGame ? 'game' : ''"-->
<!--          class="tvl-label"-->
<!--          v-html="$t('totalValueLocked')"-->
<!--        />-->
<!--        <span class="tvl-label" :class="_isThemeGame ? 'game' : ''">-->
<!--          {{ _roundedCurrency(tvl) }}-->
<!--        </span>-->
<!--      </div>-->
      <div class="tvl-block">
        <span
          v-if="subTitle"
          :class="_isThemeGame ? 'game' : ''"
          class="tvl-label"
          v-html="$t('totalMyLiquidity') + ': '"
        />
        <span class="tvl-label" :class="_isThemeGame ? 'game' : ''">
          {{ _roundedCurrency(totalMyLiquidity) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['title', 'subTitle', 'tvl', 'totalMyLiquidity']
};
</script>

<style scoped lang="scss">
@media only screen and (max-width: 768px) {
  .tvl-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
}
.wrapper {
  display: flex;
  justify-content: space-between;
}
.tvl {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}
.tvl-number {
  font-family: $font-weight-semibold;
  font-size: 20px;
  line-height: 24px;
  text-transform: capitalize;
  color: var(--text-color);
}
.tvl-number.game {
  font-size: 15px;
}
.tvl-label.game {
  font-size: 11px;
  font-weight: normal;
}
.tvl-label {
  font-family: $font-weight-regular;
  font-weight: 600;
  font-size: 15px;
  line-height: 20px;
  text-align: right;
  text-transform: capitalize;
  color: var(--button-color-checkbox);
  margin-top: 8px;
}
.title {
  font-family: $font-weight-semibold;
  font-size: 35px;
  line-height: 42px;
  color: var(--text-color);
  margin-bottom: 10px;
}

.sub-title {
  margin-bottom: 25px;
  font-size: 16px;
  line-height: 19px;
  color: var(--swap-balance-text-color);
  font-family: $font-weight-regular;
}

.title-game {
  .title {
    font-family: $font-forward;
    font-size: 16px;
  }

  .sub-title {
    font-family: $font-forward;
    font-size: 11px;
  }
}
</style>
