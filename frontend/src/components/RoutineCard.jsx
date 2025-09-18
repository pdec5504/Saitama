import { FaPen, FaTrash } from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx"
import { Link } from 'react-router-dom';

function RoutineCard({ routine, onDelete, onEdit, isEditMode, isDragging, dragHandleProps }){
    const handleEditClick = (event) => { event.stopPropagation(); onEdit();}
    const handleDeleteClick = (event) => {
        event.stopPropagation(); 
        if (window.confirm("Are you sure you want to delete this routine?")) { 
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
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>{routine.weekDay}</p>
        </>
    );

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)'
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
                    <button title="Edit Routine" onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaPen color="#555" /></button>
                    <button title="Delete Routine" onClick={handleDeleteClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaTrash color="#c0392b" /></button>
                </div>
            )}
        </div>
    ); 
}

export default RoutineCard;