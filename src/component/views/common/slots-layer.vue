<template>
  <div class="slots-layer">
    <div v-for="column in columns" class="day-slots">
      <div
        v-for="slot in column.slots"
        :key="slot.id"
        class="day-slot"
        @click="handleSlotClick(slot, column.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import type { TimeUtils } from "@/core/time";
import type { SlotDuration } from "@/types";
import { computed, inject } from "vue";

const t = inject<TimeUtils>("time_utils")!;

const emit = defineEmits<{
  (e: "slot-click", value: { slot: Slot; columnId: T }): void;
}>();

const props = defineProps<{
  slotDuration: SlotDuration;
  columns: Array<{ date: Date; id: T }>;
}>();

type Slot = {
  id: number;
  startTime: Date;
  endTime: Date;
};
const columns = computed<Array<{ slots: Slot[]; id: T }>>(() => {
  const totalSlots = 1440 / props.slotDuration;

  return props.columns.map((col) => {
    const date = t.startOfDay(col.date);

    return {
      id: col.id,
      slots: Array.from({ length: totalSlots }, (_, i) => {
        return {
          id: i,
          startTime: t.addMinutes(date, i * props.slotDuration),
          endTime: t.addMinutes(date, (i + 1) * props.slotDuration),
        };
      }),
    };
  });
});

function handleSlotClick(slot: Slot, columnId: T) {
  emit("slot-click", { slot, columnId });
}
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
