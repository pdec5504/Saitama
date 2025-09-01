import { useState, useEffect } from 'react';
import axios from 'axios';
import RoutineCard from './RoutineCard';
import AddRoutineForm from './AddRoutineForm';
import { FaPlus } from "react-icons/fa";


function RoutineList(){
    const [routines, setRoutines] = useState({});
    const [isAdding, setIsAdding] = useState(false);

    const fetchRoutines = async () => {
        try{
            const res = await axios.get('http://localhost:6001/routines');
            setRoutines(res.data)
        } catch(error){
            console.error("Error fetching routines:", error);
        }
    }

    // useEffect(() => {
    //     const fetchRoutines = async () => {
    //         try{
    //             const res = await axios.get('http://localhost:6001/routines');
    //             setRoutines(res.data);
    //             console.log("Data received:", res.data);
    //         }catch(error){
    //             console.error("Error fetching routines:", error);
    //         }
    //     };
    //     fetchRoutines();
    // }, []);

    // call function on first time render
    useEffect(() => {
        fetchRoutines();
    }, []);

    const handleRoutineAdded = () => {
        fetchRoutines();
        setIsAdding(false);
    }

    return(
        <div>
            <h2>Rotinas</h2>
            {Object.values(routines).map(routine => (
                <RoutineCard 
                key={routine._id} 
                routine={routine} 
                onDataChange={fetchRoutines}
                />
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