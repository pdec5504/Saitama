import { useState } from 'react';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const buttonStyle = {
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    fontSize: '16px'
};

const inputStyle = {
    padding: '12px 8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px',
    fontSize: '16px',
    width: '100%'
};

function AddExerciseForm({ routineId, onExerciseAdded, onCancel}){
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [phases, setPhases] = useState([
        { sets: '', reps: '', observation: '' }
    ]);
    

    const handlePhaseChange = (index, event) => {
        const values = [...phases];
        values[index][event.target.name] = event.target.value;
        setPhases(values);
    };

    const handleAddPhase = () => {
        setPhases([...phases, { sets: '', reps: '', observation: '' }]);
    };

    const handleRemovePhase = (index) => {
        const values = [...phases];
        if (values.length > 1) {
            values.splice(index, 1);
            setPhases(values);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim()) {
            return toast.error(t('toasts.requiredExerciseName'));
        }
        const isValid = phases.every(p => p.sets && p.reps);
        if (!isValid) {
            return toast.error(t('toasts.requiredSetsAndReps'));
        }

        try{
            await apiClient.post(`http://localhost:4001/routines/${routineId}/exercises`, {
                name,
                phases
            });

            toast.success(t('toasts.exerciseAdded'));
            setTimeout(() => {
                onExerciseAdded();
            }, 1000);
        } catch (error){
            console.error("Error adding exercise:", error);
            toast.error(t('toasts.exerciseAddFailed'));
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, textAlign: 'center' }}>{t('newExerciseTitle')}</h3>
            
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('exerciseNamePlaceholder')}
                style={inputStyle}
            />

            <div style={{
                maxHeight: '30vh',
                overflowY: 'auto',
                paddingRight: '10px', 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {phases.map((phase, index) => (
                    <div key={index} style={{ borderLeft: `3px solid var(--color-primary)`, paddingLeft: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>{t('phaseLabel')} {index + 1}</label>
                            {phases.length > 1 && (
                                <button type="button" onClick={() => handleRemovePhase(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <FaTrash color="var(--color-secondary)" />
                                </button>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="number" name="sets" placeholder={t('setsPlaceholder')} value={phase.sets} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                            <input type="text" name="reps" placeholder={t('repsPlaceholder')} value={phase.reps} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                            <input type="text" name="observation" placeholder={t('observationPlaceholder')} value={phase.observation} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                        </div>
                    </div>
                ))}
            </div>

            <button type="button" onClick={handleAddPhase} style={{ ...buttonStyle, background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
                <FaPlus style={{ marginRight: '8px' }} /> {t('addPhaseButton')}
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type='submit' style={{ ...buttonStyle, background: 'var(--color-primary)', flex: 1 }}>{t('addButton')}</button>
                <button type='button' onClick={onCancel} style={{ ...buttonStyle, background: 'var(--color-secondary)', flex: 1 }}>{t('cancelButton')}</button>
            </div>
        </form>
    );
}

export default AddExerciseForm;