<template>
  <div class="view__month">
    <div class="month-layout">
      <header class="month-header">
        <div
          v-for="weekDay in weekDays"
          :key="weekDay.name"
          :data-week-day="weekDay.name"
        >
          {{ weekDay.label }}
        </div>
      </header>

      <div
        v-for="week in monthWeeks"
        :key="week.id"
        class="month-week"
        :data-week="week.id"
      >
        <div class="week-layout__cells">
          <div
            v-for="day in week.days"
            :key="day.id"
            :class="[{ today: day.isToday }, 'day-cell']"
            :data-date="day.id"
          >
            <div class="day-cell__info">
              <span class="date-label">{{ day.label }}</span>
            </div>

            <div class="day-cell__footer"></div>
          </div>
        </div>

        <div class="week-layout__overlay">
          <div
            v-for="{ event, tile } in layoutEventTiles[week.id].tiles"
            :key="event.id"
            class="overlay__tile"
            :style="{
              gridColumnStart: tile.slot.start,
              gridColumnEnd: tile.slot.end,
            }"
          >
            <slot name="event-tile" v-bind="{ event, tile }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, inject } from "vue";
import { TimeUtils } from "@/core/time";
import type { CalendarEvent, EventTileSlotProps } from "@/types";

export type MonthViewProps = {
  events: Array<CalendarEvent<T>>;
  date: Date;
  config: {
    showSiblingMonths: boolean;
    maxTilesPerDay: number;
  };
};
const props = withDefaults(defineProps<MonthViewProps>(), {
  config: () => ({ maxTilesPerDay: 10, showSiblingMonths: true }),
});

/** Locale aware time utilities */
const t = inject<TimeUtils>("time_utils")!;

const weekDays = computed(() => {
  return t.daysOfWeek().map((d) => ({ ...d, label: d.label.toUpperCase() }));
});

/**
 * Dates of the month arranged week wise with specified locale.
 */
type MonthWeeks = Array<{
  id: number;
  days: Array<{
    id: string;
    date: Date;
    label: string;
    isToday: boolean;
  }>;
}>;
const monthWeeks = computed<MonthWeeks>(() => {
  const calendarStart = t.startOfWeek(t.startOfMonth(props.date));
  const calendarEnd = t.endOfWeek(t.endOfMonth(props.date));

  const datesOnCalendar = t.eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weeklyDates: Record<number, MonthWeeks[number]> = {};
  for (let d = 0; d < datesOnCalendar.length; d += 7) {
    const week = t.getWeek(datesOnCalendar[d]);
    const days = datesOnCalendar.slice(d, d + 7).map((d) => ({
      id: t.format(d, "yyyy-MM-dd"),
      date: d,
      label: t.format(d, "d"),
      isToday: t.isSameDay(d, t.today),
    }));
    weeklyDates[week] = {
      id: week,
      days,
    };
  }
  return Object.values(weeklyDates);
});

/**
 * Flat array of each date shown on the calendar.
 */
const calendarDates = computed(() => {
  return Object.entries(monthWeeks.value).flatMap(([_, d]) => d.days);
});

/**
 * A map of events by date,
 * access by date formatted as yyyy-MM-dd
 */
const eventsByDate = computed(() => {
  const calendarStartDate = calendarDates.value.at(0)!.date,
    calendarEndDate = calendarDates.value.at(-1)!.date;

  const keyFormat = "yyyy-MM-dd";

  const records: Record<string, CalendarEvent<T>[] | undefined> =
    Object.fromEntries(
      t
        .eachDayOfInterval({
          start: calendarStartDate,
          end: calendarEndDate,
        })
        .map((d) => [t.format(d, keyFormat), []])
    );
  props.events.forEach((e) => {
    const dates = t.eachDayOfInterval({ start: e.startsAt, end: e.endsAt });
    dates.forEach((d) => {
      const key = t.format(d, keyFormat);
      if (records[key]) records[key]!.push(e);
    });
  });

  return records;
});

type LayoutEventTiles = Record<
  number,
  {
    tiles: Array<EventTileSlotProps<T>>;
  }
>;
/**
 * Record of event tiles in series for each week of the month.
 * Used with CSS grid to place on the week layout.
 */
const layoutEventTiles = computed<LayoutEventTiles>(() => {
  const calendarStartDate = calendarDates.value.at(0)!.date;
  const calendarEndDate = calendarDates.value.at(-1)!.date;

  const getEventPriority = (e: CalendarEvent<unknown>) =>
    t.differenceInCalendarDays(e.startsAt, e.endsAt);

  /** Events filtered for visible range, sorted by their row placement priority. */
  const eventsInRange = props.events
    .filter((e) =>
      t.isBetween(e.startsAt, {
        start: calendarStartDate,
        end: calendarEndDate,
      })
    )
    .sort((e1, e2) => getEventPriority(e1) - getEventPriority(e2));

  /** A map of events keyed by their start date. */
  const eventsByDate: Record<string, CalendarEvent<T>[] | undefined> = {};
  eventsInRange.forEach((e) => {
    const date = t.format(e.startsAt, "yyyy-MM-dd");
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date]!.push(e);
  });

  const eventsTouchedByDate = {
    records: {} as Record<string, number | undefined>,
    get(date: string) {
      return this.records[date] ?? 0;
    },
    inc(date: string) {
      if (!this.records[date]) this.records[date] = 0;
      this.records[date]!++;
    },
  };

  /** Layout of events. */
  const eventSeries: LayoutEventTiles = Object.fromEntries(
    t
      .eachWeekOfInterval({ start: calendarStartDate, end: calendarEndDate })
      .map((d) => [t.getWeek(d), { tiles: [] }])
  );

  let eventsTouched = 0;
  let currentDay = calendarStartDate;

  // Add this offset to properly calculate grid column span
  const gridOffset = 1;

  while (eventsTouched < eventsInRange.length) {
    // Move to next line, reiterate from first day
    if (t.isAfter(currentDay, calendarEndDate)) {
      currentDay = calendarStartDate;
      continue;
    }

    const dateStr = t.format(currentDay, "yyyy-MM-dd");

    const dayEventIndex = eventsTouchedByDate.get(dateStr);
    if (dayEventIndex >= props.config.maxTilesPerDay) {
      eventsTouched++;
      continue;
    }

    // Get the highest priority event for this day
    const currentEvent = eventsByDate[dateStr]?.[dayEventIndex];
    // No event was found for this day, move to next day
    if (!currentEvent) {
      currentDay = t.addDays(currentDay, 1);
      continue;
    }

    eventsTouchedByDate.inc(dateStr);

    let isContinuingFromLastWeek = false;
    while (t.isBefore(currentDay, calendarEndDate)) {
      // This event will continue after this week's end
      const willContinueAfterCurrentWeek = t.isAfter(
        currentEvent.endsAt,
        t.endOfWeek(currentDay)
      );

      const currentWeek = t.getWeek(currentDay);

      const calendarEvent = {
        event: currentEvent,
        tile: {
          slot: {
            start:
              t.getWeekDay(
                isContinuingFromLastWeek
                  ? t.startOfWeek(currentDay)
                  : currentDay
              ) + gridOffset,
            end:
              t.getWeekDay(
                willContinueAfterCurrentWeek
                  ? t.endOfWeek(currentDay)
                  : currentEvent.endsAt
              ) +
              1 +
              gridOffset,
          },
          continuous: {
            start: isContinuingFromLastWeek,
            end: willContinueAfterCurrentWeek,
          },
        },
      };

      eventSeries[currentWeek].tiles.push(calendarEvent);

      if (!willContinueAfterCurrentWeek) {
        currentDay = t.addDays(currentEvent.endsAt, 1);
        break;
      } else {
        currentDay = t.startOfWeek(t.addWeeks(currentDay, 1));
        isContinuingFromLastWeek = true;
      }
    }

    eventsTouched++;
  }

  return eventSeries;
});
</script>

<style scoped lang="scss">
.month-layout {
  display: flex;
  flex-flow: column nowrap;

  border: 0.5px solid rgb(216, 216, 216);
}

.month-week {
  display: grid;
  grid-template-columns: 1fr;

  &__cells,
  &__overlay {
    display: grid;
    grid-template-columns: repeat(7, minmax(calc(100% / 7), 1fr));
  }

  .week-layout__cells {
    display: grid;
    grid-template-columns: repeat(7, minmax(calc(100% / 7), 1fr));
    grid-row-start: 1;
    grid-column-start: 1;

    min-height: 160px;
    width: 100%;
  }

  .week-layout__overlay {
    display: grid;
    grid-template-columns: repeat(7, minmax(calc(100% / 7), 1fr));
    grid-row-start: 1;
    grid-column-start: 1;

    width: 100%;
    top: 0;
    left: 0;
    grid-auto-rows: min-content;
    z-index: 1;

    pointer-events: none;

    margin: 32px 0;
    padding-bottom: 4px;

    overflow: hidden;
  }
}

.week-layout__cells {
  .day-cell {
    width: 100%;
    height: 100%;

    border: 0.75px solid #e5e5e5;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

.day-cell {
  &__info {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 8px 12px;
    height: 32px;

    .date-label {
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
    }
  }

  &__footer {
    padding: 8px;
    font-size: 12px;
    display: flex;
    justify-content: flex-end;

    span {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 8px;
      border-radius: 40px;

      svg {
        width: 12px;
      }

      &:hover {
        background-color: rgb(228, 234, 234);
      }
    }
  }

  &.today {
    // outline: 2px solid #0015ff21;
    outline-offset: -2.5px;

    .date-label {
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      border-radius: 100px;
      color: #fff;
      background-color: #015cbb;
    }
  }
}

.overlay__tile {
  pointer-events: all;
  margin: 2px 4px;
}

.month-header {
  display: flex;
  width: 100%;
  background-color: #f4f4f4;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.67);

  div {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 24px;
  }
}
</style>
