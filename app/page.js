import { fmtUSD, fmtMXN, fmtPct, calcGoalProgress } from "@/lib/utils";
import { cookies } from "next/headers";
import SetupBanner from "@/components/SetupBanner";

const MXN_RATE = parseFloat(process.env.NEXT_PUBLIC_MXN_RATE || "17.50");
const GOAL_EUROPA = parseFloat(process.env.NEXT_PUBLIC_GOAL_EUROPA || "2500");
const GOAL_CASA = parseFloat(process.env.NEXT_PUBLIC_GOAL_CASA || "250000");

// Demo data — se reemplaza con datos reales cuando conectas Plaid y Upwork
const DEMO = {
  netWorth: 8347.80,
  accounts: [
    { name: "Chase",           usd: 2847.50 },
    { name: "Bank of America", usd: 1305.80 },
    { name: "Wise USD",        usd: 1097.00 },
    { name: "Wise MXN",        mxn: 19200, usd: 1097.14 },
  ],
  income: {
    cartesia: 3200,
    adtractive: 700,
    total: 3900,
  },
  budgets: [
    { emoji: "🚗", label: "Transporte",      spent: 127, budget: 150 },
    { emoji: "🎬", label: "Entretenimiento", spent: 142, budget: 120 },
    { emoji: "💪", label: "Gym",             spent: 65,  budget: 80 },
    { emoji: "🍔", label: "Comida",          spent: 154, budget: 200 },
  ],
  leaks: [
    { name: "App de meditación", monthly: 14.99, count: 2 },
    { name: "Streaming sin usar", monthly: 9.99, count: 3 },
    { name: "Comisiones Wise pequeñas", monthly: 27.02, count: 4 },
  ],
  goals: [
    { emoji: "✈️", name: "Viaje a Europa",      current: 1420, target: GOAL_EUROPA, color: "sky" },
    { emoji: "🏡", name: "Casa propia",          current: 8347, target: GOAL_CASA, color: "sky" },
    { emoji: "🛡️", name: "Fondo de emergencia", current: 6250, target: 9000, color: "sage" },
  ],
  report: {
    income: 3900, expenses: 487, fees: 12.45, available: 3400, savingsRate: 87,
  },
};

export default function Dashboard() {
  // Detectar cuentas conectadas desde cookies
  const cookieStore = cookies();
  const plaidTokens = cookieStore.get("plaid_tokens")?.value;
  const upworkToken = cookieStore.get("upwork_token")?.value;
  
  let connectedAccounts = [];
  if (plaidTokens) {
    try {
      const tokens = JSON.parse(plaidTokens);
      connectedAccounts = tokens.map((t) => t.institution);
    } catch {}
  }
  const upworkConnected = !!upworkToken;
  const totalLeaks = DEMO.leaks.reduce((s, l) => s + l.monthly, 0);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "1.5rem 1.25rem 5rem" }}>
      <header style={{ background: "linear-gradient(135deg,#F5EBE1,#F0E8DF)", margin: "-1.5rem -1.25rem 1.5rem", padding: "1.5rem 1.25rem", borderBottom: "0.5px solid rgba(0,0,0,0.07)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#999", marginBottom: 4 }}>
          Mi Ecosistema Financiero
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 500, color: "#3A3A3A" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
          Hola Moisés
        </p>

        <div style={{ background: "linear-gradient(135deg,#C5D9ED,#D9CFF0)", borderRadius: 14, padding: "1.25rem", marginTop: "1rem" }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#185FA5", marginBottom: 6 }}>
            Net Worth Total
          </p>
          <p style={{ fontSize: 34, fontWeight: 600, color: "#185FA5", marginBottom: 12 }}>
            {fmtUSD(DEMO.netWorth)}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {DEMO.accounts.map((a) => (
              <div key={a.name} style={{ background: "rgba(255,255,255,0.55)", borderRadius: 8, padding: 10 }}>
                <p style={{ fontSize: 11, color: "#185FA5", opacity: 0.7, marginBottom: 3 }}>{a.name}</p>
                <p style={{ fontSize: 17, fontWeight: 600, color: "#185FA5" }}>
                  {a.mxn ? fmtMXN(a.mxn) : fmtUSD(a.usd)}
                </p>
                {a.mxn && <p style={{ fontSize: 10, color: "#185FA5", opacity: 0.6, marginTop: 2 }}>≈ {fmtUSD(a.usd)}</p>}
              </div>
            ))}
          </div>
        </div>
      </header>

      <SetupBanner connectedAccounts={connectedAccounts} upworkConnected={upworkConnected} />

      <SectionLabel>💼 Consolidación de ingresos — Mayo</SectionLabel>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: "0.5px solid #F0EBE1", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: "#666" }}>Total Upwork</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#3B6D11" }}>{fmtUSD(DEMO.income.cartesia)}</span>
        </div>
        <IncomeRow label="Cartesia (via Upwork)" amount={DEMO.income.cartesia} pct={(DEMO.income.cartesia / DEMO.income.total) * 100} color="#C9E4C8" tag="Base estable" />
        <IncomeRow label="Adtractive (depósito directo Chase)" amount={DEMO.income.adtractive} pct={(DEMO.income.adtractive / DEMO.income.total) * 100} color="#E8D4BC" tag="Depósito directo" />
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "0.5px solid #F0EBE1" }}>
          <span style={{ fontSize: 12, color: "#999" }}>Total mes</span>
          <span style={{ fontSize: 20, fontWeight: 600, color: "#3B6D11" }}>{fmtUSD(DEMO.income.total)}</span>
        </div>
      </Card>

      <SectionLabel>📊 Presupuestos inteligentes</SectionLabel>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 10 }}>
        Calculados automáticamente desde tus últimos 4 meses en Wise
      </p>
      <Card>
        {DEMO.budgets.map((b, i) => {
          const pct = (b.spent / b.budget) * 100;
          const over = pct >= 100;
          const warn = pct >= 80 && !over;
          return (
            <div key={b.label} style={{ padding: "12px 0", borderBottom: i < DEMO.budgets.length - 1 ? "0.5px solid rgba(0,0,0,0.05)" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{b.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{b.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: over ? "#993C1D" : warn ? "#BA7517" : "#999" }}>
                  {over ? "⚠️ " : ""}{Math.round(pct)}%
                </span>
              </div>
              <div style={{ height: 7, background: "#F0EBE1", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: over ? "#F0D9D4" : warn ? "#E8D4BC" : "#C9E4C8", borderRadius: 4 }} />
              </div>
              <p style={{ fontSize: 10, color: "#999", marginTop: 3 }}>
                {fmtUSD(b.spent)} de {fmtUSD(b.budget)} · {fmtMXN(b.spent * MXN_RATE)}
              </p>
            </div>
          );
        })}
      </Card>

      <SectionLabel>🚨 Fugas de dinero detectadas</SectionLabel>
      <div style={{ background: "#FFF0E8", border: "0.5px solid rgba(153,60,29,0.2)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#993C1D", marginBottom: 10 }}>
          💸 Podrías ahorrar {fmtUSD(totalLeaks)}/mes
        </p>
        {DEMO.leaks.map((leak) => (
          <div key={leak.name} style={{ background: "rgba(255,255,255,0.65)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{leak.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#993C1D" }}>−{fmtUSD(leak.monthly)}/mes</span>
            </div>
            <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{leak.count}× en los últimos 90 días</p>
          </div>
        ))}
      </div>

      <SectionLabel>🎯 Metas financieras</SectionLabel>
      {DEMO.goals.map((goal) => {
        const { pct, remaining } = calcGoalProgress(goal.current, goal.target, 200);
        return (
          <Card key={goal.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{goal.emoji} {goal.name}</p>
                <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{fmtUSD(goal.current)} de {fmtUSD(goal.target)}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#185FA5" }}>{fmtPct(pct)}</p>
              </div>
            </div>
            <div style={{ height: 10, background: "#F0EBE1", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: goal.color === "sage" ? "#C9E4C8" : "#C5D9ED", borderRadius: 5 }} />
            </div>
            <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
              Faltan {fmtUSD(remaining)}
            </p>
          </Card>
        );
      })}

      <SectionLabel>📈 Reporte — Mayo 2026</SectionLabel>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
          <StatBox label="Ingresos"        value={fmtUSD(DEMO.report.income)}    sub="Cartesia + Adtractive" color="#3B6D11" />
          <StatBox label="Gastos"          value={fmtUSD(DEMO.report.expenses)}  sub="−3% vs abril"           color="#993C1D" />
          <StatBox label="Comisiones Wise" value={fmtUSD(DEMO.report.fees)}      sub="4 transferencias"        color="#BA7517" />
          <StatBox label="Disponible"      value={fmtUSD(DEMO.report.available)} sub="+15% vs abril"          color="#185FA5" />
        </div>
        <div style={{ background: "#C9E4C8", borderRadius: 8, padding: 10 }}>
          <p style={{ fontSize: 12, color: "#27500A", lineHeight: 1.6 }}>
            <strong>Análisis automático:</strong> Excelente mes. Ahorraste el {DEMO.report.savingsRate}% de tus ingresos.
          </p>
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", marginTop: "1rem", padding: 10, background: "white", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B6D11", display: "inline-block", marginRight: 6 }} />
        <span style={{ fontSize: 11, color: "#999" }}>
          App publicada · Conecta Plaid y Upwork para ver tus datos reales
        </span>
      </div>
    </main>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, color: "#999", margin: "1.5rem 0 0.75rem" }}>
      {children}
    </p>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: "white", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
      {children}
    </div>
  );
}

function IncomeRow({ label, amount, pct, color, tag }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtUSD(amount)}</span>
      </div>
      <div style={{ height: 7, background: "#F0EBE1", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4 }} />
      </div>
      <p style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{Math.round(pct)}% del total · {tag}</p>
    </div>
  );
}

function StatBox({ label, value, sub, color }) {
  return (
    <div style={{ background: "#F9F4EE", borderRadius: 8, padding: 10, textAlign: "center" }}>
      <p style={{ fontSize: 10, color: "#999", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 600, color }}>{value}</p>
      <p style={{ fontSize: 10, color: "#999", marginTop: 2 }}>{sub}</p>
    </div>
  );
}
