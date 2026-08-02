"use client";
import { useState, useEffect } from "react";

export default function MaliYonetimPage() {
  const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
  const [rapor, setRapor] = useState([]); // Varsayılan boş dizi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    maliRaporuGetir();
  }, [seciliYil]);

  const maliRaporuGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/muhasebe?yil=${seciliYil}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data)) {
        setRapor(result.data);
      } else {
        setRapor([]);
      }
    } catch (err) {
      console.error("Mali rapor getirilemedi:", err);
      setRapor([]);
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ GÜVENLİ HESAPLAMA KORUMALARI (Array garantisi)
  const guvenliRapor = Array.isArray(rapor) ? rapor : [];

  const toplamYillikKazanc = guvenliRapor.reduce(
    (acc, item) => acc + (item?.toplamKazanc || 0),
    0,
  );
  const toplamYeniKayit = guvenliRapor.reduce(
    (acc, item) => acc + (item?.yeniKayit || 0),
    0,
  );
  const toplamAyrilan = guvenliRapor.reduce(
    (acc, item) => acc + (item?.ayrilan || 0),
    0,
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            💰 Mali Yönetim & Gelir Takibi
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Yıllara ait aylık kayıtlar, ayrılışlar ve ciro/kazanç analizleri.
          </p>
        </div>

        {/* YIL SEÇİMİ */}
        <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex items-center gap-3">
          <span className="text-xs font-black text-slate-700">
            📅 Çalışma Yılı:
          </span>
          <select
            value={seciliYil}
            onChange={(e) => setSeciliYil(Number(e.target.value))}
            className="font-black text-sm text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl outline-none"
          >
            <option value={2026}>2026 Yılı</option>
            <option value={2025}>2025 Yılı</option>
            <option value={2024}>2024 Yılı</option>
          </select>
        </div>
      </div>

      {/* YILLIK ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg">
          <span className="text-xs font-black text-emerald-300 uppercase tracking-wider block mb-1">
            {seciliYil} Toplam Gelir Kazancı
          </span>
          <span className="text-3xl font-black text-emerald-400">
            ₺ {toplamYillikKazanc.toLocaleString("tr-TR")}
          </span>
        </div>

        <div className="bg-blue-950 text-white p-6 rounded-3xl border border-blue-800 shadow-lg">
          <span className="text-xs font-black text-blue-300 uppercase tracking-wider block mb-1">
            Yıllık Toplam Yeni Kayıt
          </span>
          <span className="text-3xl font-black text-blue-400">
            +{toplamYeniKayit} Öğrenci
          </span>
        </div>

        <div className="bg-rose-950 text-white p-6 rounded-3xl border border-rose-800 shadow-lg">
          <span className="text-xs font-black text-rose-300 uppercase tracking-wider block mb-1">
            Yıllık Toplam Ayrılan
          </span>
          <span className="text-3xl font-black text-rose-400">
            -{toplamAyrilan} Öğrenci
          </span>
        </div>
      </div>

      {/* AYLIK DETAY TABLOSU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          📊 {seciliYil} Yılı Aylık Döküm ve Kazanç Tablosu
        </h2>

        {loading ? (
          <p className="text-slate-700 font-bold py-4">
            Raporlar hesaplanıyor...
          </p>
        ) : guvenliRapor.length === 0 ? (
          <p className="text-slate-500 font-bold py-4">
            Gösterilebilecek rapor verisi bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Ay</th>
                  <th className="p-4">Yeni Kayıt</th>
                  <th className="p-4">Ayrılan (Pasif)</th>
                  <th className="p-4 text-right">Tahmini Aylık Gelir</th>
                </tr>
              </thead>
              <tbody>
                {guvenliRapor.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-200 hover:bg-slate-50 text-slate-950 transition"
                  >
                    <td className="p-4 font-black text-base">
                      {item?.ay || "-"}
                    </td>
                    <td className="p-4 font-bold text-blue-700">
                      +{item?.yeniKayit || 0} Öğrenci
                    </td>
                    <td className="p-4 font-bold text-rose-600">
                      -{item?.ayrilan || 0} Öğrenci
                    </td>
                    <td className="p-4 text-right font-black text-emerald-700 text-base">
                      ₺ {(item?.toplamKazanc || 0).toLocaleString("tr-TR")}
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
