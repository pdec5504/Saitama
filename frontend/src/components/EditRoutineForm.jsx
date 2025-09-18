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
    fontWeight: 'bold',
    fontSize: '16px'
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box',
    background: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    borderRadius: '4px',
    fontSize: '16px'
};

function EditRoutineForm({ routine, onSave, onCancel }){
    const [name, setName] = useState(routine.name);
    const [weekDay, setWeekDay] = useState(routine.weekDay);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try{
            await axios.put(`http://localhost:3001/routines/${routine._id}`, { name, weekDay });
            toast.success('Routine updated successfully!');
            setTimeout(() => {
                onSave();
            }, 1000)
        }catch(error){
            console.error("Error updating routine:", error);
            toast.error("Could not update routine. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3 style={{ marginTop: 0, textAlign: 'center' }}>Edit Routine</h3>

            <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="routineName" style={{ display: 'block', marginBottom: '5px' }}>Workout Name</label>
                    <input type="text"
                        id='routineName'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>    
                    <label htmlFor="weekDay" style={{ display: 'block', marginBottom: '5px' }}>Day of The Week</label>
                    <select
                        id="weekDay"
                        value={weekDay}
                        onChange={(e) => setWeekDay(e.target.value)}
                        style={inputStyle}
                    >
                        <option>Monday</option>
                        <option>Tuesday</option>
                        <option>Wednesday</option>
                        <option>Thursday</option>
                        <option>Friday</option>
                        <option>Saturday</option>
                        <option>Sunday</option>
                    </select>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type='submit'
                            style={{ ...buttonStyle, background: 'var(--color-primary)' }}>
                        Save
                    </button>
                    <button type='button' onClick={onCancel}
                            style={{ ...buttonStyle, background: 'var(--color-secondary)' }}>
                        Cancel
                    </button>
                </div>
        </form>
    );
}

export default EditRoutineForm;