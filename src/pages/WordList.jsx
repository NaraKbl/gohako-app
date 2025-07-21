import React, { useEffect, useState, useMemo } from "react";
import WordCard from "../components/WordCard";
import "./WordList.css";
import { toRomaji } from "wanakana";
import { supabase } from "../supabase";

function WordList() {
  const [mesFiches, setMesFiches] = useState([]);
  const [sortOption, setSortOption] = useState("recent");

  // Charger les fiches depuis Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("fiches")
          .select("*")
          .order("created_at", { ascending: false }); // plus récentes d'abord

        if (error) throw error;
        setMesFiches(data);
      } catch (err) {
        console.error("Erreur chargement fiches :", err.message);
      }
    };
    load();
  }, []);

  // Supprimer une fiche
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from("fiches").delete().eq("id", id);
      if (error) throw error;
      setMesFiches(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error("Erreur suppression fiche :", err.message);
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
