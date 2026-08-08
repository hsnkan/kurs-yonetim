import "@/app/globals.css";

export const metadata = {
  title: "Balans Cimnastik - Kurs Yönetim Sistemi",
  description: "NFC Yoklama ve Öğrenci Yönetimi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body
        suppressHydrationWarning={true}
        className="relative min-h-screen bg-slate-950 text-slate-100 antialiased overflow-x-hidden"
      >
        {/* 🖼️ TÜM SAYFALARIN ARKA PLANINA KAPLANAN LOGO (FILIGRAN) */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-center bg-no-repeat bg-contain opacity-10"
          style={{ backgroundImage: "url('/logo.png')" }}
        />

        {/* İÇERİK KATMANI */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
