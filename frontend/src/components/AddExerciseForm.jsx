import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const buttonStyle = {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold'
};

const inputStyle = {
    padding: '8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px'
};

function AddExerciseForm({ routineId, onExerciseAdded, onCancel}){
    const [name, setName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!name.trim() || !sets.trim() || !reps.trim()) {
            toast.error("Todos os campos são obrigatórios.")
            return;
        }

        try{
            await axios.post(`http://localhost:4001/routines/${routineId}/exercises`, {
                name,
                sets,
                reps
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

    return(
            <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>Novo Exercício</h3>
                <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Nome do exercício'
                style={{ ...inputStyle, width: '100%', marginBottom: '10px' }} 
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder='Séries'
                    type='number'
                    style={{ ...inputStyle, width: '50%' }} 
                    />
                    <input 
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder='Repetições'
                    type='number'
                    style={{ ...inputStyle, width: '50%'  }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px'}}>
                    <button type='submit' style={{ ...buttonStyle, background: 'var(--color-primary)'}}>
                        Adicionar
                    </button>
                    <button type="button" onClick={onCancel} style={{ ...buttonStyle, background: 'var(--color-secondary)' }}>
                        Cancelar
                    </button>
                </div>
            </form>
    );
}

export default AddExerciseForm;