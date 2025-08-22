import React, { useState, useEffect } from "react";
import './App.css';

type User= {
  id: string;
  name: string;
  email: string;
}

function App() {

  const [user, setUser] = useState<User | null>(undefined);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/status', {
          credentials: 'include',
        });
        if(response.ok){
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = () => {
    window.location.href = 'http://localhost:5001/auth/google';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5001/auth/logout';
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
                <span className="user-name">Welcome, {user.name}!</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="main-content">
        <div className="image-grid">
          {/* Image pins go here */}
          <p>Image gallery coming soon...</p>
        </div>
      </main>
    </div>
  );

}

export default App;
