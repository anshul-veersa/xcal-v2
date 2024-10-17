<template>
  <div class="day-view">
    <ColumnLayout>
      <header>All Day</header>

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
    </ColumnLayout>
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
  ColumnLayout,
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
.overlay-layer {
  position: relative;
  grid-row-start: 2;
  grid-column-start: 2;
  pointer-events: none;
}
</style>
