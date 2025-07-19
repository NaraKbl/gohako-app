import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionModal from "./QuestionModal";
import "./WordCard.css";

function WordCard({ word, onDelete }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/mot/${word.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(word.id);
  };

  const handleQuestionClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="word-card" onClick={handleCardClick}>
        <button
          className="delete-btn"
          onClick={handleDelete}
          aria-label="Supprimer ce mot"
        >
          ✕
        </button>
        <div className="word-kanji">{word.kanji || word.kana}</div>
        {word.kana && <div className="word-kana">{word.kana}</div>}
        <div className="word-fr">{word.fr}</div>
        <button
          className="question-button"
          onClick={handleQuestionClick}
        >
          🧠 J’ai une question
        </button>
      </div>
      {isModalOpen && (
        <QuestionModal word={word} onClose={closeModal} />
      )}
    </>
  );
}

export default WordCard;
