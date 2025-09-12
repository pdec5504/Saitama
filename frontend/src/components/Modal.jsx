import React from "react";
import './Modal.css';

function Modal ({ isOpen, onClose, children }) {
    if (!isOpen) {
        return null
    }

    const handleContentClick = (e) => {
        e.stopPropagation();
    }

    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                {children}
            </div>
        </div>
    );
}

export default Modal;