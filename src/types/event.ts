export type EventID = number | string | bigint;

/** Must haves for any kind of event */
export type BaseEvent = {
  id: EventID;
  priority?: number;
  startsAt: Date;
  endsAt: Date;
};

/** Primary kind of events that are shown as tiles */
export type CalendarEvent<EventData> = {
  type: "tile";
  recurrencePattern?: string;
  data: EventData;
  config?: {
    isDraggable: boolean;
    isResizable: boolean;
  };
} & BaseEvent;

/** Secondary kind of events that are shown in the background */
export type BackgroundEvent<EventData> = {
  type: "background";
  data: EventData;
  recurrencePattern?: string;
  priority: number;
} & BaseEvent;

/** Base tile, varies across views */
export type BaseEventTile<TileEvent extends BaseEvent> = {
  id: number;
  continuous: { start: boolean; end: boolean };
  event: TileEvent;
};
