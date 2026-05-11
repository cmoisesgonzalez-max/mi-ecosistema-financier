"use client";
import { useState } from "react";
import { usePlaidLink } from "react-plaid-link";

function PlaidLinkInner({ linkToken, institution, onSuccess }) {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      try {
        const res = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_token, institution }),
        });
        if (res.ok) {
          onSuccess?.(institution);
          window.location.reload();
        } else {
          alert("Error conectando cuenta. Intenta de nuevo.");
        }
      } catch (err) {
        console.error(err);
        alert("Error conectando cuenta.");
      }
    },
    onExit: (err) => {
      if (err) console.error("Plaid exit:", err);
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      style={{
        padding: "10px 16px",
        background: ready ? "#185FA5" : "#999",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: ready ? "pointer" : "not-allowed",
      }}
    >
      Conectar
    </button>
  );
}

export default function PlaidLink({ institution, onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (linkToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/plaid/create-link-token", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLinkToken(data.link_token);
    } catch (err) {
      console.error(err);
      alert("Error iniciando conexión. Verifica tus credenciales de Plaid en Vercel.");
    } finally {
      setLoading(false);
    }
  };

  if (linkToken) {
    return (
      <PlaidLinkInner
        linkToken={linkToken}
        institution={institution}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: "10px 16px",
        background: loading ? "#999" : "#185FA5",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Cargando..." : "Conectar"}
    </button>
  );
}
