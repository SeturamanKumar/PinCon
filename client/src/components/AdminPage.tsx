import React, { useState, useEffect } from "react";
import type { PinType, User } from "../App";
import Pin from "./Pin";
import './AdminPage.css';

interface AdminPageProps{
    user: User | null | undefined;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
    
    const [allPins, setAllPins] = useState<PinType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllPins = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/pins');
                if(!response.ok){
                    throw new Error('Failed to fetch pins for admin panel.');
                }
                const data = await response.json();
                setAllPins(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAllPins();
    }, []);

    const handleDeletePin = (pinId: string) => {
        console.log(`Admin is deleting pin: ${pinId}`);
    };

    const handleEditPin = (pin: PinType) => {
        console.log('Admin is editing pin:', pin);
    };

    if(loading){ return <div className="loading-message">Loading All Pins...</div> }
    if(error){ return <div className="error-message">Error: {error}</div> }

    return(
        <div className="admin-page-container">
            <h1>Admin Panel: Manage All Pins</h1>
            <div className="image-grid">
                {allPins.map((pin) => (
                    <Pin key={pin.id} pin={pin} user={user} onDelete={handleDeletePin} onEdit={handleEditPin} /> 
                ))}
            </div>
        </div>
    )

}

export default AdminPage;