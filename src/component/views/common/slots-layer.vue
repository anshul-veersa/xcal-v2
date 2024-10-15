<template>
  <div class="slots-layer">
    <div v-for="slots in daysSlots" class="day-slots">
      <div v-for="slot in slots" :key="slot.id" class="day-slot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeUtils } from "@/core/time";
import type { SlotDuration } from "@/types";
import { computed, inject } from "vue";

const t = inject<TimeUtils>("time_utils")!;

const props = defineProps<{ slotDuration: SlotDuration; days: Date[] }>();

const daysSlots = computed(() => {
  const totalSlots = 1440 / props.slotDuration;

  return props.days.map((day) => {
    return Array.from({ length: totalSlots }, (_, i) => {
      return {
        id: i,
        startTime: t.addMinutes(day, i * props.slotDuration),
        endTime: t.addMinutes(day, (i + 1) * props.slotDuration),
      };
    });
  });
});
</script>

<style lang="scss" scoped>
$slot-size: 36px;

.day-slot {
  height: $slot-size;
  transition: background-color 0.2s ease-out;

  &:hover {
    background-color: rgb(244, 242, 250);
  }
}

.day-slots {
  flex-basis: 0;
  flex-grow: 1;
}

.slots-layer {
  grid-row-start: 1;
  grid-column-start: 2;
  display: flex;
}
</style>
