<template>
  <span class="loading hidden">
    <img src="~/@/assets/icon/buni_loading.gif" />
  </span>
</template>

<style lang="scss">
.loading {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  span {
    width: 100%;
  }
}

.hidden {
  visibility: hidden;
}
</style>
