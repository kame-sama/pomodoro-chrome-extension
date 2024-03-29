/**
 * Compute time in seconds until alarm fires
 * @param {object} alarm - extension alarm (null by default)
 * @return {number} - time in seconds
 */
export default async function getTimeLeft(alarm = null) {
  if (!alarm) {
    const alarms = await chrome.alarms.getAll();
    alarm = alarms[0];
  }
  const alarmDate = new Date(alarm.scheduledTime);
  const currentDate = new Date();

  return Math.round((alarmDate.getTime() - currentDate.getTime()) / 1000);
}
