"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHata("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/ogrenciler");
        router.refresh();
      } else {
        setHata(data.error || "Giriş başarısız.");
      }
    } catch (err) {
      setHata("Sunucu ile iletişim kurulamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            🤸‍♀️ Balans Cimnastik
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            Yönetim Paneli Girişi
          </p>
        </div>

        {hata && (
          <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-4 rounded-2xl text-xs font-bold mb-6 text-center">
            ⚠️ {hata}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınız..."
              className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl font-bold text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl text-sm transition shadow-lg disabled:opacity-50"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap →"}
          </button>
        </form>
      </div>
    </div>
  );
}
