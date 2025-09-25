import React, { useState, useEffect } from "react";
import type { User } from "../App";
import './EditProfileModal.css';

interface EditProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (formData: FormData) =>  Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name || '');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImageUrl);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files && event.target.files[0]){
            const file = event.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        formData.append('name', name);
        if(imageFile){
            formData.append('image', imageFile);
        }
        
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save profile', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group prfile-image-group">
                        <img 
                            src={previewUrl || `https://placehold.co/100x100/E8C3A0/232322?text=${name.charAt(0).toUpperCase() || 'U'}`} 
                            alt="Profile Preview"
                            className="profile-image-preview"
                        />
                        <label htmlFor="image" className="btn btn-secondary">Change Picture</label>
                        <input 
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input 
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;