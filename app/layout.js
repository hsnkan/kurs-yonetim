import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Balans Cimnastik - Kurs Yönetim Sistemi",
  description: "NFC Yoklama ve Öğrenci Yönetimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-slate-100 min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
