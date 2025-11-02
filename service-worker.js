// service-worker.js

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { medicine, title, body, actions } = event.data.payload;
    
    const options = {
      body: body,
      icon: medicine.photo || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: {
        medicineId: medicine.id,
      },
      actions: [
        { action: 'take-action', title: actions.take },
        { action: 'snooze-action', title: actions.snooze },
        { action: 'miss-action', title: actions.skip },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  const medicineId = event.notification.data.medicineId;
  let messageType;
  let payload = { medicineId };

  if (event.action === 'take-action') {
    messageType = 'ADHERENCE_UPDATE';
    payload.status = 'Taken';
  } else if (event.action === 'miss-action') {
    messageType = 'ADHERENCE_UPDATE';
    payload.status = 'Missed';
  } else if (event.action === 'snooze-action') {
    messageType = 'SNOOZE_UPDATE';
  } else {
    event.notification.close();
    // Also, focus the client if it's available.
    event.waitUntil(clients.matchAll({
      type: 'window'
    }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    }));
    return;
  }
  
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (!clients || clients.length === 0) {
        return;
      }
      clients.forEach((client) => {
        client.postMessage({
          type: messageType,
          payload: payload,
        });
      });
    })
  );
});
