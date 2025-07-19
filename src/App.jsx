import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import AddWord from './pages/AddWord';
import WordList from './pages/WordList';
import WordDetail from './pages/WordDetail';
import Chat from './components/Chat'; // Chemin corrigé vers components/Chat

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Page d'accueil avec encadrés Ajouter un mot et Chat */}
        <Route path="/" element={<Home />} />
        {/* Routes séparées si nécessaire */}
        <Route path="/ajouter" element={<AddWord />} />
        <Route path="/mots" element={<WordList />} />
        <Route path="/mot/:id" element={<WordDetail />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;

