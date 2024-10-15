<template>
  <div class="week-view">
    <div class="week-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer
        :columns="weekDays.map((date) => ({ date, id: null }))"
        :slot-duration="props.slotDuration"
      />

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

export type WeekViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  maxEventsPerSlot: number;
  slotDuration: SlotDuration;
};

const props = defineProps<WeekViewProps>();

const t = inject<TimeUtils>("time_utils")!;

const weekDays = computed(() => {
  return t.eachDayOfInterval({
    start: t.startOfWeek(props.date),
    end: t.endOfWeek(props.date),
  });
});

const tiler = new DayTiler(
  {
    maxPerSlot: props.maxEventsPerSlot,
    slotDuration: props.slotDuration,
  },
  t
);

const layoutEventTiles = computed(() => {
  const weekEvents = weekDays.value.map((day) => {
    return {
      id: t.format(day, "yyyy-MM-dd"),
      eventTiles: tiler.getLayoutTiles(props.events, { date: day }),
    };
  });

  return weekEvents;
});
</script>

<style scoped lang="scss">
.week-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
  overflow-y: scroll;
  padding: 16px 0;
}

.overlay-layer {
  position: relative;
  grid-row-start: 1;
  grid-column-start: 2;
  pointer-events: none;
}
</style>
