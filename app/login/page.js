"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [yoneticiAdi, setYoneticiAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setHata("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yoneticiAdi, sifre }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/ogrenciler");
        router.refresh();
      } else {
        setHata(data.error || "Hatalı yönetici adı veya şifre girdiniz!");
      }
    } catch (err) {
      setHata("Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-2xl border border-slate-800">
        {/* LOGO & BAŞLIK */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-32 h-32 mb-4 drop-shadow-md flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Balans Cimnastik Akademi Logo"
              className="w-full h-full rounded-full object-cover border-2 border-slate-200"
              onError={(e) => {
                // Görsel bulunamazsa yedek şık bir amblem göster
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://ui-avatars.com/api/?name=Balans+Cimnastik&background=0F172A&color=F59E0B&size=128";
              }}
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
            Balans Cimnastik Akademi
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Yönetim Paneli Girişi
          </p>
        </div>

        {/* HATA MESAJI */}
        {hata && (
          <div className="mb-5 bg-rose-100 border-2 border-rose-400 text-rose-900 p-3 rounded-2xl text-xs font-black text-center animate-bounce">
            ⚠️ {hata}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* YÖNETİCİ ADI */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-2">
              👤 Yönetici Adı / Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: admin"
              value={yoneticiAdi}
              onChange={(e) => setYoneticiAdi(e.target.value)}
              className="w-full border-2 border-slate-400 p-3.5 rounded-2xl text-sm font-bold text-slate-950 outline-none focus:border-blue-600 bg-slate-50 transition placeholder:text-slate-400"
            />
          </div>

          {/* ŞİFRE */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-2">
              🔒 Yönetici Şifresi
            </label>
            <div className="relative">
              <input
                type={sifreGoster ? "text" : "password"}
                required
                placeholder="Şifrenizi giriniz..."
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                className="w-full border-2 border-slate-400 p-3.5 pr-12 rounded-2xl text-sm font-bold text-slate-950 outline-none focus:border-blue-600 bg-slate-50 transition placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSifreGoster(!sifreGoster)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-lg p-1 transition"
                title={sifreGoster ? "Şifreyi Gizle" : "Şifreyi Göster"}
              >
                {sifreGoster ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            {loading ? "Giriş Yapılıyor..." : "🚀 Sisteme Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
