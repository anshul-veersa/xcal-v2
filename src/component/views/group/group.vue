<template>
  <div class="group-view">
    <div class="group-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer
        :columns="
          groups.map((group) => ({
            date: activeDate,
            id: group.id,
          }))
        "
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
import { groupBy } from "@/core/utils";

export type Group = { id: string; events: CalendarEvent<T>[] };

const { events, activeDate, config } = inject<{
  events: Array<CalendarEvent<T>>;
  activeDate: Date;
  config: {
    slotDuration: SlotDuration;
    maxEventsPerSlot: number;
    showCurrentTimeMarker: boolean;
    showAllDaySlot: boolean;
    groupSelector: (event: CalendarEvent<T>) => string;
    groupSorter: (groups: Group[]) => Group[];
  };
}>("config")!;

const t = inject<TimeUtils>("time_utils")!;

const tiler = new DayTiler(
  {
    maxPerSlot: config.maxEventsPerSlot,
    slotDuration: config.slotDuration,
  },
  t
);

const groups = computed<Array<Group>>(() => {
  if (!config.groupSelector)
    throw new Error("Specify a group selector when using group view.");
  if (!config.groupSorter)
    throw new Error("Specify a group sorter when using group view.");

  const eventsByGroup = groupBy(events, config.groupSelector);

  const sortedGroups = config.groupSorter(
    Object.entries(eventsByGroup).map(([groupId, events]) => ({
      id: groupId,
      events: events!,
    }))
  );

  return sortedGroups;
});

const layoutEventTiles = computed(() => {
  const layoutEvents = groups.value.map((group) => {
    return {
      id: group.id,
      eventTiles: tiler.getLayoutTiles(group.events, { date: activeDate }),
    };
  });

  return layoutEvents;
});
</script>

<style scoped lang="scss">
.group-layout {
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
