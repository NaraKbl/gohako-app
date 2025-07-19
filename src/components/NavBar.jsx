import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css"; // On stylisera ça ensuite

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-link">🏠 Accueil</Link>
      <Link to="/ajouter" className="nav-link">➕ Ajouter un mot</Link>
      <Link to="/mots" className="nav-link">📚 Mes mots</Link>
    </nav>
  );
}

export default NavBar;
