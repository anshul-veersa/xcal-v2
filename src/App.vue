<template>
  <div id="app">
    <header>
      <h2>XCal Preview</h2>
    </header>
    <XCal
      :events="mockEvents"
      view="week"
      :config="{ slotDuration: 30, maxEventsPerSlot: 6 }"
    >
      <template #time-slot="{ timeSlot }">
        <div class="bg-event" v-if="timeSlot.backgroundEvents">
          {{ timeSlot.backgroundEvents[0].data.title }}
        </div>
      </template>

      <template #event-tile="{ event, tile }">
        <div
          class="event-tile-content"
          :data-continuous-start="tile.continuous.start"
          :data-continuous-end="tile.continuous.end"
        >
          <p>
            ({{ format(event.startsAt, "HH:mm") }} —
            {{ format(event.endsAt, "HH:mm") }})
          </p>
        </div>
      </template>
    </XCal>
  </div>
</template>

<script setup lang="ts">
import XCal from "@/component/x-cal.vue";
import { createMonthData, createDayData } from "@/tests/data";
import { format } from "date-fns";

const mockEvents = createMonthData(new Date(), 100);
</script>

<style scoped lang="scss">
#app {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  gap: 16px;
  width: 100%;
  padding: 24px;
}

.event-tile-content {
  display: flex;
  align-items: center;
  background-color: rgb(171, 183, 196);
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 2px 8px;
  line-height: 1;
  border-radius: 4px;
  font-size: 14px;
}

.event-tile-content[data-continuous-end] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.event-tile-content[data-continuous-start] {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.bg-event {
  background-color: #f45a121e;
  pointer-events: none;
  height: 100%;
  display: flex;
  justify-content: center;
  color: #fe011f46;
  font-weight: 500;
  align-items: center;
}
</style>
