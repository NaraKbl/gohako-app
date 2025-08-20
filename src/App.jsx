// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import AddWord from "./pages/AddWord";
import WordList from "./pages/WordList";
import WordDetail from "./pages/WordDetail";
import Chat from "./components/Chat";
import { supabase } from "./supabase";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ajouter" element={<AddWord />} />
        <Route path="/mots" element={<WordList />} />
        <Route path="/mot/:id" element={<WordDetail />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:wordId" element={<ChatWithWord />} />
      </Routes>
    </Router>
  );
}

// 💬 Composant intermédiaire pour charger la fiche à partir de l’URL et l’envoyer à Chat
function ChatWithWord() {
  const { wordId } = useParams();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWord = async () => {
      const { data, error } = await supabase
        .from("fiches")
        .select("*")
        .eq("id", wordId)
        .single();
      if (!error) {
        setWord(data);
      } else {
        console.error("Erreur chargement fiche pour Chat :", error);
      }
      setLoading(false);
    };
    loadWord();
  }, [wordId]);

  if (loading) return <div>Chargement de la fiche...</div>;
  if (!word) return <div>Fiche introuvable.</div>;

  return <Chat word={word} />;
}

export default App;
