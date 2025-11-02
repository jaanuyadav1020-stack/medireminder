import React, { useMemo } from 'react';
import { Medicine, AdherenceStatus, Frequency } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface IndividualAdherenceChartProps {
  medicine: Medicine;
}

const DayIndicator: React.FC<{ day: string; status: 'taken' | 'missed' | 'pending' | 'none'; tooltip: string }> = ({ day, status, tooltip }) => {
    const statusClasses = {
        taken: 'bg-success text-white',
        missed: 'bg-danger text-white',
        pending: 'bg-warning border-2 border-yellow-400 text-yellow-800',
        none: 'bg-gray-200 text-text-secondary',
    };

    return (
        <div className="text-center group relative flex flex-col items-center">
            <span className="text-xs text-text-secondary mb-1">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${statusClasses[status]}`}>
            </div>
            <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                {tooltip}
            </div>
        </div>
    );
};


const AdherenceChart: React.FC<IndividualAdherenceChartProps> = ({ medicine }) => {
  const { t, locale } = useLocalization();
  
  const statusTooltips = useMemo(() => ({
      taken: t('adherence.tooltipTaken'),
      missed: t('adherence.tooltipMissed'),
      pending: t('adherence.tooltipPending'),
      none: t('adherence.tooltipNotScheduled')
  }), [t]);

  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().slice(0, 10);
        const dayOfWeek = date.getDay();
        const dayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).substring(0, 2);

        const isScheduled = medicine.frequency === Frequency.Daily || (medicine.frequency === Frequency.Weekly && medicine.dayOfWeek === dayOfWeek);
        
        let status: 'taken' | 'missed' | 'pending' | 'none' = 'none';

        if(isScheduled) {
            const adherenceStatus = medicine.adherence[dateString];
            if (adherenceStatus === AdherenceStatus.Taken) {
                status = 'taken';
            } else if (adherenceStatus === AdherenceStatus.Missed) {
                status = 'missed';
            } else {
                if (date > today) { // Future date
                    status = 'pending';
                } else if (i === 0) { // Today
                    status = 'pending';
                } else { // Past day that was not marked
                    status = 'missed';
                }
            }
        }
        
        days.push({ dayName, status, tooltip: statusTooltips[status] });
    }
    return days;
  }, [medicine, locale, statusTooltips]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-text-secondary mb-3">{t('adherence.chartTitle')}</h4>
        <div className="flex justify-around items-center">
            {last7Days.map(({ dayName, status, tooltip }, index) => (
                <DayIndicator key={index} day={dayName} status={status} tooltip={tooltip} />
            ))}
        </div>
    </div>
  );
};

export default AdherenceChart;
