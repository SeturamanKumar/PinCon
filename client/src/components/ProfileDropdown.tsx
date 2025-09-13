import React from "react";
import './ProfileDropdown.css';

interface ProfileDropdownProps {
    userName: string | null;
    onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ userName, onLogout }) => {
    return(
        <div className="dropdown-menu">
            <div className="dropdown-header">
                <p>{userName || 'User'}</p>
            </div>
            <ul className="dropdown-list">
                <li className="dropdown-item" onClick={onLogout}>
                    Logout
                </li>
            </ul>
        </div>
    );
};

export default ProfileDropdown;