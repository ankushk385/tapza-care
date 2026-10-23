import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { DoseTiming, Prescription } from "../types/config";

/**
 * Local medicine reminders.
 *
 * The pure part (`buildDoseReminders`) decides *what* to schedule and is unit
 * tested. `syncDoseReminders` is the thin native shell around it: permission,
 * Android channel, then one-off notifications for every remaining dose.
 *
 * We use one-off DATE triggers instead of a repeating daily trigger so a
 * five-day course really stops after five days, and so a dose that has already
 * passed today is not fired again.
 */

export const DOSE_HOURS: Record<DoseTiming, number> = {
  morning: 8,
  afternoon: 14,
  night: 20,
};

export const REMINDER_CHANNEL_ID = "medicine-reminders";

export interface DoseReminder {
  /** Stable per prescription/medicine/dose/day, useful for debugging. */
  id: string;
  prescriptionId: string;
  date: Date;
  timing: DoseTiming;
  title: string;
  body: string;
  url: string;
}

export interface ReminderSyncResult {
  supported: boolean;
  granted: boolean;
  scheduled: number;
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function buildDoseReminders(
  prescriptions: Prescription[],
  now: Date = new Date(),
): DoseReminder[] {
  const reminders: DoseReminder[] = [];

  for (const prescription of prescriptions) {
    for (const medicine of prescription.medicines) {
      for (const timing of medicine.timing) {
        for (let offset = 0; offset < medicine.days; offset += 1) {
          const date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
            DOSE_HOURS[timing],
            0,
            0,
            0,
          );
          // Don't schedule a dose whose time has already gone today.
          if (date.getTime() <= now.getTime()) continue;

          reminders.push({
            id: `${prescription.id}:${medicine.id}:${timing}:${dayKey(date)}`,
            prescriptionId: prescription.id,
            date,
            timing,
            title: `${timing[0]?.toUpperCase() ?? ""}${timing.slice(1)} dose`,
            body: `${medicine.name} · ${medicine.dose}`,
            url: `tapzacare://prescriptions/${prescription.id}`,
          });
        }
      }
    }
  }

  return reminders.sort((a, b) => a.date.getTime() - b.date.getTime());
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: "Medicine reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function syncDoseReminders(
  prescriptions: Prescription[],
  enabled: boolean,
): Promise<ReminderSyncResult> {
  // expo-notifications has no web implementation; the demo on web must not crash.
  if (Platform.OS === "web") {
    return { supported: false, granted: false, scheduled: 0 };
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return { supported: true, granted: true, scheduled: 0 };

  const granted = await ensurePermission();
  if (!granted) return { supported: true, granted: false, scheduled: 0 };

  const plan = buildDoseReminders(prescriptions);
  for (const reminder of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: "default",
        data: { url: reminder.url },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.date,
        channelId: REMINDER_CHANNEL_ID,
      },
    });
  }

  return { supported: true, granted: true, scheduled: plan.length };
}
