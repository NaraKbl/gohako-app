import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./AddWord.css";
import writingPng from "../assets/gohakowrite.png";
import { supabase } from "../supabaseClient";

export default function AddWord() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [fiche, setFiche] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setFiche(null);

    const messages = [
      {
        role: "system",
        content:
          "Tu es japonaise, professeure de japonais depuis plus de 10 ans en France, et tu maîtrises toutes les meilleures techniques d’apprentissage de langue en général, et plus particulièrement du japonais. Tu n’enseignes que le vrai japonais parlé par les locaux, avec les expressions courantes, notamment chez les jeunes, et tu évites toute traduction littérale ou pompeuse. Tu t’adaptes aux évolutions du langage au fil du temps. Tu es très douce et bienveillante, avec une touche d’humour, et tu seras ma professeure particulière pour m’aider à parler couramment le plus rapidement possible. Tu dois me tutoyer."
      },
      {
        role: "user",
        content: `À partir du mot ou de la phrase suivante : "${input}", crée une fiche pédagogique et renvoie uniquement un objet JSON au format suivant :
{
  "id": "uuid",
  "kanji": "...",
  "kana": "...",
  "fr": "...",
  "analyse": "...",
  "exemples": [
    { "niveau": "facile", "phrase": "...", "traduction": "...", "explication": "..." },
    { "niveau": "intermédiaire", "phrase": "...", "traduction": "...", "explication": "..." },
    { "niveau": "avancé", "phrase": "...", "traduction": "...", "explication": "..." }
  ],
  "humour": "Une note drôle ou astuce mnémotechnique (tu dois me tutoyer)."
}
Ne mets aucun texte en dehors de cet objet JSON. Dans la partie "phrase", si tu écris avec des kanjis dans tes exemples, ajoute l'écriture du kanji en hiragana après le mot.`
      }
    ];

    let parsed;
    try {
      const resAI = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: "gpt-4", messages, temperature: 0.5 })
      });
      if (!resAI.ok) throw new Error(`OpenAI ${resAI.status}`);
      const data = await resAI.json();
      const raw = data.choices[0].message.content.trim();
      try {
        parsed = JSON.parse(raw);
      } catch {
        const m = raw.match(/\{[\s\S]*\}/);
        parsed = m ? JSON.parse(m[0]) : null;
      }
      if (!parsed) throw new Error("Impossible d'extraire le JSON");
    } catch (err) {
      console.error("Erreur génération fiche :", err);
      alert(`Erreur lors de la génération :\n${err.message}`);
      setLoading(false);
      return;
    }

    const newFiche = { ...parsed, id: uuidv4() };
    setFiche(newFiche);
    try {
      const { error } = await supabase.from("fiches").insert([newFiche]);
      if (error) throw error;
    } catch (err) {
      console.error("Erreur ajout fiche :", err);
      alert(`Erreur création fiche :\n${err.message}`);
      setLoading(false);
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addword-container">
      <h2>➕ Ajouter un mot</h2>
      <input
        type="text"
        placeholder="Ex : 美味しい"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="addword-input"
        disabled={loading}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !input.trim()}
        className="addword-button"
      >
        {loading ? "Génération..." : "Générer la fiche"}
      </button>

      {loading && (
        <>
          <img
            src={writingPng}
            alt="Gohako écrit"
            className="loading-mascot"
          />
          <p className="loading-message">
            Un instant, Gohako prépare ta fiche...
          </p>
        </>
      )}

      {fiche && (
        <div className="fiche-card">
          <div className="kanji-large">{fiche.kanji || fiche.kana}</div>
          {fiche.kana && <p className="kana">{fiche.kana}</p>}
          <p className="traduction">{fiche.fr}</p>
          <div className="section-analyse">
            <h4>Analyse grammaticale :</h4>
            <pre>{fiche.analyse}</pre>
          </div>
          <div className="section-analyse">
            <h4>Exemples :</h4>
            {fiche.exemples.map((ex, i) => (
              <div key={i} className="exemple-block">
                {"phrase" in ex ? (
                  <>
                    <p>
                      <strong>{ex.niveau} :</strong> {ex.phrase}
                    </p>
                    <p>🔸 {ex.traduction}</p>
                    <p>💡 {ex.explication}</p>
                  </>
                ) : (
                  <p>{ex}</p>
                )}
              </div>
            ))}
          </div>
          <div className="section-humour">
            <h4>Note drôle :</h4>
            <p>{fiche.humour}</p>
          </div>
          <Link to="/mots" className="retour-btn">
            ⬅️ Retour à la liste
          </Link>
        </div>
      )}
    </div>
  );
}

