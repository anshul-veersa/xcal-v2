<template>
  <div class="column-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.column-layout {
  display: grid;
  grid-template-columns: 90px 1fr;
  grid-template-rows: 64px 1fr;
  overflow: hidden;
  height: 80vh;
  border: 1px solid grey;
}
</style>
