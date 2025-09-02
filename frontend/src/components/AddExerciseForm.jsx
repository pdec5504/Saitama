import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '15px', marginBottom: '10px', background: '#fafafa' }}>
            <form onSubmit={handleSubmit}>
                <h5 style={{ marginTop: 0, marginBottom: '10px' }}>Adicionar Novo Exercício</h5>
                <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Nome do exercício'
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }} 
                />
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    placeholder='Séries'
                    type='number'
                    style={{ width: '50%', padding: '8px', boxSizing: 'border-box'}} 
                    />
                    <input 
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder='Repetições'
                    type='number'
                    style={{ width: '50%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px'}}>
                    <button type='submit' style={{ flex: 1, padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
                        Adicionar
                    </button>
                    <button type="button" onClick={onCancel} style={{ flex: 1, padding: '8px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddExerciseForm;