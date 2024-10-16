import type { CalendarEvent } from "./event";

export type SlotDuration = 10 | 15 | 30 | 60;

export type View = "day" | "week" | "month" | "group";

// interface XCalConfig<EventData> {
//   events: CalendarEvent<EventData>;
//   activeView: View;
//   activeDate: Date;
//   config: {
//     slotDuration: SlotDuration;
//     maxEventsPerSlot: number;
//     showCurrentTimeMarker: boolean;
//   };
//   locale: {
//     weekStartsOn: "monday" | "sunday";
//   };
//   view;
// }
