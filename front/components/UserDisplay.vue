<template>
  <div>
    {{ user.nickname }}
    <slot> </slot>
  </div>
</template>

<script>
export default {
  props: ["user"]
};
</script>

<style lang="scss" scoped>
</style>