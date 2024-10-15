<template>
  <div class="indicators-layer">
    <div
      class="hour-indicator"
      v-for="hourIndicator in slotIndicators"
      :key="hourIndicator.id"
    >
      <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
      <div class="hour-indicator__rule" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeUtils } from "@/core/time";
import { computed, inject } from "vue";

const t = inject<TimeUtils>("time_utils")!;

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
      label: t.format(time, "HH:mm"),
    };
  });

  return indicators;
});
</script>

<style lang="scss" scoped>
$slot-size: 36px;
$separator-color: rgba(0, 0, 0, 0.2);
$hour-indicator-height: 1px;
$slot-size-minutes: 30;
$total-slots: 1440 / $slot-size-minutes;

.indicators-layer {
  display: grid;
  grid-row-start: 1;
  grid-column: 1 / -1;
  grid-template-rows: repeat(calc($total-slots / 2), calc($slot-size * 2));
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
