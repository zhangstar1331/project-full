<template>
  <div class="container">
    <div>
      <h1>首页</h1>
      
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$http.post('/init')
  },
}
</script>
