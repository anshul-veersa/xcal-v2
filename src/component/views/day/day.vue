<template>
  <div class="day-view">
    <header>All Day</header>
    <div class="day-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer
        :columns="[{ date: activeDate, id: null }]"
        :slot-duration="config.slotDuration"
      />

      <EventTilesLayer :layout-event-tiles="layoutEventTiles">
        <template #event-tile="slotProps">
          <slot name="event-tile" v-bind="slotProps" />
        </template>
      </EventTilesLayer>

      <div class="overlay-layer">
        <TimeMarker :hideSelectorsOnOverlap="['.hour-indicator__label']" />
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

const { events, activeDate, config } = inject<{
  events: Array<CalendarEvent<T>>;
  activeDate: Date;
  config: {
    slotDuration: SlotDuration;
    maxEventsPerSlot: number;
    showCurrentTimeMarker: boolean;
    showAllDaySlot: boolean;
  };
}>("config")!;

const t = inject<TimeUtils>("time_utils")!;

const tiler = new DayTiler(
  { maxPerSlot: config.maxEventsPerSlot, slotDuration: config.slotDuration },
  t
);
const layoutEventTiles = computed(() => {
  return [
    {
      id: +activeDate,
      eventTiles: tiler.getLayoutTiles(events, { date: activeDate }),
    },
  ];
});
</script>

<style scoped lang="scss">
.day-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
}

.overlay-layer {
  z-index: 2;
  position: relative;
  grid-row-start: 1;
  grid-column-start: 2;
  pointer-events: none;
}
</style>
