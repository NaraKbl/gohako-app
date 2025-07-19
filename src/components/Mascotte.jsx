import React from "react";
import "./Mascotte.css";
import MascotteImg from "../assets/gohako4.png";

export default function Mascotte() {
  return (
    <div className="mascotte-empty">
      <img src={MascotteImg} alt="Mascotte Gohako neutre" />
      <p>Pose une question pour démarrer la conversation !</p>
    </div>
  );
}