import { useState, useEffect } from 'react';
import axios from 'axios';

const RoutineCard = ({ routine }) => (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '10px'}}>
        <h3>{routine.name}</h3>
        <p><strong>Dia: </strong>{routine.weekDay}</p>
    </div>
);

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
        </div>
    );
}

export default RoutineList;