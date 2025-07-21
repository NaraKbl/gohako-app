import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import "./QuestionModal.css";
import { supabase } from "../supabase";

export default function QuestionModal({ word, onClose, onNewQuestion }) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    let reply;
    // 1️⃣ Appel OpenAI
    try {
      const messages = [
        {
          role: "system",
          content:
            "Tu es japonaise, professeure de japonais depuis plus de 10 ans en France, et tu maîtrises toutes les meilleures techniques d’apprentissage de langue en général, et plus particulièrement du japonais. Tu n’enseignes que le vrai japonais parlé par les locaux, avec les expressions courantes, notamment chez les jeunes, et tu évites toute traduction littérale ou pompeuse. Tu t’adaptes aux évolutions du langage au fil du temps. Tu es très douce et bienveillante, avec une touche d’humour, et tu seras ma professeure particulière pour m’aider à parler couramment le plus rapidement possible. Tu dois me tutoyer."
        },
        {
          role: "user",
          content: `Mot : ${word.kanji || word.kana} (${word.fr})\nQuestion : ${question}`
        }
      ];
      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ model: "gpt-4", messages, temperature: 0.7 })
      });
      if (!aiRes.ok) throw new Error(`OpenAI ${aiRes.status}`);
      const aiData = await aiRes.json();
      reply = aiData.choices[0].message.content.trim();
      setAnswer(reply);
    } catch (err) {
      console.error("Erreur OpenAI :", err);
      setError("Impossible de générer la réponse.");
      setLoading(false);
      return;
    }

    // 2️⃣ Enregistrer dans Supabase
    try {
      const { data: savedQ, error: insertErr } = await supabase
        .from("questions")
        .insert([
          {
            id: uuidv4(),
            wordId: word.id,
            question: question.trim(),
            answer: reply
          }
        ])
        .select()
        .single();
      if (insertErr) throw insertErr;

      // 3️⃣ Mettre à jour le parent
      if (typeof onNewQuestion === "function") {
        onNewQuestion(savedQ);
      }
      setSaved(true);
    } catch (err) {
      console.error("Erreur Supabase :", err);
      setError("Impossible d’enregistrer la question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✖️</button>
        <h3>Poser une question sur « {word.kanji || word.kana} »</h3>

        <form onSubmit={handleSubmit} className="modal-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ta question..."
            rows={3}
            disabled={loading || saved}
            className="modal-textarea"
          />
          <button
            type="submit"
            disabled={loading || saved || !question.trim()}
            className="modal-submit"
          >
            {loading
              ? "En cours…"
              : saved
              ? "Question enregistrée"
              : "Envoyer"}
          </button>
        </form>

        {error && <p className="modal-error">{error}</p>}

        {answer && (
          <div className="modal-answer">
            <h4>Réponse :</h4>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
