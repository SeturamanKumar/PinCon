import React, { useState } from "react";
import './UploadModal.css';
import { API_BASE_URL } from "../App";

interface UploadModalProps {
    onClose: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose }) => {

    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.files && event.target.files[0]){
            const file = event.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if(!imageFile){
            alert('Please select an image to upload.');
            return;
        }

        setIsUploading(true)

        const formData = new FormData();
        formData.append('image', imageFile);  // we gave to our multer middleware on the server: .single('image').
        formData.append('description', description);

        try {
            const response = await fetch(`${API_BASE_URL}/api/pins`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if(response.ok){
                alert('Pin created successfully!');
                window.location.reload();
            } else {
                const errorData = await response.json();
                alert(`Upload failed ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
            onClose();
        }
    };

    return(
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <h2>Create a new Pin</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="image">Image</label>
                        <input 
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />
                        {previewUrl && <img src={previewUrl} alt="Preview" className="image-preview" />}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea 
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {isUploading ? 'Uploading...': 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );

}

export default UploadModal;