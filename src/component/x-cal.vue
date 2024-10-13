<template>
  <div class="x-cal">
    <keep-alive :max="2">
      <component :is="activeView.component" v-bind="activeView.props">
        <template #event-tile="slotProps"
          ><slot name="event-tile" v-bind="slotProps" />
        </template>
      </component>
    </keep-alive>
  </div>
</template>

<script setup lang="ts" generic="T">
import "@/styles/global.scss";

import { provide, computed, defineAsyncComponent } from "vue";
import { TimeUtils } from "@/core/time";

import type { CalendarEvent } from "@/types";
import type { MonthViewProps, DayViewProps } from "@/component/views";

type Props<T> = {
  /** Array of events to show on the calendar. */
  events?: Array<CalendarEvent<T>>;
  /** Current view to show. Available Views:
   * - Month
   * - Week
   * - Day
   */
  view?: "month" | "day";
  /** Current date to show. */
  date?: Date;
  /** Additional configuration for the calendar. */
  config?: {
    slotDuration: 15 | 30 | 60;
  };

  /** Set locale */
  locale?: {
    weekStartsOn: "monday" | "sunday";
  };
};

const props = withDefaults(defineProps<Props<T>>(), {
  view: "month",
  events: () => [],
  date: () => new Date(),
  config: () => ({
    slotDuration: 30,
  }),
  locale: () => ({
    weekStartsOn: "monday",
  }),
});

const Views = {
  month: {
    name: "month",
    component: defineAsyncComponent(
      () => import("@/component/views/month/month.vue")
    ),
    props: {
      events: props.events,
      date: props.date,
      config: {
        maxTilesPerDay: 10,
        showSiblingMonths: true,
      },
    } satisfies MonthViewProps,
  },
  day: {
    name: "day",
    component: defineAsyncComponent(
      () => import("@/component/views/day/day.vue")
    ),
    props: {
      events: props.events,
      date: props.date,
      slotDuration: props.config.slotDuration,
    } satisfies DayViewProps,
  },
} as const;

const activeView = computed(() => Views[props.view]);

const emit = defineEmits<{
  eventUpdate: [];
}>();

provide(
  "time_utils",
  new TimeUtils({
    options: {
      weekStartsOn: props.locale.weekStartsOn === "sunday" ? 0 : 1,
    },
  })
);
</script>
