import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AddRoutineForm({ onRoutineAdded, onCancel}) {
    const [name, setName] = useState('')
    const [weekDay, setWeekDay] = useState('Segunda-feira') //default value

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            // alert("Insira um nome para a rotina!")
            toast.error("Insira um nome para a rotina!");
            return;
        }

        try{
            await axios.post('http://localhost:3001/routines', {
                name: name,
                weekDay: weekDay
            });
            toast.success("Rotina adicionada com sucesso!")
            setTimeout(() => {
                onRoutineAdded();
            })
        } catch(error){
            console.error("Error adding routine:", error);
            toast.error("Não foi possível adicionar a rotina. Tente novamente.");
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '15px', background: '#f9f9f9'}}>
            <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0}}>Nova Rotina</h3>
                <div style={{ marginBottom: '10px'}}>
                    <label htmlFor="routineName" style={{display: 'block', marginBottom: '5px'}}>Nome do Treino</label>
                    <input type="text"
                    id='routineName'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Exemplo: Treino de Peito e Bíceps'
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box'}} />
                </div>
                <div style={{ marginBottom: '15px'}}>
                    <label htmlFor="weekDay" style={{display: 'block', marginBottom: '5px'}}>Dia da Semana</label>
                    <select id="weekDay"
                    value={weekDay}
                    onChange={(e) => setWeekDay(e.target.value)}
                    style={{ width: '100%', padding: '8px'}}>
                        <option>Segunda-feira</option>
                        <option>Terça-feira</option>
                        <option>Quarta-feira</option>
                        <option>Quinta-feira</option>
                        <option>Sexta-feira</option>
                        <option>Sábado</option>
                        <option>Domingo</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px'}}>
                    <button type='submit' style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Adicionar
                    </button>
                    <button type='button' onClick={onCancel} style={{flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddRoutineForm;