import { useState } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const buttonStyle = {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    fontSize: '16px'
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px',
    fontSize: '16px'
};

function EditRoutineForm({ routine, onSave, onCancel }){
    const [name, setName] = useState(routine.name);
    const [weekDay, setWeekDay] = useState(routine.weekDay);
    const { t } = useTranslation();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            await apiClient.put(`/api/routines/routines/${routine._id}`, { name, weekDay });
            toast.success(t('toasts.routineUpdated'));
            setTimeout(() => {
                onSave();
            }, 1000)
        }catch(error){
            console.error("Error updating routine:", error);
            toast.error(t('toasts.routineUpdateFailed'));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>{t('editRoutineTitle')}</h3>

            <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="routineName" style={{ display: 'block', marginBottom: '5px' }}>{t('workoutNameLabel')}</label>
                    <input type="text"
                        id='routineName'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>    
                    <label htmlFor="weekDay" style={{ display: 'block', marginBottom: '5px' }}>{t('dayOfWeekLabel')}</label>
                    <select
                        id="weekDay"
                        value={weekDay}
                        onChange={(e) => setWeekDay(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="Monday">{t('weekDays.Monday')}</option>
                        <option value="Tuesday">{t('weekDays.Tuesday')}</option>
                        <option value="Wednesday">{t('weekDays.Wednesday')}</option>
                        <option value="Thursday">{t('weekDays.Thursday')}</option>
                        <option value="Friday">{t('weekDays.Friday')}</option>
                        <option value="Saturday">{t('weekDays.Saturday')}</option>
                        <option value="Sunday">{t('weekDays.Sunday')}</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type='submit'
                            style={{ ...buttonStyle, background: 'var(--color-primary)' }}>
                        {t('saveButton')}
                    </button>
                    <button type='button' onClick={onCancel}
                            style={{ ...buttonStyle, background: 'var(--color-secondary)' }}>
                        {t('cancelButton')}
                    </button>
                </div>
        </form>
    );
}

export default EditRoutineForm;