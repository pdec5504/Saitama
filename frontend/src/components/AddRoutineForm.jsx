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

function AddRoutineForm({ onRoutineAdded, onCancel}) {
    const [name, setName] = useState('')
    const [weekDay, setWeekDay] = useState('Monday') //default value

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            // alert("Insira um nome para a rotina!")
            toast.error("Please enter a name for the routine.");
            return;
        }

        try{
            await axios.post('http://localhost:3001/routines', {
                name: name,
                weekDay: weekDay
            });
            toast.success("Routine added successfully!")
            setTimeout(() => {
                onRoutineAdded();
            }, 1000)
        } catch(error){
            console.error("Error adding routine:", error);
            toast.error("Could not add routine. Please try again.");
        }
    };

    return (
            <form onSubmit={handleSubmit}>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>New Routine</h3>
                
                <div style={{ marginBottom: '10px'}}>
                    <label htmlFor="routineName" style={{display: 'block', marginBottom: '5px'}}>Workout Name</label>
                    <input type="text"
                    id='routineName'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='E.g., Chest and Biceps'
                    style={{ width: '100%', 
                            padding: '8px', 
                            boxSizing: 'border-box', 
                            background: 'var(--color-background)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)',
                            borderRadius: '4px'}} 
                            />
                </div>
                <div style={{ marginBottom: '15px'}}>
                    <label htmlFor="weekDay" style={{display: 'block', marginBottom: '5px'}}>Day of The Week</label>
                    <select id="weekDay"
                    value={weekDay}
                    onChange={(e) => setWeekDay(e.target.value)}
                    style={{ 
                        width: '100%', 
                        padding: '8px',
                        background: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        borderRadius: '4px'
                        }}>
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px'}}>
                    <button type='submit' style={{ ...buttonStyle, background: 'var(--color-primary)' }}>
                        Add
                    </button>
                    <button type='button' onClick={onCancel} style={{...buttonStyle, background: 'var(--color-secondary)' }}>
                        Cancel
                    </button>
                </div>
            </form>
    );
}

export default AddRoutineForm;