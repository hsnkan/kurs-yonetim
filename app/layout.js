import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Balans Cimnastik - Kurs Yönetim Sistemi",
  description: "NFC Yoklama ve Öğrenci Yönetimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-slate-100 min-h-screen flex flex-col md:flex-row">
        {/* SOL DİKEY SIDEBAR */}
        <Navbar />

        {/* SAĞ İÇERİK ALANI (MENÜ GENİŞLİĞİ KADAR SAĞA İTİLİR) */}
        <main className="flex-1 md:pl-64 min-h-screen transition-all">
          {children}
        </main>
      </body>
    </html>
  );
}
