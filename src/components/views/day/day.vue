<template>
  <div class="day-view">
    <ColumnGrid
      :activeDate="data.date"
      :columns="[dayColumn]"
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
      <template #header-item="headerItem"> Monday </template>

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
import { ColumnGrid } from "@/components/abstract-views";
import { keys } from "@/assets/providers/keys";
import { adaptConfig } from "./config";

const xCalConfig = inject(keys.XCalConfig)!;
const config = computed(() => adaptConfig(xCalConfig));

const data = inject(keys.CalendarData<EventData, BGEventData>())!;

const dayColumn = computed(() => {
  return {
    id: data.date.getDate(),
    date: data.date,
    header: {
      data: {},
      attributes: {},
    },
    events: data.events,
    backgroundEvents: data.backgroundEvents,
    attributes: {},
  };
});
</script>

<style scoped lang="scss"></style>
