import React from "react";
import type { PinType } from "../App";
import './Pin.css';

type User = {
    id: string;
    name: string | null;
    email: string;
    profileImageUrl: string | null;
}

interface PinProps {
    pin: PinType;
    user: User | null | undefined;
    onDelete: (pinId: string) => void;
    onEdit: (pin: PinType) => void;
}

const Pin: React.FC<PinProps> = ({ pin, user, onDelete, onEdit }) => {

    const isOwner = user && user.id === pin.authorId;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm('Are you sure you want to delete this pin?')) {
            onDelete(pin.id);
        }
    };

    const handleEdit = (e: React.FormEvent) => {
        e.stopPropagation();
        onEdit(pin);
    };

    return(
        <div className="pin-container">
            <img className="pin-image" src={pin.imageUrl} alt={pin.description || 'Pin image'} />
            <div className="pin-overlay">
                {pin.description && (
                    <p className="pin-description">{pin.description}</p>
                )}
                {isOwner && (
                    <div className="pin-actions">
                        <button className="action-btn edit-btn" onClick={handleEdit}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="20" height="20" 
                                viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" strokeWidth="2" 
                                strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </button>
                        <button className="action-btn delete-btn" onClick={handleDelete}>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="20" height="20" 
                                viewBox="0 0 24 24" fill="none" 
                                stroke="currentColor" strokeWidth="2" 
                                strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pin;