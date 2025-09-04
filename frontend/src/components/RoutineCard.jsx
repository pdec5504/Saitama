import { FaPen, FaTrash, FaChevronDown, FaPlus } from "react-icons/fa";
import './RoutineCard.css';
import AddExerciseForm from './AddExerciseForm'; 
import EditExerciseForm from "./EditExerciseForm";
import axios from "axios";
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

function RoutineCard({ routine }){
    return(
        <Link to={`/routines/${routine._id}`}style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ margin: 0, color: '#666' }}>{routine.name}</p>
                    </div>
                </div>
            </div>
        </Link>
    )    
}

export default RoutineCard;