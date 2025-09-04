import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook para ler parâmetros da URL
import axios from 'axios';

function RoutineDetailPage() {
    const [routine, setRoutine] = useState(null);
    const { id } = useParams(); //read the id from URL

    useEffect(() => {
        const fetchRoutine = async () => {
            try{
                const res = await axios.get(`http://localhost:6001/routines/${id}`);
                setRoutine(res.data)
            } catch(error){
                console.error("Error searching for routine:", error)
            }
        };
    }, [id]);

    if (!routine) {
        return <div>Carregando...</div>
    }

    return(
        <div>
            <h1>{routine.label || 'Treino'}: {routine.name}</h1>
            <p><strong>Dia:</strong>{routine.weekDay}</p>
            <p><strong>Classificação:</strong>{routine.classification || 'Aguardando análise'}</p>

            <hr />

            <h4>Exercícios:</h4>
        </div>
    );
}

export default RoutineDetailPage;