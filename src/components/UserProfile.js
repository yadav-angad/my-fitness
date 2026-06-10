import React, { useState, useEffect } from 'react';
import { saveUserProfile, getUserProfile } from '../storage/userProfileStorage';
import './UserProfile.css';

function UserProfile() {
    const [profile, setProfile] = useState({ name: '', email: '', age: '' });

    useEffect(() => {
        async function fetchProfile() {
            const savedProfile = await getUserProfile();
            setProfile(savedProfile);
        }
        fetchProfile();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        await saveUserProfile(profile);
        alert('Profile saved successfully!');
    };

    return (
        <div className="user-profile-container">
            <h2>User Profile</h2>
            <form className="user-profile-form" onSubmit={handleSave}>
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Email:
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <label>
                    Age:
                    <input
                        type="number"
                        name="age"
                        value={profile.age}
                        onChange={handleInputChange}
                        required
                    />
                </label>
                <button type="submit">Save</button>
            </form>
        </div>
    );
}

export default UserProfile;