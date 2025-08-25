import React, { useState, useEffect } from "react";
import './App.css';
import Pin from "./components/Pin";
import UploadModal from "./components/UploadModal";
import ProfileDropdown from "./components/ProfileDropdown";
import EditPinModal from "./components/EditPinModal";

export type PinType = {
  id: string;
  imageUrl: string;
  description: string | null;
  author: {
    name: string | null;
  };
  authorId: string;
};

type User = {
  id: string;
  name: string | null;
  email: string;
  profileImageUrl: string | null;
};

function App() {

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pins, setPins] = useState<PinType[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<PinType | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await fetch('http://localhost:5001/api/auth/status', {
          credentials: 'include',
        });
        const userData = await authResponse.json();
        setUser(userData);

        const pinsResponse = await fetch('http://localhost:5001/api/pins');
        const pinsData = await pinsResponse.json();
        setPins(pinsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setUser(null);
      }
    };
    fetchData();
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5001/auth/logout';
  };

  const handleDeletePin = async (pinId: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/pins/${pinId}`, {
        method: 'DELETE',
        credentials:'include',
      });
      if(response.ok){
        setPins(pins.filter(pin => pin.id !== pinId));
        alert('Pin deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete pin: ${errorData}`);
      }
    } catch (error) {
      console.error('Error deleting pin:', error);
      alert('An error occured while deleting the pin.');
    }
  };

  const handleEditPin = (pin: PinType) => {
    setEditingPin(pin);
  };

  const handleSavePin = async (pinId: string, newDescription: string) => {
    try {
      const response = await fetch(`http://localhost:5001/api/pins/${pinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ description: newDescription }),
      });
      if(response.ok){
        const UpdatedPin = await response.json();
        setPins(pins.map(p => (p.id === pinId ? UpdatedPin : p)));
        alert('Pin updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update pin: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating pins:', error);
      alert(`An error occured while trying tto update pin.`);
    }
  };

  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  };

  return(
    <div className="app-container">
      <header className="app-header">
        <nav className="header-nav">
          <h1 className="logo">PinCon</h1>
          <div className="nav-buttons">
            {user === undefined && null}
            {user === null && (
              <>
                <button onClick={handleLogin} className="btn btn-secondary">
                  Login
                </button>
                <button onClick={handleLogin} className="btn btn-primary">
                  Sign up
                </button>
              </>
            )}
            {user && (
              <>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary create-btn-desktop">
                  Create
                </button>
                <div className="profile-container">
                  <img 
                    src={user.profileImageUrl || `https://placehold.co/40x40/E8C3A0/232323?text=${getUserInitial()}`} 
                    alt="User Profile"
                    className="profile-picture"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  />
                  {isDropdownOpen && (
                    <ProfileDropdown 
                      userName={user.name}
                      onLogout={handleLogout}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="main-content">
        <div className="image-grid">
          {pins.map((pin) => (
            <Pin key={pin.id} pin={pin} user={user} onDelete={handleDeletePin} onEdit={handleEditPin}/>
          ))}
        </div>
      </main>
      {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)}/>}
      {editingPin && (
        <EditPinModal pin={editingPin} onSave={handleSavePin} onClose={() => setEditingPin(null)}/>
      )}
    </div>
  );

}

export default App;
