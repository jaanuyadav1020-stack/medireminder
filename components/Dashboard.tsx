import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Medicine, User, Frequency, AdherenceStatus } from '../types';
import Header from './Header';
import MedicineList from './MedicineList';
import AddMedicineModal from './AddMedicineModal';
import NotificationModal from './NotificationModal';

const ALARM_SOUND = 'data:audio/wav;base64,UklGRqAOAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYgOAAAABAAAAgABAAMAAwACAAQABQAFAAQABgAHAAcABgAIAAkACQAIAAoACwALAAoADAAOAA4ADQAPABAAEAAPABEAEgASABEAEwAUABQAEwAVABYAFgAVABcAGAAXABkAGgAaABkAGwAcABwAGwAdAB4AHgAdAB8AIAAgAB8AIQAiACIAIQAjACQAJAAjACUAJgAmACUAJwAoACgAJwApACoAKgApACsALAAsACsALQAuAC4ALQAvADEAMQAwADMANAA0ADMBNgE3ATYBNwE4ATgBNwE5AToBOgE5ATsBPAE8ATsBPQE+AT4BPwFAAUIBQgFAAkAEgASAA0AFAAWABYAFAAZABwAHAAZAB0AHwAfAB0AIAAiACIAIQAjACUAJQAjACYAJwAnACYAJwAoACkAKQAnACoALAAsACoALQAwAC8ALgAxADMANAA0ADMBNQE3ATcBNgE5ATsBOwE5ATwBPgE+ATwBPwFBAUEBPwFBAUMBRQFDAUMBRgFIAUgBRgFJAUwBTAFJAUsBTwFPB6gOAAEAAgADAAIABAAFAAUABAAFAAYABgAFAAYABwAHAAgACAAHAAgACQAJAAoACgAJAAoACwALAAwADQANAAwADgAOAA4ADwAQABAADwARABEAEQASABMAEgATABQAFQAUABUAFAAVABYAFwAWABcAFgAXABgAGgAYABkAFwAaABsAGwAaABwAHgAdAB0AHQAfACEAIAAhACIAIwAjACIAJAAmACYAJQAjACUAJwApACgAKAAqACwALAArAC0ALwAvAC0ALwAxADMALgAwADYANgA0ADcANwA0ADYBOQA5ADYBOgA7ADsAOQA9AD4APgA8AD8AQQBBAUEBQwFDAUEBQwFEAUYBRQFGAYoN/v8A/v8AAAEAAQABAAEAAQACAAMAAwACAAQABQAFAAQABgAHAAcABgAIAAkACQAIAAoACwALAAoADAAOAA4ADQAPABAAEAAPABEAEgASABEAEwAUABQAEwAVABYAFgAVABcAGAAXABkAGgAaABkAGwAcABwAGwAdAB4AHgAdAB8AIAAgAB8AIQAiACIAIQAjACQAJAAjACUAJgAmACUAJwAoACgAJwApACoAKgApACsALAAsACsALQAuAC4ALQAvADEAMQAwADMANAA0ADMANgE3ATYBNwE4ATgBNwE5AToBOgE5ATsBPAE8ATsBPQE+AT4BPwFAAUIBQgFAAkAEgASAA0AFAAWABYAFAAZABwAHAAZAB0AHwAfAB0AIAAiACIAIQAjACUAJQAjACYAJwAnACYAJwAoACkAKQAnACoALAAsACoALQAwAC8ALgAxADMANAA0ADMANQE3ATcBNgE5ATsBOwE5ATwBPgE+ATwBPwFBAUEBPwFBAUMBRQFDAUMBRgFIAUgBRgFJAUwBTAFJAUsBTwFPB6gOAAEAAgADAAIABAAFAAUABAAFAAYABgAFAAYABwAHAAgACAAHAAgACQAJAAoACgAJAAoACwALAAwADQANAAwADgAOAA4ADwAQABAADwARABEAEQASABMAEgATABQAFQAUABUAFAAVABYAFwAWABcAFgAXABgAGgAYABkAFwAaABsAGwAaABwAHgAdAB0AHQAfACEAIAAhACIAIwAjACIAJAAmACYAJQAjACUAJwApACgAKAAqACwALAArAC0ALwAvAC0ALwAxADMALgAwADYANgA0ADcANwA0ADYBOQA5ADYBOgA7ADsAOQA9AD4APgA8AD8AQQBBAUEBQwFDAUEBQwFEAUYBRQFGAYoN/v8A/v8AAAEAAQABAAEAAQACAAMAAwACAAQABQAFAAQABgAHAAcABgAIAAkACQAIAAoACwALAAoADAAOAA4ADQAPABAAEAAPABEAEgASABEAEwAUABQAEwAVABYAFgAVABcAGAAXABkAGgAaABkAGwAcABwAGwAdAB4AHgAdAB8AIAAgAB8AIQAiACIAIQAjACQAJAAjACUAJgAmACUAJwAoACgAJwApACoAKgApACsALAAsACsALQAuAC4ALQAvADEAMQAwADMANAA0ADMANgE3ATYBNwE4ATgBNwE5AToBOgE5ATsBPAE8ATsBPQE+AT4BPwFAAUIBQgFAAkAEgASAA0AFAAWABYAFAAZABwAHAAZAB0AHwAfAB0AIAAiACIAIQAjACUAJQAjACYAJwAnACYAJwAoACkAKQAnACoALAAsACoALQAwAC8ALgAxADMANAA0ADMANQE3ATcBNgE5ATsBOwE5ATwBPgE+ATwBPwFBAUEBPwFBAUMBRQFDAUMBRgFIAUgBRgFJAUwBTAFJAUsBTwFPB6gOAAEAAgADAAIABAAFAAUABAAFAAYABgAFAAYABwAHAAgACAAHAAgACQAJAAoACgAJAAoACwALAAwADQANAAwADgAOAA4ADwAQABAADwARABEAEQASABMAEgATABQAFQAUABUAFAAVABYAFwAWABcAFgAXABgAGgAYABkAFwAaABsAGwAaABwAHgAdAB0AHQAfACEAIAAhACIAIwAjACIAJAAmACYAJQAjACUAJwApACgAKAAqACwALAArAC0ALwAvAC0ALwAxADMALgAwADYANgA0ADcANwA0ADYBOQA5ADYBOgA7ADsAOQA9AD4APgA8AD8AQQBBAUEBQwFDAUEBQwFEAUYBRQFGAYoN/v8A/v8AAAEAAQABAAEAAQACAAMAAwACAAQABQAFAAQABgAHAAcABgAIAAkACQAIAAoACwALAAoADAAOAA4ADQAPABAAEAAPABEAEgASABEAEwAUABQAEwAVABYAFgAVABcAGAAXABkAGgAaABkAGwAcABwAGwAdAB4AHgAdAB8AIAAgAB8AIQAiACIAIQAjACQAJAAjACUAJgAmACUAJwAoACgAJwApACoAKgApACsALAAsACsALQAuAC4ALQAvADEAMQAwADMANAA0ADMANgE3ATYBNwE4ATgBNwE5AToBOgE5ATsBPAE8ATsBPQE+AT4BPwFAAUIBQgFAAkAEgASAA0AFAAWABYAFAAZABwAHAAZAB0AHwAfAB0AIAAiACIAIQAjACUAJQAjACYAJwAnACYAJwAoACkAKQAnACoALAAsACoALQAwAC8ALgAxADMANAA0ADMBNQE3ATcBNgE5ATsBOwE5ATwBPgE+ATwBPwFBAUEBPwFBAUMBRQFDAUMBRgFIAUgBRgFJAUwBTAFJAUsBTwFPB6gOAAEAAgADAAIABAAFAAUABAAFAAYABgAFAAYABwAHAAgACAAHAAgACQAJAAoACgAJAAoACwALAAwADQANAAwADgAOAA4ADwAQABAADwARABEAEQASABMAEgATABQAFQAUABUAFAAVABYAFwAWABcAFgAXABgAGgAYABkAFwAaABsAGwAaABwAHgAdAB0AHQAfACEAIAAhACIAIwAjACIAJAAmACYAJQAjACUAJwApACgAKAAqACwALAArAC0ALwAvAC0ALwAxADMALgAwADYANgA0ADcANwA0ADYBOQA5ADYBOgA7ADsAOQA9AD4APgA8AD8AQQBBAUEBQwFDAUEBQwFEAUYBRQFGAYoN/v8A/v8AAAEAAQABAAEAAQACAAMAAwACAAQABQAFAAQABgAHAAcABgAIAAkACQAIAAoACwALAAoADAAOAA4ADQAPABAAEAAPABEAEgASABEAEwAUABQAEwAVABYAFgAVABcAGAAXABkAGgAaABkAGwAcABwAGwAdAB4AHgAdAB8AIAAgAB8AIQAiACIAIQAjACQAJAAjACUAJgAmACUAJwAoACgAJwApACoAKgApACsALAAsACsALQAuAC4ALQAvADEAMQAwADMANAA0ADMANgE3ATYBNwE4ATgBNwE5AToBOgE5ATsBPAE8ATsBPQE+AT4BPwFAAUIBQgFAAkAEgASAA0AFAAWABYAFAAZABwAHAAZAB0AHwAfAB0AIAAiACIAIQAjACUAJQAjACYAJwAnACYAJwAoACkAKQAnACoALAAsACoALQAwAC8ALgAxADMANAA0ADMBNQE3ATcBNgE5ATsBOwE5ATwBPgE+ATwBPwFBAUEBPwFBAUMBRQFDAUMBRgFIAUgBRgFJAUwBTAFJAUsBTwFPB6gOAAEAAgADAAIABAAFAAUABAAFAAYABgAFAAYABwAHAAgACAAHAAgACQAJAAoACgAJAAoACwALAAwADQANAAwADgAOAA4ADwAQABAADwARABEAEQASABMAEgATABQAFQAUABUAFAAVABYAFwAWABcAFgAXABgAGgAYABkAFwAaABsAGwAaABwAHgAdAB0AHQAfACEAIAAhACIAIwAjACIAJAAmACYAJQAjACUAJwApACgAKAAqACwALAArAC0ALwAvAC0ALwAxADMALgAwADYANgA0ADcANwA0ADYBOQA5ADYBOgA7ADsAOQA9AD4APgA8AD8AQQBBAUEBQwFDAUEBQwFEAUYBRQFGAYoN'
const alarm = new Audio(ALARM_SOUND);

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

  useEffect(() => {
    const storedMedicines = localStorage.getItem('medirem-medicines');
    if (storedMedicines) {
      setMedicines(JSON.parse(storedMedicines));
    }
    
    // Check and request notification permission on component mount
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
            return { ...med, adherence: newAdherence };
        }
        return med;
    }));
    if (notification?.id === medId) {
        setNotification(null);
        alarm.pause();
        alarm.currentTime = 0;
    }
  }, [notification]);

  // Listen for messages from the Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADHERENCE_UPDATE') {
        const { medicineId, status } = event.data.payload;
        handleAdherence(medicineId, status as AdherenceStatus);
      }
    };
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [handleAdherence]);

  const checkSchedules = useCallback(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = getTodayDateString();
    const dayOfWeek = now.getDay();
  
    medicines.forEach(med => {
      const isDue = med.time === currentTime;
      const isDaily = med.frequency === Frequency.Daily;
      const isWeeklyToday = med.frequency === Frequency.Weekly && med.dayOfWeek === dayOfWeek;
      const alreadyHandled = med.adherence[today] && med.adherence[today] !== AdherenceStatus.Pending;
      
      const lastNotified = notifiedMeds[med.id];
      const recentlyNotified = lastNotified && (Date.now() - lastNotified < 60000); // Prevent re-notifying within 60 seconds

      if (isDue && (isDaily || isWeeklyToday) && !alreadyHandled && !recentlyNotified) {
        setNotifiedMeds(prev => ({...prev, [med.id]: Date.now()}));

        if (notificationPermission === 'granted' && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload: med
          });
          // Also play a sound if the app is currently visible to the user
          if (document.visibilityState === 'visible') {
            alarm.play().catch(e => console.error("Error playing sound:", e));
          }
        } else {
          // Fallback to in-app notification if permission is not granted
          if (!notification) { // Only show if no other in-app notification is active
             setNotification(med);
             alarm.play().catch(e => console.error("Error playing sound:", e));
          }
        }
      }
    });
  }, [medicines, notification, notificationPermission, notifiedMeds]);
  
  useEffect(() => {
    const interval = setInterval(checkSchedules, 1000); // Check every second for precision
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

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      <Header user={user} onLogout={onLogout} />
      <main className="p-4 md:p-8 max-w-4xl mx-auto">
          <div>
              <h1 className="text-3xl font-bold mb-6">Today's Schedule</h1>
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
          onClose={() => setNotification(null)}
          onConfirm={handleAdherence}
        />
      )}
      <button
          onClick={() => {
            setEditingMedicine(null);
            setIsModalOpen(true);
          }}
          className="fixed bottom-8 right-8 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-110 z-30"
          aria-label="Add new medicine"
      >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
      </button>
    </div>
  );
};

export default Dashboard;