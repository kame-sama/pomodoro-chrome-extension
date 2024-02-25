/**
 * Formats time adding leading zero if it's only one digit
 * @param {number} time - time in arbitrary units (hours, minutes, seconds etc.)
 * @return {string} - time in proper format
 */
export default function formatTime(time) {
  return time > 9 ? `${time}` : `0${time}`;
}
