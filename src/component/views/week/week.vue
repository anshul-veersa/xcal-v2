<template>
  <div class="week-view">
    <ColumnLayout>
      <header class="header-layer" data-scroll-sync="x">
        <div class="scroll-container">
          <ul>
            <li
              v-for="day in weekDays"
              :key="day.toDateString()"
              :data-today="t.isSameDay(t.today, day)"
            >
              {{ t.format(day, "EEE  d") }}
            </li>
          </ul>
        </div>
      </header>

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
    </ColumnLayout>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject, onMounted } from "vue";
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
  return dayIndex / 7;
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

let isSyncingScroll = false;
onMounted(() => {
  const syncScroll = (source: HTMLElement, targets: HTMLElement[]) => {
    if (!isSyncingScroll) {
      isSyncingScroll = true;
      targets.forEach((target) => {
        target.scrollTop = source.scrollTop;
        target.scrollLeft = source.scrollLeft;
      });
      isSyncingScroll = false;
    }
  };

  const scrollContainers = Array.from(
    document.querySelectorAll("[data-scroll-sync]")
  ) as HTMLElement[];

  scrollContainers.forEach((container) => {
    container.addEventListener("scroll", () =>
      syncScroll(container, scrollContainers)
    );
  });
});
</script>

<style scoped lang="scss">
.overlay-layer {
  position: relative;
  grid-row-start: 2;
  grid-column-start: 2;
  pointer-events: none;
}

.header-layer {
  grid-row: 1 / -1;
  grid-column-start: 2;
  pointer-events: none;

  ul {
    list-style: none;
    display: flex;
    width: 100%;

    li {
      display: flex;
      justify-content: center;
      flex: 1 1 0;
      min-width: 100px;
    }

    li[data-today] {
      outline-offset: -2px;
      background-color: #f8faff;
    }
  }
}
</style>
