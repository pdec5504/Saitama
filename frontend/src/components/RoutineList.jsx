import { useState, useEffect } from 'react';
import axios from 'axios';
import RoutineCard from './RoutineCard';
import AddRoutineForm from './AddRoutineForm';
import EditRoutineForm from './EditRoutineForm';
import { FaPlus } from "react-icons/fa";
import toast from 'react-hot-toast';


function RoutineList(){
    const [routines, setRoutines] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [activeRoutineId, setActiveRoutineId] = useState(null);
    const [editingRoutineId, setEditingRoutineId] = useState(null);

    const fetchRoutines = async () => {
        try{
            const res = await axios.get('http://localhost:6001/routines');
            setRoutines(res.data)
            return true;
        } catch(error){
            console.error("Error fetching routines:", error);
            return false;
        }
    }

    // call function on first time render
    useEffect(() => {
        fetchRoutines();

        const intervalId = setInterval(async () => {
            const success = await fetchRoutines();
            if (success) {
                clearInterval(intervalId);
            }
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    const handleRoutineAdded = () => {
        fetchRoutines();
        setIsAdding(false);
    }

    const handleDeleteRoutine = async (routineId) => {
        try{
            await axios.delete(`http://localhost:3001/routines/${routineId}`);
            toast.success('Rotina apagada com sucesso!');
            fetchRoutines();
        }catch(error) {
            console.error("Error deleting routine:", error);
            toast.error('Não foi possível apagar a rotina. Tente novamente.');
        }
    }

    const handleToggleExpand = (routineId) => {
        setActiveRoutineId(activeRoutineId === routineId ? null : routineId);
    };

    const handleRoutineUpdated = () => {
        fetchRoutines();
        setEditingRoutineId(null);
    }

    return(
        <div>
            <h2>Rotinas</h2>
            {Object.values(routines).map(routine => (
                <div key={routine._id}>
                    {editingRoutineId === routine._id ? (
                        <EditRoutineForm
                        routine={routine}
                        onSave={handleRoutineUpdated}
                        onCancel={() => setEditingRoutineId(null)}
                        />
                    ):(
                        <RoutineCard 
                        key={routine._id} 
                        routine={routine} 
                        onDataChange={fetchRoutines}
                        onDelete={() => handleDeleteRoutine(routine._id)}
                        onEdit={() => setEditingRoutineId(routine._id)}
                        isExpanded={activeRoutineId === routine._id}
                        onToggleExpand={() => handleToggleExpand(routine._id)}
                        />
                    )}
                </div>
            ))}

            {isAdding ? (
                <AddRoutineForm
                onRoutineAdded={handleRoutineAdded}
                onCancel={() => setIsAdding(false)}
                />
            ):(
                <button title='Adicionar Rotina'
                onClick={() => setIsAdding(true)}
                style={{
                    width: '100%', 
                    padding: '15px', 
                    marginTop: '10px', 
                    background: '#f7f7f7', 
                    border: '1px dashed #ccc', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '20px'
                }}>
                    <FaPlus color='#555'/>
                </button>
            )}
        </div>
    );
}

export default RoutineList;