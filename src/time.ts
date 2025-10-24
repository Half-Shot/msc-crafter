export const HOUR_S = 60 * 60;
export const DAY_S = HOUR_S * 24;
export const MONTH_S = DAY_S * 30;
export const YEAR_S = DAY_S * 365;

export function humanDuration(date: Date) {
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) {
    return "Less than a minute ago";
  }
  if (seconds < HOUR_S) {
    return `${Math.round(seconds / 60)} minutes ago`;
  }
  if (seconds < DAY_S) {
    return `${Math.round(seconds / HOUR_S)} hours ago`;
  }
  if (seconds < MONTH_S) {
    return `${Math.round(seconds / DAY_S)} days ago`;
  }
  if (seconds < YEAR_S) {
    return `${Math.round(seconds / MONTH_S)} months ago`;
  }

  return `${Math.round(seconds / YEAR_S)} years ago`;
}
