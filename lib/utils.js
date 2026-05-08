import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export const fmtMXN = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n || 0);

export const fmtPct = (n) => `${Math.round(n || 0)}%`;

const CATEGORY_RULES = [
  { id: "transporte",      label: "Transporte",      emoji: "🚗", keywords: ["uber","didi","lyft","taxi","cabify"] },
  { id: "entretenimiento", label: "Entretenimiento", emoji: "🎬", keywords: ["netflix","spotify","disney","hbo","prime","cinema"] },
  { id: "gym",             label: "Gym",             emoji: "💪", keywords: ["gym","smart fit","fitness","crossfit","yoga"] },
  { id: "comida",          label: "Comida",          emoji: "🍔", keywords: ["restaurant","food","cafe","oxxo","walmart","rappi","uber eats"] },
  { id: "salud",           label: "Salud",           emoji: "🏥", keywords: ["farmacia","pharmacy","doctor","clinica","hospital"] },
  { id: "suscripciones",   label: "Suscripciones",   emoji: "📱", keywords: ["subscription","monthly","adobe","notion","icloud"] },
  { id: "viajes",          label: "Viajes",          emoji: "✈️", keywords: ["aeromexico","volaris","airbnb","hotel","booking"] },
  { id: "comisiones",      label: "Comisiones Wise", emoji: "💱", keywords: ["wise fee","transfer fee","conversion"] },
];

export const CATEGORIES = CATEGORY_RULES;

export function categorizeTransaction(name = "") {
  const lower = (name || "").toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule;
  }
  return { id: "otros", label: "Otros", emoji: "📦" };
}

export function last4MonthsRange() {
  const now = new Date();
  return {
    start: format(startOfMonth(subMonths(now, 4)), "yyyy-MM-dd"),
    end:   format(endOfMonth(now), "yyyy-MM-dd"),
  };
}

export function calculateSmartBudgets(transactions) {
  const months = {};
  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const month = tx.date.slice(0, 7);
    const cat = categorizeTransaction(tx.name);
    if (!months[month]) months[month] = {};
    if (!months[month][cat.id]) months[month][cat.id] = 0;
    months[month][cat.id] += tx.amount;
  }
  const monthKeys = Object.keys(months);
  if (!monthKeys.length) return [];

  const avgByCategory = {};
  for (const month of monthKeys) {
    for (const [catId, total] of Object.entries(months[month])) {
      if (!avgByCategory[catId]) avgByCategory[catId] = [];
      avgByCategory[catId].push(total);
    }
  }
  return CATEGORY_RULES.map((cat) => {
    const history = avgByCategory[cat.id] || [];
    const avg = history.length ? history.reduce((a, b) => a + b, 0) / history.length : 0;
    const budget = Math.ceil((avg * 1.1) / 10) * 10;
    return { ...cat, budget, avgSpend: avg };
  }).filter((c) => c.budget > 0);
}

export function detectMoneyLeaks(transactions) {
  const map = {};
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  for (const tx of transactions) {
    if (tx.amount <= 0) continue;
    const key = (tx.name || "").toLowerCase().trim();
    if (!key) continue;
    if (!map[key]) map[key] = [];
    if (new Date(tx.date) >= cutoff) map[key].push(tx);
  }
  return Object.entries(map)
    .filter(([, txs]) => txs.length >= 2)
    .map(([name, txs]) => ({
      name: txs[0].name,
      count: txs.length,
      estimatedMonthly: txs.reduce((s, t) => s + t.amount, 0) / 3,
      category: categorizeTransaction(name),
      lastDate: txs.sort((a, b) => b.date.localeCompare(a.date))[0].date,
    }))
    .sort((a, b) => b.estimatedMonthly - a.estimatedMonthly)
    .slice(0, 5);
}

export function getMonthSummary(transactions, month) {
  const monthTxs = transactions.filter((t) => t.date && t.date.startsWith(month));
  const expenses = monthTxs.filter((t) => t.amount > 0);
  const income   = monthTxs.filter((t) => t.amount < 0);
  const totals = {};
  for (const tx of expenses) {
    const cat = categorizeTransaction(tx.name);
    if (!totals[cat.id]) totals[cat.id] = { ...cat, total: 0 };
    totals[cat.id].total += tx.amount;
  }
  return {
    month,
    totalExpenses: expenses.reduce((s, t) => s + t.amount, 0),
    totalIncome:   Math.abs(income.reduce((s, t) => s + t.amount, 0)),
    byCategory:    Object.values(totals).sort((a, b) => b.total - a.total),
    wiseFees:      expenses.filter((t) => /wise.*fee/i.test(t.name || "")).reduce((s, t) => s + t.amount, 0),
  };
}

export function calcGoalProgress(current, target, monthly) {
  const remaining = Math.max(0, target - current);
  const months = monthly > 0 ? Math.ceil(remaining / monthly) : null;
  const pct = Math.min(100, (current / target) * 100);
  return { remaining, months, pct };
}
