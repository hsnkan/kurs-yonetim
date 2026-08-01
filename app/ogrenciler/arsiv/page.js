"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ArsivPage() {
  const [pasifOgrenciler, setPasifOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);

  const pasifOgrencileriGetir = async () => {
    try {
      const res = await fetch("/api/ogrenciler?durum=PASIF", {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setPasifOgrenciler(result.data);
      }
    } catch (error) {
      console.error("Arşiv yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    pasifOgrencileriGetir();
  }, []);

  // YENİDEN AKTİF ET
  const yenidenAktifEt = async (id, adSoyad) => {
    if (
      !confirm(
        `${adSoyad} isimli öğrenciyi yeniden aktif yapmak istiyor musunuz?`,
      )
    )
      return;

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, durum: "AKTIF" }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${adSoyad} yeniden aktif öğrenci listesine taşındı! 🎉`);
        pasifOgrencileriGetir();
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("İşlem başarısız.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans bg-slate-100 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>📁</span> Ayrılan / Pasif Öğrenci Arşivi
          </h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Kursa ara veren veya ayrılan öğrencilerin geçmiş kayıtları burada
            saklanır.
          </p>
        </div>

        <Link
          href="/ogrenciler"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-md self-start md:self-auto"
        >
          ← Aktif Öğrencilere Dön
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        {loading ? (
          <p className="text-slate-700 font-bold">Arşiv yükleniyor...</p>
        ) : pasifOgrenciler.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-2xl border border-slate-200">
            📁 Arşivde pasif durumda hiç öğrenci yok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Öğrenci Adı</th>
                  <th className="p-4">1. Veli İletişim</th>
                  <th className="p-4">2. Veli İletişim</th>
                  <th className="p-4">Aylık Ücret</th>
                  <th className="p-4 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody>
                {pasifOgrenciler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-200 hover:bg-slate-50 text-slate-950 transition opacity-80 hover:opacity-100"
                  >
                    <td className="p-4 font-black text-base line-through text-slate-600">
                      {o.adSoyad}
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-800">
                        {o.veliAdSoyad} ({o.veliYakinlik || "Anne"})
                      </div>
                      <div className="text-xs font-bold text-slate-600 font-mono mt-0.5">
                        {o.veliTelefon}
                      </div>
                    </td>
                    <td className="p-4">
                      {o.ikinciVeliTelefon ? (
                        <>
                          <div className="font-extrabold text-slate-800">
                            {o.ikinciVeliAdSoyad} (
                            {o.ikinciVeliYakinlik || "Baba"})
                          </div>
                          <div className="text-xs font-bold text-slate-600 font-mono mt-0.5">
                            {o.ikinciVeliTelefon}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">
                          Kayıtlı Değil
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => yenidenAktifEt(o._id, o.adSoyad)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition shadow-sm inline-flex items-center gap-1"
                      >
                        🔄 Yeniden Aktif Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
