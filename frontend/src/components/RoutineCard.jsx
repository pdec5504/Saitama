import { FaPen, FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx"
import './RoutineCard.css';
import { Link } from 'react-router-dom';

function RoutineCard({ routine, onDelete, onEdit, isEditMode, isDragging, dragHandleProps }){
    const handleEditClick = (event) => { event.stopPropagation(); onEdit();}
    const handleDeleteClick = (event) => {
        event.stopPropagation(); 
        if (window.confirm("Tem certeza que deseja apagar essa rotina?")) { 
            onDelete(); 
        }}

    const handleLinkClick = (event) => {
        if (isDragging) {
            event.preventDefault();
        }
    };

    const cardTextContent = (
        <>
            <h3>{routine.name}</h3>
            <p style={{ margin: 0, color: '#666' }}>{routine.weekDay}</p>
        </>
    );

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'white'
        }}>
            {isEditMode && (
                <div {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                    <RxDragHandleDots2 size={20} color="#777" />
                </div>
            )}
            <div style={{ flexGrow: 1 }}>
                {isEditMode ? (
                    <div>{cardTextContent}</div>
                ) : (
                    <Link to={`/routines/${routine._id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleLinkClick}>
                        {cardTextContent}
                    </Link>
                )}
            </div>
            {isEditMode && (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button title="Editar Rotina" onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaPen color="#555" /></button>
                    <button title="Apagar Rotina" onClick={handleDeleteClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaTrash color="#c0392b" /></button>
                </div>
            )}
        </div>
    ); 
}

export default RoutineCard;