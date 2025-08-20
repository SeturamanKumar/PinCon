import React from "react";
import './App.css';
import Pin from "./components/Pin";
import './components/Pin.css';

const samplePins = [
  { id: 1, imageUrl: 'https://placehold.co/400x600/F44336/FFFFFF?text=Pin+1', description: 'A beautiful red pin.' },
  { id: 2, imageUrl: 'https://placehold.co/400x500/2196F3/FFFFFF?text=Pin+2', description: 'A lovely blue pin.' },
  { id: 3, imageUrl: 'https://placehold.co/400x700/4CAF50/FFFFFF?text=Pin+3', description: 'A vibrant green pin.' },
  { id: 4, imageUrl: 'https://placehold.co/400x450/FFC107/FFFFFF?text=Pin+4', description: 'A sunny yellow pin.' },
  { id: 5, imageUrl: 'https://placehold.co/400x550/9C27B0/FFFFFF?text=Pin+5', description: 'A majestic purple pin.' },
  { id: 6, imageUrl: 'https://placehold.co/400x650/E91E63/FFFFFF?text=Pin+6', description: 'A stunning pink pin.' },
];

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
          {samplePins.map(pin => (
            <Pin 
              key={pin.id}
              imageUrl={pin.imageUrl}
              description={pin.description}
            />
          ))}
        </div>
      </main>
    </div>
  );

}

export default App;
