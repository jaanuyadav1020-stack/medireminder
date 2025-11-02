import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Medicine, User, Frequency, AdherenceStatus } from '../types';
import Header from './Header';
import MedicineList from './MedicineList';
import AddMedicineModal from './AddMedicineModal';
import NotificationModal from './NotificationModal';
import { useLocalization } from '../hooks/useLocalization';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notifiedMeds, setNotifiedMeds] = useState<Record<string, number>>({}); // { medId: timestamp }
  const { t, language, locale } = useLocalization();

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech Synthesis not supported by this browser.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const setVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            return; 
        }

        let bestVoice = voices.find(voice => voice.lang === locale) || 
                        voices.find(voice => voice.lang.startsWith(locale.split('-')[0]));
        
        if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang;
        } else {
            // Fallback if no specific language voice is found
            utterance.lang = locale;
        }
        
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoice;
    } else {
        setVoice();
    }
  }, [locale]);

  useEffect(() => {
    const storedMedicines = localStorage.getItem('medirem-medicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    }
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    } else {
        console.warn("This browser does not support desktop notification");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('medirem-medicines', JSON.stringify(medicines));
  }, [medicines]);

  const handleAdherence = useCallback((medId: string, status: AdherenceStatus) => {
    setMedicines(prevMeds => prevMeds.map(med => {
        if (med.id === medId) {
            const today = getTodayDateString();
            const newAdherence = { ...med.adherence, [today]: status };
            return { ...med, adherence: newAdherence, snoozedUntil: undefined };
        }
        return med;
    }));
    if (notification?.id === medId) {
        setNotification(null);
        window.speechSynthesis.cancel();
    }
  }, [notification]);
  
  const handleSnooze = useCallback((medId: string) => {
    setMedicines(prevMeds => prevMeds.map(med => {
        if (med.id === medId) {
            const snoozedUntil = Date.now() + 15 * 60 * 1000;
            return { ...med, snoozedUntil };
        }
        return med;
    }));
     if (notification?.id === medId) {
        setNotification(null);
        window.speechSynthesis.cancel();
    }
  }, [notification]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'ADHERENCE_UPDATE') {
        const { medicineId, status } = event.data.payload;
        handleAdherence(medicineId, status as AdherenceStatus);
      } else if (event.data.type === 'SNOOZE_UPDATE') {
        const { medicineId } = event.data.payload;
        handleSnooze(medicineId);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [handleAdherence, handleSnooze]);

  const checkSchedules = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = getTodayDateString();
    const dayOfWeek = now.getDay();
  
    medicines.forEach(med => {
      const isDueAtSchedule = med.time === currentTime;
      const isDueFromSnooze = med.snoozedUntil && now.getTime() >= med.snoozedUntil;

      if (isDueAtSchedule && med.snoozedUntil && now.getTime() < med.snoozedUntil) {
          return;
      }

      const isScheduledForToday = med.frequency === Frequency.Daily || (med.frequency === Frequency.Weekly && med.dayOfWeek === dayOfWeek);
      const alreadyHandled = med.adherence[today] && med.adherence[today] !== AdherenceStatus.Pending;
      
      const lastNotified = notifiedMeds[med.id];
      const recentlyNotified = lastNotified && (Date.now() - lastNotified < 60000);

      if ((isDueAtSchedule || isDueFromSnooze) && isScheduledForToday && !alreadyHandled && !recentlyNotified) {
        if (isDueFromSnooze) {
            setMedicines(prevMeds => prevMeds.map(m => 
                m.id === med.id ? { ...m, snoozedUntil: undefined } : m
            ));
        }

        setNotifiedMeds(prev => ({...prev, [med.id]: Date.now()}));
        
        const medicineNameForLocale = med.i18n?.[language]?.name || med.name;

        if (document.visibilityState === 'visible') {
            // If the app is visible, show the in-app modal for a reliable voice prompt.
            // This also prevents a system notification from appearing when the user is already in the app.
            if (!notification) {
                setNotification(med);
            }
        } else {
            // If the app is in the background or inactive, send a system push notification (if permission is granted).
            // Voice prompts from the background are not reliable, so we rely on the standard notification sound.
            if (notificationPermission === 'granted' && navigator.serviceWorker.controller) {
                const medicineDescriptionForLocale = med.i18n?.[language]?.description ?? (med.description || t('serviceWorker.notificationBodyDefaultDescription'));
                navigator.serviceWorker.controller.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    payload: {
                      medicine: med,
                      title: t('serviceWorker.notificationTitle', { medicineName: medicineNameForLocale }),
                      body: t('serviceWorker.notificationBody', { medicineDescription: medicineDescriptionForLocale }),
                      actions: {
                          take: t('serviceWorker.actionTake'),
                          snooze: t('serviceWorker.actionSnooze'),
                          skip: t('serviceWorker.actionSkip'),
                      }
                    }
                });
            }
        }
      }
    });
  }, [medicines, notification, notificationPermission, notifiedMeds, t, language]);
  
  useEffect(() => {
    const interval = setInterval(checkSchedules, 1000);
    return () => clearInterval(interval);
  }, [checkSchedules]);
  

  const handleSaveMedicine = (med: Medicine) => {
    const existingIndex = medicines.findIndex(m => m.id === med.id);
    if (existingIndex > -1) {
      const updatedMedicines = [...medicines];
      updatedMedicines[existingIndex] = med;
      setMedicines(updatedMedicines);
    } else {
      setMedicines([...medicines, med]);
    }
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const handleEditMedicine = (med: Medicine) => {
    setEditingMedicine(med);
    setIsModalOpen(true);
  };

  const todaySchedule = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return medicines.filter(med => {
        if (med.frequency === Frequency.Daily) return true;
        if (med.frequency === Frequency.Weekly && med.dayOfWeek === dayOfWeek) return true;
        return false;
    }).sort((a,b) => a.time.localeCompare(b.time));
  }, [medicines]);

  const reminderTextForModal = useMemo(() => {
    if (!notification) return '';
    const medicineNameForLocale = notification.i18n?.[language]?.name || notification.name;
    return t('voiceReminder.prompt', { medicineName: medicineNameForLocale });
  }, [notification, language, t]);

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <Header user={user} onLogout={onLogout} />
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
          <div>
              <h1 className="text-3xl font-bold mb-6">{t('dashboard.title')}</h1>
              <MedicineList 
                  medicines={todaySchedule} 
                  onDelete={handleDeleteMedicine}
                  onAdherenceChange={handleAdherence}
                  onEdit={handleEditMedicine}
              />
          </div>
      </main>
      {isModalOpen && (
        <AddMedicineModal
          medicine={editingMedicine || undefined}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMedicine(null);
          }}
          onSave={handleSaveMedicine}
        />
      )}
      {notification && (
        <NotificationModal
          medicine={notification}
          speak={speak}
          reminderText={reminderTextForModal}
          onClose={() => {
            window.speechSynthesis.cancel();
            setNotification(null);
          }}
          onConfirm={handleAdherence}
          onSnooze={handleSnooze}
        />
      )}
      <button
          onClick={() => {
            setEditingMedicine(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-110 z-30"
          aria-label={t('dashboard.addMedicineAria')}
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
      </button>
    </div>
  );
};

export default Dashboard;