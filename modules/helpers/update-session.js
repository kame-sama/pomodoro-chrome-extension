/**
 * Updates current session
 * @param {Object} param0
 * @return {Object}
 */
export default function updateSession({ status, count, timeLeft, interval }) {
  if (status === 'pomodoro') {
    status = count % interval ? 'shortBreak' : 'longBreak';
  } else {
    count++;
    status = 'pomodoro';
  }
  timeLeft = 0;

  return [status, count, timeLeft];
}
