import type { WeekViewConfig } from "@/components/views/week/config";
import type { BackgroundEvent, CalendarEvent } from "./event";
import type { Views } from "@/components/views";

export type SlotDuration = 10 | 15 | 30 | 60;

export type View = keyof typeof Views;

export type CommonConfig = {
  slotDuration: SlotDuration;
  slotHeight: number;
  maxEventsPerSlot: number;
  showSlotSeparator: boolean;
  showSlotIndicators: boolean;
  showCurrentTimeMarker: boolean;
  showAllDaySlot: boolean;
  hourIndicatorLabelFormat: string;
  scrollTimeIntoView: Date;
};

export type LocaleOptions = {
  weekStartsOn: "monday" | "sunday";
};

export interface XCalConfig {
  view: View;
  config: Partial<CommonConfig>;
  locale: Partial<LocaleOptions>;
  views: {
    day: Partial<WeekViewConfig>;
    week: Partial<WeekViewConfig>;
    month: Partial<WeekViewConfig>;
    group: Partial<WeekViewConfig>;
  };
}
