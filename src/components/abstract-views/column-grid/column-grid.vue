<template>
  <div class="column-grid-layout" role="presentation">
    <div class="corner">GMT+5</div>

    <div class="header" data-scroll-sync="x">
      <div class="header-items">
        <div
          v-for="column in props.columns"
          :key="column.id"
          class="header-item"
          v-bind="column.header.attributes"
        >
          <slot name="header-item" v-bind="column.header.data" />
        </div>
      </div>
    </div>

    <div class="content" data-scroll-sync="x">
      <div class="content-layout">
        <div class="indicators">
          <div
            class="hour-indicator"
            v-for="hourIndicator in slotIndicators"
            :key="hourIndicator.id"
          >
            <span class="hour-indicator__label">{{ hourIndicator.label }}</span>
            <div class="hour-indicator__rule" />
          </div>
        </div>
        <div class="columns">
          <div
            v-for="(column, colIdx) in columns"
            class="column"
            v-bind="column.attributes"
          >
            <div class="slots-layer">
              <div
                v-for="timeSlot in slotsByColumn[colIdx].slots"
                :key="timeSlot.id"
                class="slot"
              >
                <slot name="time-slot" v-bind="{ timeSlot }" />
              </div>
            </div>
            <div class="events-layer">
              <div
                v-for="tile in eventTilesByColumn[colIdx].eventTiles"
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
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="TileEventData, BackgroundEventData, HeaderData"
>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import type { BackgroundEvent, CalendarEvent, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";
import { DayTiler } from "@/core/tilers";
import { ScrollSync } from "@/core/scroll-sync";
import { keys } from "@/assets/providers/keys";

const props = defineProps<{
  activeDate: Date;
  config: {
    slotDuration: SlotDuration;
    slotHeight: number;
    maxEventsPerSlot: number;
    showSlotSeparator: boolean;
    showSlotIndicators: boolean;
    showCurrentTimeMarker: boolean;
    showAllDaySlot: boolean;
    hourIndicatorLabelFormat: string;
    scrollTimeIntoView: Date;
  };
  columns: Array<{
    id: number | string;
    date: Date;
    header: { data: HeaderData; attributes?: Record<string, any> };
    events: Array<CalendarEvent<TileEventData>>;
    backgroundEvents: Array<BackgroundEvent<BackgroundEventData>>;
    attributes?: Record<string, any>;
  }>;
}>();

const t = inject<TimeUtils>(keys.TimeUtils)!;

/** Configuration */
const slotsStartsAt = t.startOfDay(t.today);
const slotsEndsAt = t.endOfDay(t.today);

const slotsSpan = t.differenceInMinutes(slotsEndsAt, slotsStartsAt);
const totalSlots = Math.ceil(slotsSpan / props.config.slotDuration);

/**************** */

const tiler = new DayTiler(
  {
    maxPerSlot: props.config.maxEventsPerSlot,
    slotDuration: props.config.slotDuration,
  },
  t
);
const eventTilesByColumn = computed(() => {
  return props.columns.map((column) => {
    return {
      id: column.id,
      eventTiles: tiler.getLayoutTiles(column.events, { date: column.date }),
    };
  });
});

const slotsByColumn = computed(() => {
  function getSlotKey(time: Date) {
    return Math.floor(t.minutesSinceEpoch(time) / props.config.slotDuration);
  }

  return props.columns.map((column) => {
    const backgroundEventsByKey: Record<
      number,
      BackgroundEvent<BackgroundEventData>[]
    > = {};
    column.backgroundEvents.forEach((event) => {
      const keyRange = {
        from: getSlotKey(event.startsAt),
        to: getSlotKey(event.endsAt),
      };
      for (let key = keyRange.from; key <= keyRange.to; key++) {
        if (!backgroundEventsByKey[key]) backgroundEventsByKey[key] = [];
        backgroundEventsByKey[key].push(event);
      }
    });

    return {
      id: column.id,
      slots: Array.from({ length: totalSlots }, (_, i) => {
        const startTime = t.addMinutes(
            column.date,
            i * props.config.slotDuration
          ),
          endTime = t.addMinutes(
            column.date,
            (i + 1) * props.config.slotDuration
          );
        return {
          id: i,
          startTime,
          endTime,
          backgroundEvents: backgroundEventsByKey[getSlotKey(startTime)],
        };
      }),
    };
  });
});

const slotIndicators = computed(() => {
  const today = t.today;
  const hours = t.eachHourOfInterval({
    start: t.startOfDay(today),
    end: t.addHours(t.endOfDay(today), 1),
  });

  const indicators = hours.map((time) => {
    return {
      id: +time,
      hour: time,
      label: t.format(time, props.config.hourIndicatorLabelFormat),
    };
  });

  return indicators;
});

const scrollSync = ref<ScrollSync>();
onMounted(() => {
  scrollSync.value = new ScrollSync("data-scroll-sync");
  scrollSync.value.mount();
});
onUnmounted(() => scrollSync.value?.destroy());
</script>

<style lang="scss" scoped>
$slot-height: 36px;
$separator-color: rgba(0, 0, 0, 0.2);
$column-min-width: 120px;
$hour-indicator-height: 1px;
$side-bar-width: 120px;

.column-grid-layout {
  max-height: 600px;
  display: grid;
  grid-template-columns: $side-bar-width 1fr;
  grid-template-rows: 80px 1fr;
}

.content {
  grid-row: 2 / -1;
  grid-column: 1 / -1;
  overflow-y: scroll;
}

.content .content-layout {
  position: relative;
  display: grid;
  grid-template-columns: $side-bar-width 1fr;
  padding: 16px 0;
}

.content-layout {
  .indicators {
    grid-column: 1 / 2;
  }
  .columns {
    grid-column: 2 / 3;
  }
}

.columns {
  display: flex;

  .column {
    flex: 1 1 0;
    min-width: $column-min-width;
    display: grid;

    &:not(:last-child) {
      border-right: 1px solid $separator-color;
    }

    .slots-layer,
    .events-layer {
      display: grid;
      grid-template-rows: repeat(48, $slot-height);
      grid-row-start: 1;
      grid-column-start: 1;
    }

    .events-layer {
      pointer-events: none;
      .event-tile {
        grid-column-start: 1;
        position: relative;
        margin: 1px 0;
        pointer-events: all;
      }
    }

    .slots-layer {
      .slot {
        &:nth-child(2n) {
          border-bottom: 0.5px solid $separator-color;
        }
        &:nth-child(2n + 1) {
          border-top: 0.5px solid $separator-color;
        }

        &:hover {
          background-color: #d5eaea79;
        }
      }
    }
  }
}

.indicators {
  border-right: 1px solid $separator-color;
  z-index: 2;
  position: sticky;
  background-color: #fff;
  left: 0;
  --slot-height: 36px;
  display: grid;
  grid-template-rows: repeat(24, calc(var(--slot-height) * 2));
}

.hour-indicator {
  display: flex;
  align-items: center;
  height: 0px;

  &__label {
    text-align: center;
    font-size: 14px;
    width: 90px;
    flex-shrink: 0;
  }

  &__rule {
    width: 100%;
    height: $hour-indicator-height;
    background-color: $separator-color;
  }
}

.header {
  grid-row: 1 / 2;
  grid-column: 2 / -1;
  border-bottom: 1px solid grey;
  background-color: #fff;
  overflow-x: scroll;

  .header-items {
    list-style: none;
    display: flex;
    align-items: center;
    height: 100%;

    .header-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1 1 0;
      min-width: 120px;
    }
  }
}
</style>
