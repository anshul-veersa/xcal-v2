<template>
  <div class="week-view">
    <ColumnGrid
      :activeDate="data.date"
      :columns="columns"
      :config="{
        slotDuration: config.slotDuration,
        hourIndicatorLabelFormat: config.hourIndicatorLabelFormat,
        maxEventsPerSlot: config.maxEventsPerSlot,
        scrollTimeIntoView: config.scrollTimeIntoView,
        showAllDaySlot: config.showAllDaySlot,
        showCurrentTimeMarker: config.showCurrentTimeMarker,
        showSlotIndicators: config.showSlotIndicators,
        showSlotSeparator: config.showSlotSeparator,
        slotHeight: config.slotHeight,
      }"
    >
      <template #header-item="headerItem">
        {{ headerItem.label }}
      </template>

      <template #event-tile="slotProps">
        <slot name="event-tile" v-bind="slotProps" />
      </template>

      <template #time-slot="slotProps">
        <slot name="time-slot" v-bind="slotProps" />
      </template>
    </ColumnGrid>
  </div>
</template>

<script setup lang="ts" generic="EventData, BGEventData">
import { computed, inject } from "vue";
import { TimeUtils } from "@/core/time";

import { ColumnGrid } from "@/components/abstract-views";
import { keys } from "@/assets/providers/keys";
import { adaptConfig } from "./config";

const t = inject<TimeUtils>(keys.TimeUtils)!;

const xCalConfig = inject(keys.XCalConfig)!;
const config = computed(() => adaptConfig(xCalConfig));

const data = inject(keys.CalendarData<EventData, BGEventData>())!;

const weekDays = computed(() => {
  return t.eachDayOfInterval({
    start: t.startOfWeek(data.date),
    end: t.endOfWeek(data.date),
  });
});

const columns = computed(() => {
  return weekDays.value.map((day) => {
    return {
      id: +day,
      date: day,
      header: {
        data: { label: t.format(day, "EEE") },
        attributes: { "data-week-day": day, "data-date": day },
      },
      events: data.events,
      backgroundEvents: data.backgroundEvents,
      attributes: {},
    };
  });
});
</script>

<style scoped lang="scss"></style>
