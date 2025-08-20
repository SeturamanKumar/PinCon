import React from "react";
import './Pin.css';

interface PinProps {
    imageUrl: string;
    description: string;
}

const Pin: React.FC<PinProps> = ({ imageUrl, description }) => {

    return(
        <div className="pin">
            <img 
                src={imageUrl} 
                alt={description}
                className="pin-image"
            />
            <div className="pin-overlay">
                <p>{description}</p>
            </div>
        </div>
    );

};

export default Pin;