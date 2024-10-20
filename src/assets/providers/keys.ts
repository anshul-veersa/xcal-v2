import type { TimeUtils as TimeUtilities } from "@/core/time";
import type { XCalConfig } from "@/types";
import type { CalendarData } from "@/types/data";
import type { InjectionKey } from "vue";

const TimeUtils = Symbol("Time Utilities") as InjectionKey<TimeUtilities>;
const XCalConfig = Symbol("Configuration for XCal") as InjectionKey<XCalConfig>;

const CalendarDataKeySymbol = Symbol("Calendar Data");
const CalendarData = <P, Q>() =>
  CalendarDataKeySymbol as InjectionKey<CalendarData<P, Q>>;

export const keys = { TimeUtils, XCalConfig, CalendarData };
