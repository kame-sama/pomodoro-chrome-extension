export default function formatTime(time) {
  return time > 9 ? time : `0${time}`;
}
