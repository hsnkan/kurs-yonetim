"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    if (confirm("Sistemden çıkış yapmak istediğinize emin misiniz?")) {
      await fetch("/api/login", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    }
  };

  const menuElemanlari = [
    { ad: "Öğrenci Yönetimi", ikon: "🎓", href: "/ogrenciler" },
    { ad: "Duyuru Paneli", ikon: "📢", href: "/duyurular" },
    { ad: "Mali Yönetim", ikon: "💰", href: "/muhasebe" },
    { ad: "NFC Yoklama", ikon: "📲", href: "/yoklama/nfc" },
    { ad: "Günlük Yoklama", ikon: "📋", href: "/yoklama" },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between md:fixed md:inset-y-0 z-50 font-sans shadow-xl">
      {/* ÜST BÖLÜM: LOGO & MENÜ LİNKLERİ */}
      <div className="p-5">
        {/* LOGO & BAŞLIK */}
        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800">
          <span className="text-3xl">🤸‍♀️</span>
          <div>
            <h1 className="font-black text-base tracking-tight text-emerald-400">
              Balans Cimnastik
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              Yönetim Paneli
            </span>
          </div>
        </div>

        {/* MENÜ LİNKLERİ */}
        <nav className="space-y-2">
          {menuElemanlari.map((item) => {
            const aktifMi = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  aktifMi
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-base">{item.ikon}</span>
                <span>{item.ad}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ALT BÖLÜM: EN ALTTA SABİTLENMİŞ ÇIKIŞ BUTONU */}
      <div className="p-5 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full bg-rose-600/10 hover:bg-rose-600 border border-rose-600/40 hover:border-rose-600 text-rose-300 hover:text-white py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:scale-110 transition-transform">🚪</span>
          <span>Güvenli Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
