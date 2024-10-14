<template>
  <div class="column-view">
    <div class="day-layout">
      <div class="timeline-slots">
        <div
          v-for="hourIndicator in slotIndicators"
          :key="hourIndicator.key"
          style="display: contents"
        >
          <div class="hour-indicator">
            <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
            <div class="hour-indicator__separator"></div>
          </div>

          <div
            v-for="slot in hourIndicator.slots"
            :key="slot.key"
            class="timeline-slot"
          ></div>
        </div>
      </div>

      <div class="timeline-overlay-layer">
        <div
          id="current-time-marker"
          :style="{ top: markerPosition }"
          ref="markerRef"
        >
          <span>{{ t.format(now, "HH:mm") }}</span>
        </div>
      </div>

      <div class="timeline-events">
        <div class="day-column">
          <div class="background-events-layer events-layer"></div>
          <div class="tilled-events-layer events-layer">
            <div
              v-for="tile in layoutEventTiles"
              :key="tile.id"
              class="event-tile"
              :style="{
                gridRowStart: tile.geometry.yStart,
                gridRowEnd: tile.geometry.yEnd,
                margin: '1px',
                position: 'relative',
                width: `calc(${tile.geometry.width * 100 + '%'} - 2px)`,
                left: `calc(${tile.geometry.xOffset * 100 + '%'} + 1px)`,
              }"
            >
              <slot name="event-tile" v-bind="{ event: tile.event, tile }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject, onUnmounted, ref, watch } from "vue";
import type { CalendarEvent, EventTileSlotProps, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";
import { ColumnTiler } from "./tiler";

export type DayViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  slotDuration: SlotDuration;
};

const props = defineProps<DayViewProps>();

const t = inject<TimeUtils>("time_utils")!;

const slotIndicators = computed(() => {
  const d = new Date();
  const hours = t.eachHourOfInterval({
    start: t.startOfDay(d),
    end: t.addHours(t.endOfDay(d), 1),
  });

  const indicators = hours.map((time) => {
    return {
      key: +time,
      hour: time,
      label: t.format(time, "HH:mm"),
      slots: Array(60 / props.slotDuration)
        .fill(null)
        .map((_, i) => ({
          key: i,
          startTime: t.addMinutes(time, i * props.slotDuration),
          endTime: t.addMinutes(time, (i + 1) * props.slotDuration),
        })),
    };
  });

  indicators.at(-1)!.slots = [];

  return indicators;
});

const eventsByDay = computed(() => {
  const map: Record<string, CalendarEvent<T>[] | undefined> = {};
  props.events.forEach((e) => {
    const date = t.format(e.startsAt, "yyyy-MM-dd");
    if (!map[date]) map[date] = [];
    map[date]!.push(e);
  });
  return map;
});

type LayoutEventTiles = Array<EventTileSlotProps<T>>;
const layoutEventTiles = computed(() => {
  const start = performance.now();
  const tiler = new ColumnTiler(props.events, {
    maxPerSlot: 10,
    slotDuration: 60,
  });
  const layoutTiles = tiler.getLayoutTiles();
  console.table({ time: performance.now() - start });
  return layoutTiles;
});

const markerRef = ref<HTMLElement>();

const now = ref(new Date());
const timerId = setInterval(() => {
  now.value = new Date();
}, 1000);
onUnmounted(() => {
  clearInterval(timerId);
});

const markerPosition = computed(() => {
  const start = t.startOfDay(now.value);

  const elapsedMinutes = (+now.value - +start) / (1000 * 60);
  return `${((elapsedMinutes / 1440) * 100).toFixed(1)}%`;
});
</script>

<style scoped lang="scss">
$slot-size: 36px;

.timeline-slots {
  display: grid;
  grid-row-start: 1;
  grid-column: 1 / -1;
}

.timeline-slot {
  height: $slot-size;
  width: 100%;
}

.timeline-overlay-layer {
  height: 100%;
  grid-row-start: 1;
  grid-column-start: 2;
  position: relative;

  #current-time-marker {
    // --marker-color: #ff1d02;
    --marker-color: #838383;

    height: 2px;
    width: 100%;
    background-color: var(--marker-color);
    transform: translateX(-5px);
    position: absolute;

    &::before {
      content: "";
      position: absolute;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
      border-radius: 100px;
      width: 10px;
      height: 10px;
      background-color: var(--marker-color);
    }

    span {
      color: var(--marker-color);
      font-weight: 500;
      position: absolute;
      top: 50%;
      left: -48px;
      transform: translateY(-50%);
      font-size: 14px;
    }
  }
}

.hour-indicator {
  height: 0px;
  background-color: azure;
  display: flex;
  align-items: center;
  position: relative;
  // gap: 8px;

  &__label {
    font-size: 14px;
    width: 48px;
    flex-shrink: 0;
  }

  &__separator {
    width: 100%;
    height: 1px;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.day-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
  max-height: 600px;
}

.timeline-events {
  overflow: scroll;
  width: 100%;
  z-index: 1;
  height: 100%;
  grid-row-start: 1;
  grid-column-start: 2;
  display: flex;
  border-left: 1px solid rgba(0, 0, 0, 0.2);
}

.day-column {
  padding-right: 40px;
  flex-basis: 0;
  flex-grow: 1;

  &:not(:first-child) {
    border-left: 1px solid rgba(0, 0, 0, 0.2);
  }

  &:last-child {
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }

  display: grid;

  .events-layer {
    grid-column-start: 1;
    grid-row-start: 1;
    grid-template-rows: repeat(48, 36px);
    display: grid;
  }
}

.event-tile {
  grid-column-start: 1;
  grid-column-start: 1;
}
</style>
