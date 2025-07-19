// src/components/Chat.jsx
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import "./Chat.css";
import Mascotte from "../components/Mascotte";
import AnswerImg from "../assets/gohakoface.png";

export default function Chat() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const API_URL = "https://api-gohako.onrender.com";

  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  const [deleteModalId, setDeleteModalId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/conversations`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error("Erreur chargement conversations :", err);
      }
    };
    load();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(open => !open);
    setMenuOpenId(null);
  };

  const selectConversation = id => {
    setCurrentId(id);
    setInput("");
    setMenuOpenId(null);
  };

  const openRenameModal = id => {
    const conv = conversations.find(c => c.id === id);
    setRenameInput(conv.title);
    setRenameModalId(id);
    setMenuOpenId(null);
  };

  const confirmRename = async () => {
    setConversations(prev =>
      prev.map(c =>
        c.id === renameModalId ? { ...c, title: renameInput } : c
      )
    );
    try {
      await fetch(`${API_URL}/conversations/${renameModalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameInput }),
      });
    } catch (err) {
      console.error("Erreur renommage conversation :", err);
    }
    setRenameModalId(null);
  };

  const openDeleteModal = id => {
    setDeleteModalId(id);
    setMenuOpenId(null);
  };

  const confirmDelete = async () => {
    setConversations(prev => prev.filter(c => c.id !== deleteModalId));
    if (deleteModalId === currentId) {
      setCurrentId(prevConvs => {
        const remaining = conversations.filter(c => c.id !== deleteModalId);
        return remaining[0]?.id || null;
      });
    }
    try {
      await fetch(`${API_URL}/conversations/${deleteModalId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Erreur suppression conversation :", err);
    }
    setDeleteModalId(null);
  };

  const cancelModals = () => {
    setRenameModalId(null);
    setDeleteModalId(null);
    setMenuOpenId(null);
  };

  const createConversation = async firstMsg => {
    const id = uuidv4();
    const systemMsg = {
      role: "system",
      content:
        "Tu es japonaise, professeure de japonais depuis plus de 10 ans en France, et tu maîtrises toutes les meilleures techniques d’apprentissage de langue en général, et plus particulièrement du japonais. Tu n’enseignes que le vrai japonais parlé par les locaux, avec les expressions courantes, notamment chez les jeunes, et tu évites toute traduction littérale ou pompeuse. Tu t’adaptes aux évolutions du langage au fil du temps. Tu es très douce et bienveillante, avec une touche d’humour, et tu seras ma professeure particulière pour m’aider à parler couramment le plus rapidement possible. Tu peux me tutoyer."
    };
    const messages = [systemMsg];
    let title = "Nouvelle conversation";

    if (firstMsg) {
      messages.push({ role: "user", content: firstMsg });
      title =
        firstMsg.length > 20 ? `${firstMsg.slice(0, 20)}...` : firstMsg;
    }

    const newConv = { id, title, messages };

    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConv),
      });
      if (!res.ok) throw new Error(res.statusText);
      const saved = await res.json();
      setConversations(prev => [saved, ...prev]);
      setCurrentId(saved.id);
      return saved;
    } catch (err) {
      console.error("Erreur création conversation :", err);
      setConversations(prev => [newConv, ...prev]);
      setCurrentId(newConv.id);
      return newConv;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      let conv = conversations.find(c => c.id === currentId);
      if (!conv) {
        conv = await createConversation(input);
      } else {
        const userMsg = { role: "user", content: input };
        conv = { ...conv, messages: [...conv.messages, userMsg] };
        setConversations(prev =>
          prev.map(c => (c.id === conv.id ? conv : c))
        );
        await fetch(`${API_URL}/conversations/${conv.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(conv),
        });
      }

      setInput("");

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: conv.messages,
          temperature: 0.7
        })
      });
      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        content: data.choices[0].message.content
      };

      const updatedConv = {
        ...conv,
        messages: [...conv.messages, assistantMsg]
      };
      setConversations(prev =>
        prev.map(c => (c.id === updatedConv.id ? updatedConv : c))
      );
      await fetch(`${API_URL}/conversations/${updatedConv.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConv)
      });
    } catch (err) {
      console.error("Erreur sendMessage :", err);
    } finally {
      setLoading(false);
    }
  };

  const currentConv =
    conversations.find(c => c.id === currentId) || { messages: [] };
  const visibleMsgs = currentConv.messages.filter(m => m.role !== "system");

  return (
    <div className="chat-app">
      {isSidebarOpen && (
        <aside className="chat-sidebar">
          <button className="new-conv-btn" onClick={() => setCurrentId(null)}>
            ➕ Conversation
          </button>
          <ul className="conv-list">
            {conversations.map(c => (
              <li
                key={c.id}
                className={c.id === currentId ? "active" : ""}
                onClick={() => selectConversation(c.id)}
              >
                <span className="conv-title">{c.title}</span>
                <button
                  className="conv-menu-btn"
                  onClick={e => {
                    e.stopPropagation();
                    setMenuOpenId(c.id);
                  }}
                >
                  ⋮
                </button>
                {menuOpenId === c.id && (
                  <div className="conv-menu">
                    <button onClick={() => openRenameModal(c.id)}>
                      Renommer
                    </button>
                    <button onClick={() => openDeleteModal(c.id)}>
                      Supprimer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      )}
      <section className="chat-window">
        <header className="chat-header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            ☰
          </button>
          <h2>
            {currentConv && currentConv.id
              ? currentConv.title
              : "Nouveau Chat"}
          </h2>
        </header>
        <div className="messages">
          {visibleMsgs.length === 0 ? (
            <Mascotte />
          ) : (
            visibleMsgs.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="message assistant">
                  <img
                    src={AnswerImg}
                    alt="Gohako répond"
                    className="avatar"
                  />
                  <div className="content">{msg.content}</div>
                </div>
              ) : (
                <div key={i} className="message user">{msg.content}</div>
              )
            )
          )}
        </div>
        <div className="input-area">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Écris ton message..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Envoi…" : "Envoyer"}
          </button>
        </div>

        {renameModalId && (
          <div className="modal-overlay" onClick={cancelModals}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Renommer la conversation</h3>
              <input
                className="modal-input"
                value={renameInput}
                onChange={e => setRenameInput(e.target.value)}
              />
              <div className="modal-actions">
                <button onClick={confirmRename}>Confirmer</button>
                <button onClick={cancelModals}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        {deleteModalId && (
          <div className="modal-overlay" onClick={cancelModals}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Supprimer la conversation ?</h3>
              <div className="modal-actions">
                <button onClick={confirmDelete}>Supprimer</button>
                <button onClick={cancelModals}>Annuler</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
