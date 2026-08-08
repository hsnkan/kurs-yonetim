"use client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGiris = () => {
    // Şifresiz doğrudan ana sayfaya yönlendirir
    window.location.href = "/ogrenciler";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-800 text-center">
        {/* RESMİ BALANS CİMNASTİK LOGOSU */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-36 h-36 mb-4 drop-shadow-lg flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Balans Cimnastik Akademi Logo"
              className="w-full h-full rounded-full object-cover border-4 border-amber-400 shadow-md"
              onError={(e) => {
                // Görsel henüz yüklenmediyse şık yedek amblem
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Balans+Cimnastik&background=0F172A&color=F59E0B&size=140";
              }}
            />
          </div>

          <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">
            BALANS CİMNASTİK AKADEMİ
          </h1>
          <p className="text-xs font-black text-amber-600 uppercase tracking-widest mt-1">
            Yönetim & Takip Sistemi
          </p>
        </div>

        <p className="text-xs font-semibold text-slate-600 mb-8 px-4">
          Öğrenci kaydı, WhatsApp duyuru ve yoklama işlemlerine erişmek için
          aşağıdaki butona tıklayabilirsiniz.
        </p>

        {/* ŞİFRESİZ DOĞRUDAN GİRİŞ BUTONU */}
        <button
          onClick={handleGiris}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transform active:scale-95"
        >
          <span>🚀</span> Yönetim Paneline Giriş Yap
        </button>
      </div>
    </div>
  );
}
