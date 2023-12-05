<template>
  <div class="tooltip-wrapper">
    <div class="trigger">
      <slot name="trigger" />
    </div>
    <div class="tooltip">
      <slot name="default" />
    </div>
  </div>
</template>

<style scoped>
.tooltip-wrapper {
  position: relative;
}

.tooltip {
  width: 320px;
  z-index: 1;
  bottom: 100%;
  left: 50%;
  margin-left: -169px;
  margin-bottom: 8px;
  padding: 8px;
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  visibility: hidden;
  opacity: 0;
  font-size: 14px;
  color: #fff;
  border: 1px solid #e5e5e5;
  background-color: #21222c;
  border-radius: 5px;
  transition: opacity 0.125s ease-in, visibility 0.125s ease-in;
}

.tooltip:hover {
  visibility: visible;
  opacity: 1;
}

.tooltip::before {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -8px;
  content: '';
  border-style: solid;
  border-color: #e5e5e5 transparent transparent transparent;
  border-width: 8px;
}

.tooltip::after {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -7px;
  content: '';
  border-style: solid;
  border-color: #fff transparent transparent transparent;
  border-width: 7px;
}

.trigger:hover + .tooltip {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.125s ease-out, visibility 0.125s ease-out;
}
</style>
