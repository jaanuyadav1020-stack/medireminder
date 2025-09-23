import React, { useState, useCallback } from 'react';
import { Medicine, Frequency, AdherenceStatus } from '../types';
import { recognizeMedicineFromImage } from '../services/geminiService';

interface AddMedicineModalProps {
  medicine?: Medicine;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({ medicine, onClose, onSave }) => {
  const [name, setName] = useState(medicine?.name || '');
  const [description, setDescription] = useState(medicine?.description || '');
  const [photo, setPhoto] = useState<string | undefined>(medicine?.photo);
  const [time, setTime] = useState(medicine?.time || '08:00');
  const [frequency, setFrequency] = useState<Frequency>(medicine?.frequency || Frequency.Daily);
  const [dayOfWeek, setDayOfWeek] = useState(medicine?.dayOfWeek || 0);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setPhoto(base64);
    }
  };

  const handleOcr = useCallback(async () => {
    if (!photo) {
        setOcrError('Please upload a photo first.');
        return;
    }
    setOcrLoading(true);
    setOcrError('');
    try {
        const mimeType = photo.substring(photo.indexOf(':') + 1, photo.indexOf(';'));
        const base64Data = photo.split(',')[1];
        const { name: recognizedName, description: recognizedDescription } = await recognizeMedicineFromImage(base64Data, mimeType);
        setName(recognizedName);
        setDescription(recognizedDescription);
    } catch (error) {
        setOcrError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
        setOcrLoading(false);
    }
  }, [photo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Medicine name cannot be empty.");
      return;
    }
    const medToSave: Medicine = {
      id: medicine?.id || crypto.randomUUID(),
      name,
      photo,
      description,
      time,
      frequency,
      dayOfWeek: frequency === Frequency.Weekly ? dayOfWeek : undefined,
      adherence: medicine?.adherence || {},
    };
    onSave(medToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary">{medicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
              {photo ? <img src={photo} alt="Medicine" className="w-full h-full object-cover"/> : 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            </div>
            <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="photo-upload-gallery" className="cursor-pointer bg-gray-100 text-text-secondary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        <span>Gallery</span>
                    </label>
                    <input id="photo-upload-gallery" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

                    <label htmlFor="photo-upload-camera" className="cursor-pointer bg-gray-100 text-text-secondary text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 8a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                        <span>Camera</span>
                    </label>
                    <input id="photo-upload-camera" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </div>
                <button type="button" onClick={handleOcr} disabled={!photo || ocrLoading} className="mt-2 w-full text-sm bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-secondary disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center">
                    {ocrLoading ? (
                        <>
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Recognizing...
                        </>
                    ): "Recognize with AI"}
                </button>
            </div>
          </div>
          {ocrError && <p className="text-red-500 text-sm">{ocrError}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Medicine Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
           <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description (AI-assisted)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g., Used to treat high blood pressure." />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-text-secondary">Time</label>
            <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary">Frequency</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <button type="button" onClick={() => setFrequency(Frequency.Daily)} className={`px-4 py-2 rounded-l-md border w-1/2 ${frequency === Frequency.Daily ? 'bg-primary text-white' : 'bg-white'}`}>Daily</button>
                <button type="button" onClick={() => setFrequency(Frequency.Weekly)} className={`px-4 py-2 rounded-r-md border w-1/2 -ml-px ${frequency === Frequency.Weekly ? 'bg-primary text-white' : 'bg-white'}`}>Weekly</button>
            </div>
          </div>
          {frequency === Frequency.Weekly && (
            <div>
                <label htmlFor="dayOfWeek" className="block text-sm font-medium text-text-secondary">Day of the Week</label>
                <select id="dayOfWeek" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-background border border-accent rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent">
                    {daysOfWeek.map((day, index) => <option key={index} value={index}>{day}</option>)}
                </select>
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;