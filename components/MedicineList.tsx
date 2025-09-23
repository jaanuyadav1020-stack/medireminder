import React from 'react';
import { Medicine, AdherenceStatus } from '../types';
import AdherenceChart from './AdherenceChart';

interface MedicineListProps {
  medicines: Medicine[];
  onDelete: (id: string) => void;
  onAdherenceChange: (id: string, status: AdherenceStatus) => void;
  onEdit: (medicine: Medicine) => void;
}

const getStatusForToday = (medicine: Medicine) => {
    const today = new Date().toISOString().slice(0, 10);
    return medicine.adherence[today] || AdherenceStatus.Pending;
};


const MedicineListItem: React.FC<{ medicine: Medicine; onDelete: (id: string) => void; onAdherenceChange: (id: string, status: AdherenceStatus) => void; onEdit: (medicine: Medicine) => void;}> = ({ medicine, onDelete, onAdherenceChange, onEdit }) => {
    const status = getStatusForToday(medicine);
    const isPending = status === AdherenceStatus.Pending;
    
    const statusClasses = {
      [AdherenceStatus.Pending]: 'bg-yellow-100 text-yellow-800',
      [AdherenceStatus.Taken]: 'bg-green-100 text-green-800',
      [AdherenceStatus.Missed]: 'bg-red-100 text-red-800',
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 transition-transform transform hover:scale-105 duration-300">
            <div className="flex items-start justify-between space-x-4">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {medicine.photo ? (
                        <img src={medicine.photo} alt={medicine.name} className="h-16 w-16 rounded-full object-cover shadow-md flex-shrink-0" />
                    ) : (
                         <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1V2.5M10 7l2 1m-2-1l2-1m-2 1v2.5m-4 5l-2-1m0 0l-2 1m2-1V9.5M6 14l2-1m-2 1l2 1m-2-1v-2.5m6 5l2 1m-2-1l2-1m-2 1v-2.5m-4-5l-2 1m0 0l-2-1m2 1V7.5" />
                            </svg>
                         </div>
                    )}
                    <div className="flex-1">
                        <p className="font-bold text-lg text-text-primary truncate">{medicine.name}</p>
                        <p className="text-text-secondary text-sm">{medicine.time} - {medicine.frequency}</p>
                        {medicine.description && (
                             <p className="mt-1 text-xs text-gray-600 italic">"{medicine.description}"</p>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[status]}`}>{status}</span>
                    {isPending && (
                         <>
                            <button onClick={() => onAdherenceChange(medicine.id, AdherenceStatus.Taken)} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition" aria-label="Mark as taken">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => onAdherenceChange(medicine.id, AdherenceStatus.Missed)} className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition" aria-label="Mark as missed">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                         </>
                    )}
                     <button onClick={() => onEdit(medicine)} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition" aria-label="Edit medicine">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </button>
                     <button onClick={() => onDelete(medicine.id)} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition" aria-label="Delete medicine">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <AdherenceChart medicine={medicine} />
        </div>
    );
};


const MedicineList: React.FC<MedicineListProps> = ({ medicines, onDelete, onAdherenceChange, onEdit }) => {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-xl shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-xl font-medium text-text-primary">No Medicines Scheduled</h3>
        <p className="mt-1 text-sm text-text-secondary">Click the '+' button to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {medicines.map((med) => (
        <MedicineListItem key={med.id} medicine={med} onDelete={onDelete} onAdherenceChange={onAdherenceChange} onEdit={onEdit} />
      ))}
    </div>
  );
};

export default MedicineList;