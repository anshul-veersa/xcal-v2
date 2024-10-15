<template>
  <div class="day-view">
    <header>All Day</header>
    <div class="day-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer :days="[props.date]" :slot-duration="props.slotDuration" />

      <EventTilesLayer :layout-event-tiles="layoutEventTiles">
        <template #event-tile="slotProps">
          <slot name="event-tile" v-bind="slotProps" />
        </template>
      </EventTilesLayer>

      <div class="overlay-layer">
        <TimeMarker />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject } from "vue";
import type { CalendarEvent, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";
import { DayTiler } from "@/core/tilers";
import { TimeMarker } from "@/component/shared";
import {
  SlotIndicatorsLayer,
  SlotsLayer,
  EventTilesLayer,
} from "@/component/views/common";

export type DayViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  slotDuration: SlotDuration;
};
const props = defineProps<DayViewProps>();

const t = inject<TimeUtils>("time_utils")!;

const tiler = new DayTiler(
  {
    maxPerSlot: 30,
    slotDuration: props.slotDuration,
  },
  t
);
const layoutEventTiles = computed(() => {
  return [
    {
      id: +props.date,
      eventTiles: tiler.getLayoutTiles(props.events, { date: props.date }),
    },
  ];
});
</script>

<style scoped lang="scss">
.day-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
  overflow-y: scroll;
  padding: 16px 0;
}

.overlay-layer {
  z-index: 2;
  position: relative;
  grid-row-start: 1;
  grid-column-start: 2;
  pointer-events: none;
}
</style>
