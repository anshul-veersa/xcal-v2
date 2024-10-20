import type { TimeUtils as TimeUtilities } from "@/core/time";
import type { XCalConfig } from "@/types";
import type { CalendarData } from "@/types/data";
import type { ComputedRef, InjectionKey } from "vue";


const TimeUtils = Symbol("Time Utilities") as InjectionKey<TimeUtilities>;
const XCalConfigKeySymbol = Symbol("Configuration for XCal");
const XCalConfig = <P, Q>() => XCalConfigKeySymbol as InjectionKey<ComputedRef<XCalConfig<P, Q>>>;

const CalendarDataKeySymbol = Symbol("Calendar Data");
const CalendarData = <P, Q>() =>
  CalendarDataKeySymbol as InjectionKey<ComputedRef<CalendarData<P, Q>>>;

export const keys = { TimeUtils, XCalConfig, CalendarData };
