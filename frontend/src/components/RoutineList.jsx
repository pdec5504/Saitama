import { useState, useEffect } from 'react';
import axios from 'axios';
import RoutineCard from './RoutineCard';
import { FaPlus } from "react-icons/fa";


function RoutineList(){
    const [routines, setRoutines] = useState({});

    useEffect(() => {
        const fetchRoutines = async () => {
            try{
                const res = await axios.get('http://localhost:6001/routines');
                setRoutines(res.data);
                console.log("Data received:", res.data);
            }catch(error){
                console.error("Error fetching routines:", error);
            }
        };
        fetchRoutines();
    }, []);

    return(
        <div>
            <h2>Rotinas</h2>
            {Object.values(routines).map(routine => (
                <RoutineCard key={routine._id} routine={routine} />
            ))}
            <button title= "Adicionar rotina" style={{
                width: '100%',
                padding: '15px',
                marginTop: '10px',
                background: '#f7f7f7',
                border: '1px dashed #ccc',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '20px',
            }}>
                <FaPlus color='#555'/>
            </button>
        </div>
    );
}

export default RoutineList;