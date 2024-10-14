<template>
  <div id="app">
    <header>
      <h2>XCal Preview</h2>
    </header>
    <XCal :events="mockEvents" view="day">
      <template #event-tile="{ event, tile }">
        <div class="event-tile-content">
          <p>
            {{ event.id }} ({{ format(event.startsAt, "HH:mm") }} —
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

const mockEvents = createDayData(new Date(), 20);

// console.log(
//   mockEvents.map((e) => {
//     return {
//       start: e.startsAt.getHours() + e.startsAt.getMinutes() / 60,
//       end: e.endsAt.getHours() + e.endsAt.getMinutes() / 60,
//     };
//   })
// );
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  justify-content: center;
  padding: 2px 8px;
  line-height: 1;
  border-radius: 4px;
  font-size: 18px;
  // height: 28px;
}

// .event-tile-content[data-continuous-end] {
//   border-top-right-radius: 0;
//   border-bottom-right-radius: 0;
// }

// .event-tile-content[data-continuous-start] {
//   border-top-left-radius: 0;
//   border-bottom-left-radius: 0;
// }
</style>
