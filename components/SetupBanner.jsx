"use client";
import PlaidLink from "./PlaidLink";

const ACCOUNTS = [
  { id: "chase", label: "Chase", emoji: "🏦" },
  { id: "bofa",  label: "Bank of America", emoji: "🏦" },
  { id: "wise",  label: "Wise", emoji: "💱" },
];

export default function SetupBanner({ connectedAccounts = [], upworkConnected }) {
  const missing = ACCOUNTS.filter((a) => !connectedAccounts.includes(a.id));
  const allBanksConnected = missing.length === 0;

  if (allBanksConnected && upworkConnected) return null;

  const handleUpwork = async () => {
    const res = await fetch("/api/upwork/auth");
    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <div style={{ background: "#FFF0E8", border: "0.5px solid rgba(153,60,29,0.2)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
      <p style={{ fontSize: "13px", fontWeight: "600", color: "#993C1D", marginBottom: "12px" }}>
        Conecta tus cuentas para ver datos reales
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {missing.map((acc) => (
          <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>
              {acc.emoji} {acc.label}
            </span>
            <PlaidLink
              institution={acc.id}
              label="Conectar"
              onSuccess={() => {}}
            />
          </div>
        ))}

        {!upworkConnected && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#666" }}>💼 Upwork</span>
            <button
              onClick={handleUpwork}
              style={{
                padding: "10px 16px",
                background: "#185FA5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Conectar
            </button>
          </div>
        )}
      </div>

      {connectedAccounts.length > 0 && (
        <p style={{ fontSize: "11px", color: "#999", marginTop: "12px" }}>
          ✓ Conectados: {connectedAccounts.join(", ")}
        </p>
      )}
    </div>
  );
}
