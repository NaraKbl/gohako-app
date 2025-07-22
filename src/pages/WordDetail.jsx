import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuestionModal from "../components/QuestionModal";
import "./WordDetail.css";
import { supabase } from "../supabase";

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fiche, setFiche] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Charger la fiche et ses questions
useEffect(() => {
  console.log("🔍 id reçu :", id);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      // Chargement de la fiche (par son ID)
      const { data: ficheData, error: ficheErr } = await supabase
        .from("fiches")
        .select("*")
        .eq("id", id)
        .single();
      console.log("➡️ Résultat ficheData :", ficheData);
      console.log("⚠️ ficheErr :", ficheErr);

      if (ficheErr || !ficheData) throw new Error("Mot introuvable");
      setFiche(ficheData);

      // Chargement des questions liées (par wordId, qui est un UUID → besoin de guillemets)
      const { data: qData, error: qErr } = await supabase
        .from("questions")
        .select("*")
        .eq("wordId", id)
        .order("created_at", { ascending: true });
      if (qErr) throw qErr;
      setQuestions(qData || []);
    } catch (err) {
      console.error("Erreur chargement WordDetail :", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  load();
}, [id]);


  const handleNewQuestion = (savedQ) => {
    setQuestions(prev => [...prev, savedQ]);
  };

  if (loading) {
    return (
      <div className="word-detail-card">
        <h2>Chargement…</h2>
      </div>
    );
  }
  if (error || !fiche) {
    return (
      <div className="word-detail-card">
        <h2>Mot introuvable</h2>
        <button className="retour-btn" onClick={() => navigate("/mots")}>
          ⬅️ Retour
        </button>
      </div>
    );
  }

  return (
    <div className="word-detail-container">
      <div className="word-detail-card">
        <h2>Détail du mot</h2>
        <div className="kanji-large">{fiche.kanji || fiche.kana}</div>
        {fiche.kana && <div className="kana">{fiche.kana}</div>}
        <div className="traduction">{fiche.fr}</div>

        <div className="section-analyse">
          <h4>Analyse grammaticale :</h4>
          <pre>{fiche.analyse}</pre>
        </div>

        {fiche.exemples && (
          <div className="section-analyse">
            <h4>Exemples d’usage :</h4>
            {fiche.exemples.map((ex, i) => (
              <div key={i} className="exemple-block">
                <p><em>{ex.niveau} :</em> {ex.phrase}</p>
                <p>Traduction : {ex.traduction}</p>
                <p>Explication : {ex.explication}</p>
              </div>
            ))}
          </div>
        )}

        {fiche.humour && (
          <div className="section-analyse section-humour">
            <h4>Note drôle :</h4>
            <p>{fiche.humour}</p>
          </div>
        )}

        <div className="questions-controls">
          <button
            className="questions-btn"
            onClick={() => setShowQuestions(v => !v)}
          >
            {showQuestions ? "Masquer mes questions" : "Mes questions"}
          </button>
          <button
            className="ask-btn"
            onClick={() => setShowModal(true)}
          >
            Poser une question
          </button>
        </div>

        {showQuestions && (
          <div className="questions-section">
            {questions.length === 0 ? (
              <p className="no-questions">Aucune question pour ce mot.</p>
            ) : (
              questions.map(q => (
                <div key={q.id} className="question-item">
                  <p className="q"><strong>Q :</strong> {q.question}</p>
                  <p className="a"><strong>R :</strong> {q.answer}</p>
                </div>
              ))
            )}
          </div>
        )}

        {showModal && (
          <QuestionModal
            word={fiche}
            onClose={() => setShowModal(false)}
            onNewQuestion={handleNewQuestion}
          />
        )}

        <button className="retour-btn" onClick={() => navigate("/mots")}>
          ⬅️ Retour à la liste
        </button>
      </div>
    </div>
  );
}
