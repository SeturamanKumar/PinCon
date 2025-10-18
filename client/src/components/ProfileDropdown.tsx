import React from "react";
import { Link } from "react-router-dom";
import type { User } from "../App";
import './ProfileDropdown.css';

interface ProfileDropdownProps {
    user: User | null;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onLogout, isOpen, onClose }) => {
    return(
        <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
                <p>{user?.name || 'User'}</p>
            </div>
            <ul className="dropdown-list">
                <li className="dropdown-item" onClick={onClose}>
                    <Link to="/">Home</Link>
                </li>
                <li className="dropdown-item" onClick={onClose}>
                    <Link to="/profile">My Pins</Link>
                </li>
                {user && user.role === 'ADMIN' && (
                    <li className="dropdown-item" onClick={close}>
                        <Link to="/admin">Admin Panel</Link>
                    </li>
                )}
                <li className="dropdown-item" onClick={onLogout}>
                    Logout
                </li>
            </ul>
        </div>
    );
};

export default ProfileDropdown;