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
import { provide, computed, defineAsyncComponent } from "vue";
import { TimeUtils } from "@/core/time";

import type { CalendarEvent, SlotDuration } from "@/types";
import type {
  MonthViewProps,
  DayViewProps,
  WeekViewProps,
  GroupViewProps,
  Group,
} from "@/component/views";

type Props<T> = {
  /** Array of events to show on the calendar. */
  events?: Array<CalendarEvent<T>>;
  /** Current view to show. Available Views:
   * - Month
   * - Week
   * - Day
   */
  view: "month" | "week" | "day" | "group";
  /** Current date to show. */
  date?: Date;
  /** Common configuration for the calendar. */
  config?: {
    slotDuration?: SlotDuration;
    maxEventsPerSlot?: number;
    showCurrentTimeMarker?: boolean;
  };

  viewConfig?: {
    day?: {
      slotDuration?: SlotDuration;
      maxEventsPerSlot?: number;
    };
    week?: {
      slotDuration?: SlotDuration;
      maxEventsPerSlot?: number;
    };
    month?: {
      maxEventsPerSlot?: number;
    };
    group?: {
      // view: 'day' | 'week' | 'month';
      slotDuration?: SlotDuration;
      maxEventsPerSlot?: number;
      groupSelector?: (event: CalendarEvent<T>) => string;
      groupSorter?: (groups: Group[]) => Group[];
    };
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
    maxEventsPerSlot: 30,
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
        maxTilesPerDay: props.config.maxEventsPerSlot!,
        showSiblingMonths: true,
      },
    } satisfies MonthViewProps,
  },
  week: {
    name: "week",
    component: defineAsyncComponent(
      () => import("@/component/views/week/week.vue")
    ),
    props: {
      events: props.events,
      date: props.date,
      maxEventsPerSlot: props.config.maxEventsPerSlot!,
      slotDuration: props.config.slotDuration!,
    } satisfies WeekViewProps,
  },
  day: {
    name: "day",
    component: defineAsyncComponent(
      () => import("@/component/views/day/day.vue")
    ),
    props: {
      events: props.events,
      date: props.date,
      maxEventsPerSlot: props.config.maxEventsPerSlot!,
      slotDuration: props.config.slotDuration!,
    } satisfies DayViewProps,
  },
  group: {
    name: "group",
    component: defineAsyncComponent(
      () => import("@/component/views/group/group.vue")
    ),
    props: {
      events: props.events,
      date: props.date,
      maxEventsPerSlot: props.config.maxEventsPerSlot!,
      slotDuration: props.config.slotDuration!,
      groupSelector: props.viewConfig?.group?.groupSelector!,
      groupSorter: props.viewConfig?.group?.groupSorter!,
    } satisfies GroupViewProps,
  },
} as const;

const activeView = computed(() => Views[props.view]);

const emit = defineEmits<{
  eventUpdate: [];
}>();

if (props.events.length > 1000) {
  console.warn(
    `A large number of passed events (received ${props.events.length} events) can degrade performance of XCal. Consider limiting the number of events.`
  );
}

provide(
  "time_utils",
  new TimeUtils({
    options: {
      weekStartsOn: props.locale.weekStartsOn === "sunday" ? 0 : 1,
    },
  })
);
</script>

<style lang="scss">
@import "@/styles/global.scss";
</style>
