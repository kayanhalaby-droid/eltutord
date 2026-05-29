// Push Notifications via web-push — copied from elitetutor-master server/pushNotifications.ts
// Install: pnpm add web-push && pnpm add -D @types/web-push

import * as webpush from 'web-push';

let initialized = false;

function ensureInit() {
  if (initialized) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  if (publicKey && privateKey) {
    webpush.setVapidDetails('mailto:noreply@elitutor.org', publicKey, privateKey);
    initialized = true;
  }
}

// In-memory subscription store — replace with DB in production
const subscriptions: Record<string, webpush.PushSubscription[]> = {};

export function savePushSubscription(userId: string, subscription: webpush.PushSubscription) {
  if (!subscriptions[userId]) subscriptions[userId] = [];
  subscriptions[userId].push(subscription);
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  ensureInit();
  const userSubs = subscriptions[userId] || [];
  const message = JSON.stringify(payload);
  await Promise.allSettled(userSubs.map((sub) => webpush.sendNotification(sub, message)));
}

export async function broadcastPush(payload: { title: string; body: string; url?: string }) {
  ensureInit();
  const message = JSON.stringify(payload);
  const allSubs = Object.values(subscriptions).flat();
  await Promise.allSettled(allSubs.map((sub) => webpush.sendNotification(sub, message)));
}
