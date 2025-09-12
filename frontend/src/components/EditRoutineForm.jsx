import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const buttonStyle = {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
    fontWeight: 'bold'
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px'
};

function EditRoutineForm({ routine, onSave, onCancel }){
    const [name, setName] = useState(routine.name);
    const [weekDay, setWeekDay] = useState(routine.weekDay);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            await axios.put(`http://localhost:3001/routines/${routine._id}`, { name, weekDay });
            toast.success('Rotina atualizada com sucesso!');
            setTimeout(() => {
                onSave();
            }, 1000)
        }catch(error){
            console.error("Error updating routine:", error);
            toast.error("Não foi possível atualizar a rotina. Tente novamente.");
        }
    };

    return(
        <div style={{ border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '15px',
            background: 'var(--color-surface)' 
        }}>
            <form onSubmit={handleSubmit}>
                <h3 style={{marginTop: 0}}>Editar Rotina</h3>
                <div style={{ marginBottom: '10px'}}>
                    <label htmlFor="routineName" style={{display: 'block', marginBottom: '5px'}}>Nome do Treino</label>
                    <input type="text"
                    id='routineName'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: '15px'}}>
                    <label htmlFor="weekDay" style={{display: 'block', marginBottom: '5px'}}>Dia da Semana</label>
                    <select 
                    id="weekDay"
                    value={weekDay}
                    onChange={(e) => setWeekDay(e.target.value)}
                    style={inputStyle}
                    >
                        <option>Segunda-feira</option>
                        <option>Terça-feira</option>
                        <option>Quarta-feira</option>
                        <option>Quinta-feira</option>
                        <option>Sexta-feira</option>
                        <option>Sexta-feira</option>
                        <option>Domingo</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type='submit'
                    style={{ ...buttonStyle, background: 'var(--color-primary)'}}>
                        Salvar
                    </button>
                    <button type='button' onClick={onCancel} 
                    style={{ ...buttonStyle, background: 'var(--color-secondary)' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditRoutineForm;