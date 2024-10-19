export type EventID = number | string | bigint;

export type BaseEvent = {
  id: EventID;
  priority?: number;
  startsAt: Date;
  endsAt: Date;
};

export type CalendarEvent<EventData> = {
  recurrencePattern?: string;
  data: EventData;
  config?: {
    isDraggable: boolean;
    isResizable: boolean;
  };
} & BaseEvent;

export type BackgroundEvent<EventData> = {
  data: EventData;
  recurrencePattern?: string;
  priority: number;
} & BaseEvent;

export type BaseEventTile<T extends BaseEvent> = {
  id: number;
  continuous: { start: boolean; end: boolean };
  event: T;
};
