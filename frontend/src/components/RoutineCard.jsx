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

    return (
    <div style={{ position: 'relative' }}>
      {isEditMode ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              {...dragHandleProps}
              title="Arrastar"
              onClick={(e) => e.preventDefault()}
              style={{ cursor: 'grab', userSelect: 'none', display: "flex", alignItems: "center" }}
            >
              <RxDragHandleDots2 size={20} color="#777" />
            </div>

            <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>{routine.name}</h3>
              <p style={{ margin: 0, color: '#666' }}>{routine.weekDay}</p>
            </div>
          </div>
        </div>
      ) : (
        <Link to={`/routines/${routine._id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleLinkClick}>
          <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 15, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>{routine.name}</h3>
            <p style={{ margin: 0, color: '#666' }}>{routine.weekDay}</p>
          </div>
        </Link>
      )}

      {isEditMode && (
        <div style={{ position: 'absolute', top: '50%', right: 15, transform: 'translateY(-50%)', display: 'flex', gap: 10 }}>
          <button title="Editar Rotina" onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
            <FaPen color="#555" />
          </button>
          <button title="Apagar Rotina" onClick={handleDeleteClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
            <FaTrash color="#c0392b" />
          </button>
        </div>
      )}
    </div>
  ); 
}

export default RoutineCard;