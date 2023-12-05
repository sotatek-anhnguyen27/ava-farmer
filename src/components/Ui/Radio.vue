<template>
  <div id="wrapper">
    <input
      type="radio"
      name="radio-group"
      :checked="checked"
      @change="onChange"
    />

    <div id="background" v-if="!_isThemeGame">
      <div id="circle"></div>
    </div>
    <span v-else>
      <img
        v-if="checked"
        src="~/@/assets/icon/game/radio-on.png"
        style="width: 20px"
      />
      <img
        v-else
        src="~/@/assets/icon/game/radio-off.png"
        style="width: 20px"
      />
    </span>
  </div>
</template>

<script>
export default {
  props: ['checked', 'onChange']
};
</script>

<style scoped lang="scss">
#wrapper {
  padding: 6px;
  display: inline-block;
  position: relative;
  flex: 0 0 auto;
  box-sizing: content-box;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

input {
  position: absolute;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: inherit;
  z-index: 1;
  top: 0px;
  right: 0px;
  left: 0px;
  width: 30px;
  height: 30px;
}

input:enabled:checked + div > div {
  border: 2px solid $checkbox-bg-color;
  &::after {
    display: inline-block;
    content: '';
    background: $checkbox-bg-color;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
  }
}

input:enabled:not(:checked) + div div {
  border: 2px solid var(--button-color-checkbox);
}

#background {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: 18px;
  height: 18px;
}

#background:before {
  position: absolute;
  transform: scale(0, 0);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  content: '';
}

#circle {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-style: solid;
  border-radius: 50%;
}
</style>
