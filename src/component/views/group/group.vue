<template>
  <div class="group-view">
    <div class="group-layout">
      <SlotIndicatorsLayer />

      <SlotsLayer
        :columns="
          groups.map((group) => ({
            date: props.date,
            id: group.id,
          }))
        "
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
import { groupBy } from "@/core/utils";

export type Group = { id: string; events: CalendarEvent<T>[] };

export type GroupViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  maxEventsPerSlot: number;
  slotDuration: SlotDuration;
  groupSelector: (event: CalendarEvent<T>) => string;
  groupSorter: (groups: Group[]) => Group[];
};

const props = defineProps<GroupViewProps>();

const t = inject<TimeUtils>("time_utils")!;

const tiler = new DayTiler(
  {
    maxPerSlot: props.maxEventsPerSlot,
    slotDuration: props.slotDuration,
  },
  t
);

const groups = computed<Array<Group>>(() => {
  if (!props.groupSelector)
    throw new Error("Specify a group selector when using group view.");
  if (!props.groupSorter)
    throw new Error("Specify a group sorter when using group view.");

  const eventsByGroup = groupBy(props.events, props.groupSelector);

  const sortedGroups = props.groupSorter(
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
      eventTiles: tiler.getLayoutTiles(group.events, { date: props.date }),
    };
  });

  return layoutEvents;
});
</script>

<style scoped lang="scss">
.group-layout {
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
