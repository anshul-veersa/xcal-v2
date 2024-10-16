<template>
  <div class="week-view">
    <div class="week-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer
        :columns="weekDays.map((date) => ({ date, id: null }))"
        :slot-duration="config.slotDuration"
      />

      <EventTilesLayer :layout-event-tiles="layoutEventTiles">
        <template #event-tile="slotProps">
          <slot name="event-tile" v-bind="slotProps" />
        </template>
      </EventTilesLayer>

      <div class="overlay-layer">
        <TimeMarker
          :beadAt="markerBeadOffset"
          :hideSelectorsOnOverlap="['.hour-indicator__label']"
        />
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
    showWeekends: boolean;
    showCurrentTimeMarker: boolean;
    showAllDaySlot: boolean;
  };
}>("config")!;

const t = inject<TimeUtils>("time_utils")!;

const weekDays = computed(() => {
  return t.eachDayOfInterval({
    start: t.startOfWeek(activeDate),
    end: t.endOfWeek(activeDate),
  });
});

const markerBeadOffset = computed(() => {
  const keyFormat = "EEE";
  const dayToday = t.format(t.today, keyFormat);
  const dayIndex = t
    .daysOfWeek(keyFormat)
    .findIndex((d) => d.label === dayToday);
  return +(dayIndex / 7).toFixed(2);
});

const tiler = new DayTiler(
  {
    maxPerSlot: config.maxEventsPerSlot,
    slotDuration: config.slotDuration,
  },
  t
);

const layoutEventTiles = computed(() => {
  const weekEvents = weekDays.value.map((day) => {
    return {
      id: t.format(day, "yyyy-MM-dd"),
      eventTiles: tiler.getLayoutTiles(events, { date: day }),
    };
  });

  return weekEvents;
});
</script>

<style scoped lang="scss">
.week-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
}

.overlay-layer {
  position: relative;
  grid-row-start: 1;
  grid-column-start: 2;
  pointer-events: none;
}
</style>
