<template>
  <div class="button">
    {{ text }}
  </div>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.button {
  padding: 4px;
  color: #21222c;
  font-size: 11px;
  text-transform: capitalize;
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  background: #1f2029;
  cursor: pointer;
}

.button:hover {
  background: #fafafa;
}
</style>
