<template>
  <div class="slots-layer" data-scroll-sync="all">
    <div class="columns">
      <div v-for="column in columns" class="column-slots">
        <div
          v-for="slot in column.slots"
          :key="slot.id"
          class="slot"
          @click="handleSlotClick(slot, column.id)"
        />
      </div>
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
  const totalSlots = t.minutesInDay / props.slotDuration;

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
$separator-color: rgba(0, 0, 0, 0.2);

.slots-layer {
  pointer-events: none;
  grid-row: 2 / -1;
  grid-column: 2 / -1;
}

.columns {
  display: flex;
}

.column-slots {
  flex: 1 1 0;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid $separator-color;
}

.slot {
  pointer-events: all;
  flex: 0 0 $slot-size;
  transition: background-color 0.2s ease-out;
  &:hover {
    background-color: #ecf2f279;
  }
}
</style>
