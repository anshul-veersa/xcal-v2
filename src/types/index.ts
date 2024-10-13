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

export type EventTile = {
  slot: {
    start: number;
    end: number;
  };
  continuous: {
    start: boolean;
    end: boolean;
  };
};

export type EventTileSlotProps<T> = {
  event: CalendarEvent<T>;
  tile: EventTile;
};

export type SlotDuration = 1 | 5 | 10 | 15 | 30 | 60;
