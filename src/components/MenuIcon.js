import React, { useState } from 'react';
import ProfileForm from './ProfileForm';
import './MenuIcon.css';

function MenuIcon() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="menu-icon-container">
            <button className="menu-icon" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </button>
            {isOpen && <ProfileForm onClose={toggleMenu} />}
        </div>
    );
}

export default MenuIcon;