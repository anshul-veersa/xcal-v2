<template>
  <div class="column-layout">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.column-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: 40px 1fr;

  max-height: 600px;
  max-width: 1200px;
  overflow: hidden;
}
</style>
