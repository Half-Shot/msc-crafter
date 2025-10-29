export const HOUR_S = 60 * 60;
export const DAY_S = HOUR_S * 24;
export const MONTH_S = DAY_S * 30;
export const YEAR_S = DAY_S * 365;

export function humanDuration(date: Date) {
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) {
    return "Less than a minute ago";
  }
  let durationWord = "";
  let integer = 0;
  if (seconds < HOUR_S) {
    integer = Math.round(seconds / 60);
    durationWord = "minute";
  } else if (seconds < DAY_S) {
    integer = Math.round(seconds / HOUR_S);
    durationWord = "hour";
  } else if (seconds < MONTH_S) {
    integer = Math.round(seconds / DAY_S);
    durationWord = "day";
  } else if (seconds < YEAR_S) {
    integer = Math.round(seconds / MONTH_S);
    durationWord = "month";
  } else {
    integer = Math.round(seconds / YEAR_S);
    durationWord = "year";
  }

  return `${integer} ${durationWord}${integer > 1 ? "s" : ""} ago`;
}
