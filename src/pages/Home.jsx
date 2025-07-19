import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import mascot from '../assets/gohakohi3.png'; // Import de la mascotte

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {/* Mascotte */}
      <img
        src={mascot}
        alt="Gohako Mascotte"
        className="mascot-logo"
      />

      {/* Ajouter un mot */}
      <div
        className="home-box"
        onClick={() => navigate('/ajouter')}
        style={{ cursor: 'pointer' }}
      >
        <h2>➕ Ajouter un mot</h2>
        <p>Ajoute un nouveau mot à ta liste ! </p>
      </div>

      {/* Chat */}
      <div
        className="home-box"
        onClick={() => navigate('/chat')}
        style={{ cursor: 'pointer' }}
      >
        <h2>💬 Chat</h2>
        <p>Discute avec Gohako et pose-lui tes questions ! </p>
      </div>
    </div>
  );
}

export default Home;
