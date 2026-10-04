import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { dueDate } from './dates';

// Expo Go (Android, SDK 53+) crashes if expo-notifications is even imported.
// So we only load it in a development/production build, never inside Expo Go.
export const inExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === 'expo';

let N = null;
if (!inExpoGo) {
  try {
    N = require('expo-notifications');
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
      }),
    });
  } catch (e) { N = null; }
}
export const notificationsSupported = !!N;

const TT = N ? N.SchedulableTriggerInputTypes : null;
const CHANNELS = {
  'Gentle Chime': { id: 'tm-chime', name: 'Reminders – Gentle Chime', sound: 'default', importance: 'MAX', vibrationPattern: [0, 250, 250, 250] },
  'Soft Bell': { id: 'tm-bell', name: 'Reminders – Soft Bell', sound: 'default', importance: 'HIGH', vibrationPattern: [0, 500] },
  Silent: { id: 'tm-silent', name: 'Reminders – Silent', sound: null, importance: 'LOW', vibrationPattern: [0] },
};
const chan = (n) => CHANNELS[n.sound] || CHANNELS['Gentle Chime'];
const daily = (ch, hour, minute) => (TT ? { type: TT.DAILY, hour, minute, channelId: ch } : { hour, minute, repeats: true, channelId: ch });
const weekly = (ch, weekday, hour, minute) => (TT ? { type: TT.WEEKLY, weekday, hour, minute, channelId: ch } : { weekday, hour, minute, repeats: true, channelId: ch });
const at = (ch, date) => (TT ? { type: TT.DATE, date, channelId: ch } : { date, channelId: ch });
const inSeconds = (ch, seconds) => (TT ? { type: TT.TIME_INTERVAL, seconds, channelId: ch } : { seconds, channelId: ch });

export const TONES = {
  cheerful: { label: 'Cheerful & Encouraging', hint: 'Warm wording, smiles and cheerleading for streaks.',
    morning: 'A fresh day to bloom! Open TaskMaster and plan something great.', evening: 'Great work today! Take a minute to review what you completed.',
    weekend: 'Happy weekend! A gentle check-in on your goals.', task: (t) => `Time for "${t}". You've got this!`, e: { morning: '🌞', evening: '🌙', weekend: '🌿', task: '✅' } },
  calm: { label: 'Calm & Zen', hint: 'Soft, mindful wording with no pressure.',
    morning: 'Take a breath. Gently look at what today holds.', evening: "Slow down and reflect on today's progress.",
    weekend: 'A quiet moment to reflect on your week.', task: (t) => `When you're ready: "${t}".`, e: { morning: '🍃', evening: '🌙', weekend: '🧘', task: '🌱' } },
  focused: { label: 'Focused & Direct', hint: 'Short, to-the-point reminders.',
    morning: "Today's priorities are waiting. Start with the most important task.", evening: 'Review: what got done, what carries over.',
    weekend: 'Weekly review: check your goals.', task: (t) => `Due now: "${t}".`, e: { morning: '🎯', evening: '📋', weekend: '📊', task: '⏰' } },
};

export const message = (n, kind, arg) => {
  const tone = TONES[n.tone] || TONES.cheerful;
  const text = kind === 'task' ? tone.task(arg) : tone[kind];
  return n.emoji ? `${text} ${tone.e[kind]}` : text;
};

async function ensurePermission() {
  if (!N) return false;
  if (Platform.OS === 'android') {
    for (const c of Object.values(CHANNELS)) {
      await N.setNotificationChannelAsync(c.id, {
        name: c.name, importance: N.AndroidImportance[c.importance], sound: c.sound, vibrationPattern: c.vibrationPattern, enableVibrate: c.vibrationPattern.length > 1,
      });
    }
  }
  const cur = await N.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await N.requestPermissionsAsync();
  return !!req.granted;
}

export async function syncNotifications(tasks, n, name) {
  if (!N) return;
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!(n.morning || n.smart || n.evening || n.weekend)) return;
    if (!(await ensurePermission())) return;
    const first = (name || '').split(' ')[0];
    const ch = chan(n).id;
    const play = n.sound !== 'Silent';
    const sched = (title, body, trigger) => N.scheduleNotificationAsync({ content: { title, body, sound: play }, trigger });
    if (n.morning) await sched(`Good morning${first ? ', ' + first : ''}`, message(n, 'morning'), daily(ch, 8, 30));
    if (n.evening) await sched('Evening review', message(n, 'evening'), daily(ch, 20, 0));
    if (n.weekend) {
      await sched('Weekend check-in', message(n, 'weekend'), weekly(ch, 7, 10, 0)); // Saturday 10:00
      await sched('Weekend check-in', message(n, 'weekend'), weekly(ch, 1, 10, 0)); // Sunday 10:00
    }
    if (n.smart) {
      const now = Date.now();
      const up = tasks.filter((t) => !t.done).map((t) => ({ t, when: dueDate(t) })).filter((x) => x.when.getTime() > now)
        .sort((a, b) => a.when - b.when).slice(0, 40);
      for (const x of up) await sched(x.t.title, message(n, 'task', x.t.title), at(ch, x.when));
    }
  } catch (e) {}
}

export async function sendTest(n, name) {
  if (!N) return 'unsupported';
  try {
    if (!(await ensurePermission())) return 'denied';
    const first = (name || '').split(' ')[0];
    await N.scheduleNotificationAsync({
      content: { title: `Good morning${first ? ', ' + first : ''}`, body: message(n, 'morning'), sound: n.sound !== 'Silent' }, trigger: inSeconds(chan(n).id, 2),
    });
    return 'ok';
  } catch (e) { return 'denied'; }
}
