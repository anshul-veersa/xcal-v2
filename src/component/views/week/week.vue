<template>
  <div class="week-view">
    <ColumnGrid
      :activeDate="activeDate"
      :columns="columns"
      :config="{
        slotDuration: 30,
        hourIndicatorLabelFormat: 'HH:mm ',
        maxEventsPerSlot: 30,
        scrollTimeIntoView: new Date(),
        showAllDaySlot: false,
        showCurrentTimeMarker: false,
        showSlotIndicators: false,
        showSlotSeparator: false,
        slotHeight: 36,
      }"
    >
      <template #event-tile="slotProps">
        <slot name="event-tile" v-bind="slotProps" />
      </template>

      <template #time-slot="slotProps">
        <slot name="time-slot" v-bind="slotProps" />
      </template>
    </ColumnGrid>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject } from "vue";
import type { CalendarEvent, SlotDuration } from "@/types";
import { TimeUtils } from "@/core/time";

import ColumnGrid from "../column-grid/column-grid.vue";

const t = inject<TimeUtils>("time_utils")!;

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

const weekDays = computed(() => {
  return t.eachDayOfInterval({
    start: t.startOfWeek(activeDate),
    end: t.endOfWeek(activeDate),
  });
});

const columns = computed(() => {
  return weekDays.value.map((day) => {
    return {
      id: +day,
      date: day,
      header: { data: {}, attributes: {} },
      events: events,
      backgroundEvents: [
        {
          id: 1,
          priority: 1,
          startsAt: t.today,
          endsAt: t.endOfDay(t.today),
          data: {
            title: "Unavailable",
          },
        },
      ],
      attributes: {},
    };
  });
});
</script>

<style scoped lang="scss"></style>
