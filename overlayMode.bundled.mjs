// src/renderer/src/lib/date.ts
function toDateKey(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// src/renderer/src/lib/overlayMode.ts
var NIGHT_START_MINUTES = 22 * 60 + 47;
var NIGHT_END_MINUTES = 5 * 60 + 59;
function getOverlayMode(now) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isNight = nowMinutes >= NIGHT_START_MINUTES || nowMinutes <= NIGHT_END_MINUTES;
  if (!isNight) {
    return { mode: "day", targetDate: toDateKey(now) };
  }
  if (nowMinutes <= NIGHT_END_MINUTES) {
    return {
      mode: "night",
      endingDay: toDateKey(addDays(now, -1)),
      planningDay: toDateKey(now)
    };
  }
  return {
    mode: "night",
    endingDay: toDateKey(now),
    planningDay: toDateKey(addDays(now, 1))
  };
}
export {
  NIGHT_END_MINUTES,
  NIGHT_START_MINUTES,
  getOverlayMode
};
