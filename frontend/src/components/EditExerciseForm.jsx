import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const buttonStyle = {
    padding: '12px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold'
};

const inputStyle = {
    padding: '12px 8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px',
    fontSize: '14px'
};

function EditExerciseForm({ exercise, routineId, onSave, onCancel }){
    const [name, setName] = useState(exercise.name);
    const [sets, setSets] = useState(exercise.sets);
    const [reps, setReps] = useState(exercise.reps);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const updatedData = { name, sets, reps };

        try{
            await axios.put(`http://localhost:4001/routines/${routineId}/exercises/${exercise.originalId}`, updatedData);
            toast.success('Exercício atualizado com sucesso!');
            setTimeout(() => {
                onSave();
            }, 1000)
        }catch(error){
            console.error("Error updating exercise:", error);
            toast.error("Não foi possível atualizar o exercício. Tente novamente.");
        }
    };

    return(
        <form onSubmit={handleSubmit} className="edit-exercise-form" style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            width: '100%',
            marginBottom: '10px'
        }}>
          <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{...inputStyle, flexGrow: 1 }}
              className="edit-exercise-name-input"
          />
            <div className="edit-exercise-sets-reps-group" style={{ display: 'flex', gap: '10px' }}>
                <input value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    type='number'
                    placeholder='Séries'
                    style={{ ...inputStyle, width: '80px' }}
                />
                <input value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    type='number'
                    placeholder='Repetições'
                    style={{ ...inputStyle, width: '80px' }}
                />
            </div>
            <div className="edit-exercise-buttons-group"style={{ display: 'flex', gap: '10px' }}>
                <button type='submit' style={{ ...buttonStyle, backgroundColor: 'var(--color-primary)'}}>Salvar</button>
                <button type='button' onClick={onCancel} style={{ ...buttonStyle, backgroundColor: 'var(--color-secondary)' }}>Cancelar</button>
            </div>
        </form>
    );
}

export default EditExerciseForm;