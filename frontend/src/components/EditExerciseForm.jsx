import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './EditExerciseForm.css';

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
        <form onSubmit={handleSubmit} className='edit-exercise-form'>
          <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='name-input'
          />
            <div className='sets-reps-group'>
                <input value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    type='number'
                    placeholder='Séries'
                    className='sets-reps-input'
                />
                <input value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    type='number'
                    placeholder='Repetições'
                    className='sets-reps-input'
                />
            </div>
            
                <button type='submit' className="save-button">Salvar</button>
                <button type='button' onClick={onCancel} className="cancel-button">Cancelar</button>
            
        </form>
    );
}

export default EditExerciseForm;