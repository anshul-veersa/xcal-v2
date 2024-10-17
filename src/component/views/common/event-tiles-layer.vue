<template>
  <div class="events-layer" data-scroll-sync="all">
    <div class="columns">
      <div
        class="events-column"
        v-for="column in props.layoutEventTiles"
        :key="column.id"
        v-bind="column.elementAttrs"
      >
        <div class="events-column__tiles">
          <div
            v-for="tile in column.eventTiles"
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
</template>

<script setup lang="ts">
import type { Tile } from "@/core/tilers";
import type { BaseEvent } from "@/types";

const props = defineProps<{
  layoutEventTiles: Array<{
    id: number | string;
    eventTiles: Tile<BaseEvent>[];
    elementAttrs?: Record<
      string,
      string | number | Date | boolean | null | undefined
    >;
  }>;
}>();
</script>

<style scoped lang="scss">
$slot-height: 36px;
$spacer-right: 16px;
$separator-color: rgba(0, 0, 0, 0.2);
$hour-indicator-height: 1px;
$slot-size-minutes: 30;
$total-slots: 1440 / $slot-size-minutes;

.events-layer {
  pointer-events: none;
  grid-row: 2 / -1;
  grid-column: 2 / -1;
}

.columns {
  display: flex;
}

.events-column {
  display: grid;
  flex: 1 1 0;
  min-width: 100px;
  padding-right: $spacer-right;

  &__tiles {
    display: grid;
    grid-template-rows: repeat($total-slots, $slot-height);
    grid-column-start: 1;
    grid-row-start: 1;

    .event-tile {
      grid-column-start: 1;
      position: relative;
      margin: 1px;
      pointer-events: all;
    }
  }
}
</style>
