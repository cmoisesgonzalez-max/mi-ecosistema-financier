import "./globals.css";

export const metadata = {
  title: "Mi Ecosistema Financiero",
  description: "Dashboard financiero personal de Moisés",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
