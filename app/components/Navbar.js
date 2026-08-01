"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  // Giriş sayfasında Navbar'ı gizle
  if (pathname === "/login") return null;

  const handleLogout = async () => {
    if (confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
      await fetch("/api/login", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 font-sans shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-xl">🤸‍♀️</span>
            <span className="font-black text-lg tracking-tight text-emerald-400">
              Balans Cimnastik
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              🏠 Ana Sayfa
            </Link>
            <Link
              href="/ogrenciler"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === "/ogrenciler"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              🎓 Aktif Öğrenciler
            </Link>
            <Link
              href="/ogrenciler/arsiv"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === "/ogrenciler/arsiv"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              📁 Arşiv & Geçmiş
            </Link>
            <Link
              href="/yoklama/nfc"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                pathname === "/yoklama/nfc"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              📲 NFC Yoklama
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1"
          >
            🚪 Güvenli Çıkış
          </button>
        </div>
      </div>
    </nav>
  );
}
