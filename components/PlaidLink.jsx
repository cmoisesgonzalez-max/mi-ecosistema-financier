"use client";
import { useState } from "react";

export default function PlaidLink({ institution, label, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Por ahora, mostrar un mensaje
      alert(`Conexión de ${institution} en desarrollo.\n\nEn breve podrás conectar tus cuentas bancarias.`);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error conectando cuenta");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: "10px 16px",
        background: "#185FA5",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Conectando..." : label}
    </button>
  );
}
