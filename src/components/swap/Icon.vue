<template>
  <div v-html="require(`@/assets/${title}Icon.svg`)" />
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
};
</script>
