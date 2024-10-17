<template>
  <div class="indicators-layer" data-scroll-sync="y">
    <div class="scroll-container">
      <div
        class="hour-indicator"
        v-for="hourIndicator in slotIndicators"
        :key="hourIndicator.id"
      >
        <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
        <div class="hour-indicator__rule" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeUtils } from "@/core/time";
import { computed, inject } from "vue";

const t = inject<TimeUtils>("time_utils")!;

const slotLabelFormat = "HH:mm";

const slotIndicators = computed(() => {
  const today = t.today;
  const hours = t.eachHourOfInterval({
    start: t.startOfDay(today),
    end: t.addHours(t.endOfDay(today), 1),
  });

  const indicators = hours.map((time) => {
    return {
      id: +time,
      hour: time,
      label: t.format(time, slotLabelFormat),
    };
  });

  return indicators;
});
</script>

<style lang="scss" scoped>
$separator-color: rgba(0, 0, 0, 0.2);
$hour-indicator-height: 1px;

.indicators-layer {
  pointer-events: none;
  grid-row: 2 / -1;
  grid-column: 1 / -1;
}

.scroll-container {
  --slot-height: 36px;
  display: grid;
  grid-template-rows: repeat(24, calc(var(--slot-height) * 2));
}

.hour-indicator {
  display: flex;
  align-items: center;
  height: 0px;

  &__label {
    font-size: 14px;
    width: 48px;
    flex-shrink: 0;
  }

  &__rule {
    width: 100%;
    height: $hour-indicator-height;
    background-color: $separator-color;
  }
}
</style>
