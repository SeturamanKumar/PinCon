import React from "react";
import type { PinType } from "../App";
import './Pin.css';

interface PinProps {
    pin: PinType;
}

const Pin: React.FC<PinProps> = ({ pin }) => {
    return(
        <div className="pin-container">
            <img className="pin-image" src={pin.imageUrl} alt={pin.description || 'Pin image'} />
            {pin.description && (
                <p className="pin-description">{pin.description}</p>
            )}
        </div>
    );
};

export default Pin;