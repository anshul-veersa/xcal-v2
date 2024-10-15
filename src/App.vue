<template>
  <div id="app">
    <header>
      <h2>XCal Preview</h2>
    </header>
    <XCal :events="mockEvents" view="day">
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

const mockEvents = createMonthData(new Date(), 1000);
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
  // white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-content: center;
  padding: 2px 8px;
  line-height: 1;
  border-radius: 6px;
  font-size: 14px;
  // height: 28px;
}

.event-tile-content[data-continuous-end] {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.event-tile-content[data-continuous-start] {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
