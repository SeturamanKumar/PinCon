import React from "react";
import './App.css';

function App() {

  return(
    <div className="app-container">
      <header className="app-header">
        <nav className="header-nav">
          <h1 className="logo">PinCon</h1>
          <div className="nav-buttons">
            <button className="btn btn-secondary">
              Login
            </button>
            <button className="btn btn-primary">
              Sign up
            </button>
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
