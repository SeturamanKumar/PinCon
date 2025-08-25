import React, { useState } from "react";
import './EditPinModal.css';
import type { PinType } from "../App";

interface EditPinModal {
    pin: PinType;
    onClose: () => void;
    onSave: (pinId: string, newDescription: string) => void;
}

const EditPinModal: React.FC<EditPinModal> = ({ pin, onClose, onSave}) => {

    const [description, setDescription] = useState(pin.description || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            await onSave(pin.id, description);
            onClose();
        } catch (error) {
            console.error('Failed to save pin');
            alert('Failed to save pin. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Edit Pin</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <img src={pin.imageUrl} alt="Pin preview" className="image-preview" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea  
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={4}
                        />
                    </div>
                    <button type="submit" className="btn tbn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    )

}

export default EditPinModal;