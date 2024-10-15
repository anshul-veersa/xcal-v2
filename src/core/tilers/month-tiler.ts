import type { TimeUtils } from "@/core/time";
import type { EventTile, EventType } from "@/types";

type Tile<Event extends EventType> = {
  geometry: {
    xStart: number;
    xEnd: number;
  };
} & EventTile<Event>;

type TilerConfig = {
  /** Limit the maximum number of events that can appear in a single row */
  maxPerSlot: number;

  range: {
    start: Date;
    end: Date;
  };
};

export class MonthTiler<Event extends EventType> {
  constructor(
    private readonly events: Event[],
    private readonly config: TilerConfig,
    private readonly time: TimeUtils
  ) {}

  private getEventPriority(event: Event) {
    return this.time.differenceInCalendarDays(event.startsAt, event.endsAt);
  }

  getLayoutTiles() {
    const t = this.time;
    const calendarStartDate = this.config.range.start;
    const calendarEndDate = this.config.range.end;

    /** Events filtered for visible range, sorted by their row placement priority. */
    const eventsInRange = this.events
      .filter((e) =>
        t.isBetween(e.startsAt, {
          start: calendarStartDate,
          end: calendarEndDate,
        })
      )
      .sort((e1, e2) => this.getEventPriority(e1) - this.getEventPriority(e2));

    /** A map of events keyed by their start date. */
    const eventsByDate: Record<string, Event[] | undefined> = {};
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
    const eventSeries: Record<string, { tiles: Tile<Event>[] }> =
      Object.fromEntries(
        t
          .eachWeekOfInterval({
            start: calendarStartDate,
            end: calendarEndDate,
          })
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
      if (dayEventIndex >= this.config.maxPerSlot) {
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

        const tile: Tile<Event> = {
          id: 0,
          event: currentEvent,
          continuous: {
            start: isContinuingFromLastWeek,
            end: willContinueAfterCurrentWeek,
          },
          geometry: {
            xStart:
              t.getWeekDay(
                isContinuingFromLastWeek
                  ? t.startOfWeek(currentDay)
                  : currentDay
              ) + gridOffset,
            xEnd:
              t.getWeekDay(
                willContinueAfterCurrentWeek
                  ? t.endOfWeek(currentDay)
                  : currentEvent.endsAt
              ) +
              1 +
              gridOffset,
          },
        };

        eventSeries[currentWeek].tiles.push(tile);

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
  }
}
