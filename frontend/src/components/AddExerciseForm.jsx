import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from "react-icons/fa";

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
            return toast.error("Exercise name required.");
        }
        const isValid = phases.every(p => p.sets && p.reps);
        if (!isValid) {
            return toast.error("Sets and reps required.");
        }

        try{
            await axios.post(`http://localhost:4001/routines/${routineId}/exercises`, {
                name,
                phases
            });

            toast.success("Exercício adicionado com sucesso!");
            setTimeout(() => {
                onExerciseAdded();
            }, 1000);
        } catch (error){
            console.error("Error adding exercise:", error);
            toast.error("Não foi possível adicionar o exercício Tente novamente.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, textAlign: 'center' }}>Novo Exercício</h3>
            
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Nome do Exercício (ex: Supino Reto)'
                style={inputStyle}
            />

            {phases.map((phase, index) => (
                <div key={index} style={{ borderLeft: `3px solid var(--color-primary)`, paddingLeft: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ color: 'var(--color-text-secondary)', fontWeight: 'bold' }}>Fase {index + 1}</label>
                        {phases.length > 1 && (
                            <button type="button" onClick={() => handleRemovePhase(index)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <FaTrash color="var(--color-secondary)" />
                            </button>
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="number" name="sets" placeholder="Séries" value={phase.sets} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                        <input type="text" name="reps" placeholder="Repetições (ex: 8-12)" value={phase.reps} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                        <input type="text" name="observation" placeholder="Observação (opcional)" value={phase.observation} onChange={e => handlePhaseChange(index, e)} style={inputStyle} />
                    </div>
                </div>
            ))}

            <button type="button" onClick={handleAddPhase} style={{ ...buttonStyle, background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
                <FaPlus style={{ marginRight: '8px' }} /> Adicionar Fase
            </button>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type='submit' style={{ ...buttonStyle, background: 'var(--color-primary)', flex: 1 }}>Adicionar</button>
                <button type='button' onClick={onCancel} style={{ ...buttonStyle, background: 'var(--color-secondary)', flex: 1 }}>Cancelar</button>
            </div>
        </form>
    );
}

export default AddExerciseForm;