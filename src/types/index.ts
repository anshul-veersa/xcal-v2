export type CalendarEvent<T> = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  recurrencePattern?: string;
  data: T;
  config?: {
    isDraggable: boolean;
    isResizable: boolean;
  };
};

export type SlotDuration = 1 | 5 | 10 | 15 | 30 | 60;

export type EventType = {
  id: number | string;
  priority?: number;
  startsAt: Date;
  endsAt: Date;
};

export type EventTile<T extends EventType> = {
  id: number | string;
  continuous: { start: boolean; end: boolean };
  event: T;
};
