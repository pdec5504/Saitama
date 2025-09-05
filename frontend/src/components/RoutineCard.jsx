import { FaPen, FaTrash } from "react-icons/fa";
import './RoutineCard.css';
import { Link } from 'react-router-dom';

function RoutineCard({ routine, onDelete, onEdit, isEditMode }){
    const handleEditClick = (event) => { event.stopPropagation(); onEdit();}
    const handleDeleteClick = (event) => {
        event.stopPropagation(); 
        if (window.confirm("Tem certeza que deseja apagar essa rotina?")) { 
            onDelete(); 
        }}

    return(
        <div style={{ position: 'relative '}}>
            <Link to={`/routines/${routine._id}`}style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>{routine.name}</h3>
                    <p style={{ margin: 0, color: '#666' }}>{routine.weekDay}</p>
                </div>
            </Link>
            {isEditMode && (
                <div style={{position: 'absolute', top: '50%', right: '15px', transform: 'translateY(-50%)', display: 'flex', gap: '10px'}}>
                    <button title="Editar Rotina" onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaPen color="#555" /></button>
                    <button title="Apagar Rotina" onClick={handleDeleteClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaTrash color="#c0392b" /></button>
                </div>
            )}
        </div>
    );    
}

export default RoutineCard;