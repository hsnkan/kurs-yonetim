"use client";
import { useState, useEffect } from "react";

export default function MuhasebePage() {
  const [data, setData] = useState({
    odemesiBekleyenler: [],
    buAyToplamGelir: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    muhasebeVerileriniGetir();
  }, []);

  const muhasebeVerileriniGetir = async () => {
    try {
      const res = await fetch("/api/muhasebe", { cache: "no-store" });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Muhasebe verileri alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const odemeAl = async (ogrenciId, tutar) => {
    if (!confirm("Ödeme alındı olarak işaretlemek istiyor musunuz?")) return;

    try {
      const res = await fetch("/api/muhasebe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ogrenciId, tutar, islemTipi: "ODEME_AL" }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        muhasebeVerileriniGetir();
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("İşlem sırasında hata oluştu.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">
          🔒 Finans & Kasa Yönetimi (Yönetici)
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Aylık ciro takibi ve ödeme tahsilat onayları.
        </p>
      </div>

      {/* İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bu Ay Tahsil Edilen Toplam Gelir
          </p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            ₺ {data.buAyToplamGelir}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ödemesi Bekleyen Öğrenci
          </p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {data.odemesiBekleyenler.length} Kişi
          </p>
        </div>
      </div>

      {/* ÖDEME ONAY TABLOSU */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          ⏳ Tahsil Edilecek Aidatlar
        </h2>

        {loading ? (
          <p>Yükleniyor...</p>
        ) : data.odemesiBekleyenler.length === 0 ? (
          <div className="p-8 text-center text-emerald-600 font-semibold bg-emerald-50 rounded-xl">
            🎉 Tüm aidatlar tahsil edildi!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600 text-sm">
                  <th className="p-3">Öğrenci Adı</th>
                  <th className="p-3">Veli Adı & Tel</th>
                  <th className="p-3">Aylık Ücret</th>
                  <th className="p-3">Ödeme Günü</th>
                  <th className="p-3 text-right">Tahsilat</th>
                </tr>
              </thead>
              <tbody>
                {data.odemesiBekleyenler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b hover:bg-slate-50 text-sm text-slate-800"
                  >
                    <td className="p-3 font-semibold">{o.adSoyad}</td>
                    <td className="p-3">
                      <div>{o.veliAdSoyad}</div>
                      <div className="text-xs text-slate-500">
                        {o.veliTelefon}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-3">Her ayın {o.odemeGunu}. günü</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => odemeAl(o._id, o.aylikUcret)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition"
                      >
                        ✓ Ödeme Alındı
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
