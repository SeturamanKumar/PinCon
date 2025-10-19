import React from "react";
import { type PinType, type User } from "../App";
import Pin from "./Pin";
import './AdminPage.css';

interface AdminPageProps{
    user: User | null | undefined;
    pins: PinType[];
    onDelete: (pinId: string) => void;
    onEdit: (pin: PinType) =>  void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, pins, onDelete, onEdit }) => {

    return(
        <div className="admin-page-container">
            <h1>Admin Panel: Manage All Pins</h1>
            <div className="image-grid">
                {pins.map((pin) => (
                    <Pin key={pin.id} pin={pin} user={user} onDelete={onDelete} onEdit={onEdit} /> 
                ))}
            </div>
        </div>
    )

}

export default AdminPage;