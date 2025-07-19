// src/pages/WordList.jsx
import React, { useEffect, useState, useMemo } from "react";
import WordCard from "../components/WordCard";
import "./WordList.css";
import { toRomaji } from "wanakana";

const API_URL = "https://api-gohako.onrender.com";

function WordList() {
  const [mesFiches, setMesFiches] = useState([]);
  const [sortOption, setSortOption] = useState("recent"); // 'recent', 'oldest', 'alpha'

  // Charger les fiches depuis json-server (Render)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/fiches`, {
          cache: "no-store"
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMesFiches(data);
      } catch (err) {
        console.error("Erreur chargement fiches :", err);
      }
    };
    load();
  }, []);

  // Supprimer une fiche
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/fiches/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMesFiches(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Erreur suppression fiche :", err);
    }
  };

  // Tri des fiches
  const sortedFiches = useMemo(() => {
    const list = [...mesFiches];
    if (sortOption === "alpha") {
      list.sort((a, b) => {
        const romA = toRomaji(a.kana || a.kanji).toLowerCase();
        const romB = toRomaji(b.kana || b.kanji).toLowerCase();
        return romA.localeCompare(romB, "en", { sensitivity: "base" });
      });
    } else if (sortOption === "oldest") {
      list.reverse();
    }
    return list;
  }, [mesFiches, sortOption]);

  return (
    <div className="wordlist-container">
      <h2>📚 Mes mots</h2>

      <div className="sort-control">
        <label htmlFor="sort">Trier par :</label>
        <select
          id="sort"
          className="sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="recent">Plus anciennes</option>
          <option value="oldest">Plus récentes</option>
          <option value="alpha">A-Z (romaji)</option>
        </select>
      </div>

      <div className="card-list">
        {sortedFiches.length === 0 ? (
          <p>Tu n'as encore ajouté aucun mot.</p>
        ) : (
          sortedFiches.map((fiche) => (
            <WordCard
              key={fiche.id}
              word={fiche}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default WordList;
