<template>
  <header class="header-layer" data-scroll-sync="x">
    <ul>
      <li v-for="item in headerItems" :key="item.id" v-bind="item.attributes">
        {{ item.label }}
      </li>
    </ul>
  </header>
</template>

<script setup lang="ts" generic="T">
import { computed, inject, onMounted } from "vue";
import type { CalendarEvent, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";
import { DayTiler } from "@/core/tilers";
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
.header-layer {
  grid-row: 1 / 2;
  grid-column: 2 / -1;
  pointer-events: none;

  ul {
    list-style: none;
    display: flex;
    height: 100%;

    li {
      display: flex;
      justify-content: center;
      flex: 1 1 0;
      min-width: 120px;
    }

    li[data-today] {
      outline-offset: -2px;
      background-color: #f8faff;
    }
  }
}
</style>
