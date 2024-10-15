<template>
  <div class="day-layout">
    <div class="day-slots">
      <div v-for="hourIndicator in slotIndicators" :key="hourIndicator.id">
        <div class="hour-indicator">
          <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
          <div class="hour-indicator__rule" />
        </div>

        <div
          v-for="slot in hourIndicator.slots"
          :key="slot.id"
          class="day-slot"
        ></div>
      </div>
    </div>

    <div class="events-layer">
      <div class="day-column">
        <div class="day-column__tile-events">
          <div
            v-for="tile in layoutEventTiles"
            :key="tile.id"
            class="event-tile"
            :style="{
              gridRowStart: tile.geometry.yStart + 1,
              gridRowEnd: tile.geometry.yEnd + 1,
              width: `calc(${tile.geometry.width * 100 + '%'} - 2px)`,
              left: `calc(${tile.geometry.xOffset * 100 + '%'} + 1px)`,
            }"
          >
            <slot name="event-tile" v-bind="{ event: tile.event, tile }" />
          </div>
        </div>
      </div>
    </div>

    <div class="overlay-layer">
      <TimeMarker />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject } from "vue";
import type { CalendarEvent, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";
import { DayTiler } from "@/core/tilers";
import TimeMarker from "@/component/shared/time-marker.vue";

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
      id: +time,
      hour: time,
      label: t.format(time, "HH:mm"),
      slots: Array(60 / props.slotDuration)
        .fill(null)
        .map((_, i) => ({
          id: i,
          startTime: t.addMinutes(time, i * props.slotDuration),
          endTime: t.addMinutes(time, (i + 1) * props.slotDuration),
        })),
    };
  });

  indicators.at(-1)!.slots = [];

  return indicators;
});

const tiler = new DayTiler(
  {
    maxPerSlot: 30,
    slotDuration: props.slotDuration,
  },
  t
);

const layoutEventTiles = computed(() => {
  const layoutTiles = tiler.getLayoutTiles(props.events, { date: props.date });
  return layoutTiles;
});
</script>

<style scoped lang="scss">
$slot-size: 36px;
$spacer-right: 40px;
$separator-color: rgba(0, 0, 0, 0.2);
$hour-indicator-height: 1px;
$slot-size-minutes: 30;
$total-slots: 1440 / $slot-size-minutes;

.day-layout {
  display: grid;
  grid-template-columns: 60px 1fr;
}

.day-slots {
  display: grid;
  grid-row-start: 1;
  grid-column: 1 / -1;
}

.day-slot {
  height: $slot-size;
}

.hour-indicator {
  display: flex;
  align-items: center;
  height: 0px;

  &__label {
    font-size: 14px;
    width: 48px;
    flex-shrink: 0;
  }

  &__rule {
    width: 100%;
    height: $hour-indicator-height;
    background-color: $separator-color;
  }
}

.overlay-layer,
.events-layer {
  grid-row-start: 1;
  grid-column-start: 2;
}

.events-layer {
  display: flex;
  border-left: 1px solid $separator-color;
}

.day-column {
  display: grid;
  flex-basis: 0;
  flex-grow: 1;
  padding-right: $spacer-right;

  &:not(:first-child) {
    border-left: 1px solid $separator-color;
  }
  &:last-child {
    border-right: 1px solid $separator-color;
  }

  &__tile-events {
    display: grid;
    grid-template-rows: repeat($total-slots, $slot-size);
    grid-column-start: 1;
    grid-row-start: 1;

    .event-tile {
      grid-column-start: 1;
      position: relative;
      margin: 1px;
    }
  }
}

.overlay-layer {
  z-index: 2;
  position: relative;
  pointer-events: none;
}
</style>
