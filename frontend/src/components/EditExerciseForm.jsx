import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
            onSave();
        }catch(error){
            console.error("Error updating exercise:", error);
            toast.error("Não foi possível atualizar o exercício. Tente novamente.");
        }
    };

    return(
        <form onSubmit={handleSubmit} style={{ width: '100%'}}>
            <div style={{ display: 'flex', gap: '10px', aignItems: 'center'}}>
                <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: 3, padding: '8px', boxSizing: 'border-box' }} 
                />
                <input value={sets}
                onChange={(e) => setSets(e.target.value)}
                type='number'
                style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }} 
                />
                <input value={reps}
                onChange={(e) => setReps(e.target.value)}
                type='number'
                style={{ flex: 1, padding: '8px', boxSizing: 'border-box' }}
                />
                <button type='submit' style={{ padding: '8px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
                <button type='button' onClick={onCancel} style={{ padding: '8px 12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
            </div>
        </form>
    );
}

export default EditExerciseForm;