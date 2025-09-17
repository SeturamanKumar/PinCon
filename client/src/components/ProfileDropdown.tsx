import React from "react";
import { Link } from "react-router-dom";
import './ProfileDropdown.css';

interface ProfileDropdownProps {
    userName: string | null;
    onLogout: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userName, onLogout, isOpen, onClose }) => {
    return(
        <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
            <div className="dropdown-header">
                <p>{userName || 'User'}</p>
            </div>
            <ul className="dropdown-list">
                <li className="dropdown-item" onClick={onClose}>
                    <Link to="/">Home</Link>
                </li>
                <li className="dropdown-item" onClick={onClose}>
                    <Link to="/profile">My Pins</Link>
                </li>
                <li className="dropdown-item" onClick={onLogout}>
                    Logout
                </li>
            </ul>
        </div>
    );
};

export default ProfileDropdown;