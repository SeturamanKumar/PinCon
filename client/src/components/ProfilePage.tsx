import React, { useState, useEffect } from "react";
import type { PinType, User } from "../App";
import Pin from "./Pin";
import EditProfileModal from "./EditProfileModal";
import './ProfilePage.css';

interface ProfilePageProps {
    user: User | null | undefined;
    onUpdateUser: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {

    const [userPins, setUserPins] = useState<PinType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if(user){
            const fetchUserPins = async () => {
                try{
                    const response = await fetch('http://localhost:5001/api/my-pins', {
                        credentials: 'include',
                    });
                    if(!response.ok){
                        throw new Error('Failed to fetch your pins!');
                    }
                    const data = await response.json();
                    setUserPins(data);
                } catch(err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchUserPins();
        } else if(user === null){
            setError('Please log in to see your pins.');
            setLoading(false);
        }
    }, [user]);

    const handleDeletePin = async (pinId: string) => {
        if(!window.confirm('Are you sure you want to delete the pin?')){
            return;
        }
        try{
            const response = await fetch(`http://localhost:5001/api/pins/${pinId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch your pins!');
            } else {
                const errorData = await response.json();
                alert(`Failed to delete pin: ${errorData.message}`);
            }
        } catch(error) {
            console.error('Error deleting pin:', error);
            alert('An error occured while deleting the pin.');
        }
    };

    const handleEditPin = (pin: PinType) => {
        alert(`Editing Pin: ${pin.description}`)
        console.log('Editing Pin:', pin);
    }

    const handleSaveProfile = async (formData: FormData) => {
        try{
            const response = await fetch('http://localhost:5001/api/users/me', {
                method: 'PUT',
                credentials: 'include',
                body: formData,
            });
            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload profile.');
            }
            const updatedUser = await response.json();
            onUpdateUser(updatedUser);
            alert('Profile updated successfully');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`Update failed: ${error.message}`);
            throw error;
        }
    }

    if(loading){
        return <div className="loading-message">Loading Your Pins...</div>
    }
    if(error){
        return <div className="error-message">Error: {error}</div>
    }

    return(
        <>
            <div className="profile-page-container">
                <div className="profile-header">
                    <h1>My Pins</h1>
                    {user && (
                        <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
                            Edit Profile
                        </button>
                    )}
                </div>
                {userPins.length === 0 ? (
                    <p>You haven't created any pins yet.</p>
                ) : (
                    <div className="image-grid">
                        {userPins.map((pin) => (
                            <Pin
                                key={pin.id}
                                pin={pin}
                                user={user}
                                onDelete={handleDeletePin}
                                onEdit={handleEditPin}
                            />
                        ))}
                    </div>
                )}
            </div>
            {isEditModalOpen && user && (
                <EditProfileModal
                    user={user}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSaveProfile}
                />
            )}
        </>
    )

}

export default ProfilePage;