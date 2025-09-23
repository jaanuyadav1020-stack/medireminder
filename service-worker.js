// service-worker.js

// This event listener is fired when the service worker is installed.
self.addEventListener('install', (event) => {
  // self.skipWaiting() forces the waiting service worker to become the
  // active service worker.
  self.skipWaiting();
});

// This event listener is fired when the service worker is activated.
self.addEventListener('activate', (event) => {
  // event.waitUntil() ensures that the service worker will not be considered
  // activated until the promise inside it is resolved. self.clients.claim()
  // allows an active service worker to set itself as the controller for all clients
  // within its scope.
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main application.
self.addEventListener('message', (event) => {
  // Check if the message is to show a notification.
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const medicine = event.data.payload;
    const options = {
      body: `It's time for your dose: ${medicine.description || 'Check the app for details.'}`,
      // Use the medicine photo as an icon, or a default one if not available.
      icon: medicine.photo || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200], // Vibration pattern for mobile devices.
      data: {
        medicineId: medicine.id,
      },
      // Define actions that the user can take directly from the notification.
      actions: [
        { action: 'take-action', title: 'I\'ve Taken It' },
        { action: 'snooze-action', title: 'Snooze (15 min)' },
        { action: 'miss-action', title: 'Skip for Now' },
      ],
    };
    // Show the notification.
    event.waitUntil(
      self.registration.showNotification(`Reminder: ${medicine.name}`, options)
    );
  }
});

// Listen for clicks on the notification itself or its action buttons.
self.addEventListener('notificationclick', (event) => {
  const medicineId = event.notification.data.medicineId;
  let messageType;
  let payload = { medicineId };

  // Determine the adherence status based on the action clicked.
  if (event.action === 'take-action') {
    messageType = 'ADHERENCE_UPDATE';
    payload.status = 'Taken';
  } else if (event.action === 'miss-action') {
    messageType = 'ADHERENCE_UPDATE';
    payload.status = 'Missed';
  } else if (event.action === 'snooze-action') {
    messageType = 'SNOOZE_UPDATE';
  } else {
    // If the user clicks the body of the notification, just close it.
    event.notification.close();
    return;
  }
  
  // Close the notification after an action is performed.
  event.notification.close();

  // Find all open app windows/tabs and send them a message to update the adherence state.
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (!clients || clients.length === 0) {
        // If no clients are open, we can't update the UI immediately.
        // The state will be synced the next time the app is opened.
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