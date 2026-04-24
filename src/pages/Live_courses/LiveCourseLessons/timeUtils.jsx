// LiveCourseLessons/timeUtils.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatSessionTimeRaw = (dateString) => {
  if (!dateString) return null;
  try {
    let sessionTime;
    if (!dateString.includes("+") && !dateString.includes("Z")) {
      sessionTime = dayjs.utc(dateString.replace(" ", "T"));
    } else {
      sessionTime = dayjs(dateString);
    }
    return {
      localFull: sessionTime.local().format("dddd • MMM DD, YYYY • hh:mm A"),
      localTime: sessionTime.local().format("hh:mm A"),
      localDate: sessionTime.local().format("dddd • MMM DD, YYYY"),
      ukraineTime: sessionTime.utcOffset(3).format("hh:mm A"),
      moment: sessionTime
    };
  } catch {
    return null;
  }
};

export const formatSessionTime = (dateString, t) => {
  const raw = formatSessionTimeRaw(dateString);
  if (!raw) return dateString;

  return (
    <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <span className="font-bold text-primary">{raw.localFull}</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
        {t("liveCourses.localTime", "Your Local Time")}
      </span>
      <span className="text-[10px] text-text-muted opacity-70">
        ({raw.ukraineTime} Ukraine)
      </span>
    </span>
  );
};

export const isLinkActive = (startTime, serverTimeOffset, currentTimeMs) => {
  if (!startTime) return false;
  try {
    let startGlobal = startTime;
    if (!startTime.includes("+") && !startTime.includes("Z")) {
      startGlobal = startTime.replace(" ", "T") + "Z";
    }

    const start = dayjs(startGlobal).valueOf();
    if (isNaN(start)) return false;
    
    const fiveMinutes = 5 * 60 * 1000;
    const ukraineTimeNow = currentTimeMs + serverTimeOffset;
    
    return ukraineTimeNow >= (start - fiveMinutes);
  } catch (e) {
    console.error("Error calculating link active time:", e);
    return false;
  }
};

export const getTimeUntilStart = (startTime, serverTimeOffset, currentTimeMs) => {
  if (!startTime) return null;
  try {
    let startGlobal = startTime;
    if (!startTime.includes("+") && !startTime.includes("Z")) {
      startGlobal = startTime.replace(" ", "T") + "Z";
    }
    const start = dayjs(startGlobal).valueOf();
    const now = currentTimeMs + serverTimeOffset;
    const diff = start - now;
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 24) return null;
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  } catch {
    return null;
  }
};