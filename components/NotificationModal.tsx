import React from 'react';
import { Medicine, AdherenceStatus } from '../types';

interface NotificationModalProps {
  medicine: Medicine;
  onClose: () => void;
  onConfirm: (medicineId: string, status: AdherenceStatus) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ medicine, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-up transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-4 border-4 border-blue-200">
            {medicine.photo ? (
                <img src={medicine.photo} alt={medicine.name} className="h-full w-full rounded-full object-cover"/>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
            )}
        </div>
        <h3 className="text-2xl font-bold text-text-primary">Time for your medicine!</h3>
        <p className="text-gray-500 mt-2 mb-4">It's {medicine.time}. Please take:</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="font-bold text-xl text-primary">{medicine.name}</p>
            {medicine.description && (
                <p className="mt-2 text-sm text-text-secondary">{medicine.description}</p>
            )}
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={() => onConfirm(medicine.id, AdherenceStatus.Taken)}
            className="w-full bg-success text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
          >
            I've Taken It
          </button>
          <button
            onClick={() => onConfirm(medicine.id, AdherenceStatus.Missed)}
            className="w-full bg-gray-200 text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-gray-300"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;