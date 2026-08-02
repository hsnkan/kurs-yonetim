"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function YoklamaRaporPage() {
  const [tarih, setTarih] = useState(new Date().toISOString().split("T")[0]);
  const [yoklamalar, setYoklamalar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    yoklamalariGetir();
  }, [tarih]);

  const yoklamalariGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/yoklama/rapor?tarih=${tarih}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setYoklamalar(result.data);
      }
    } catch (err) {
      console.error("Yoklama getirilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const yazdir = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans">
      {/* YAZDIRMA ESNASINDA GİZLENECEK KONTROL ALANI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            📋 Günlük Yoklama Raporu
          </h1>
          <p className="text-slate-600 text-sm font-semibold">
            Günü seçin ve doğrudan yazıcı/PDF çıktısı alın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
            className="border-2 border-slate-300 p-2.5 rounded-xl font-bold text-slate-900 bg-white shadow-sm outline-none focus:border-blue-600"
          />
          <button
            onClick={yazdir}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-xl text-xs transition shadow-md flex items-center gap-2"
          >
            <span>🖨️</span> Günlük Çıktı Al / PDF
          </button>
        </div>
      </div>

      {/* A4 BASKI ALANI */}
      <div className="bg-white p-8 rounded-3xl border border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
              🤸‍♀️ Balans Cimnastik Akademi
            </h2>
            <p className="text-xs font-bold text-slate-600 uppercase">
              Günlük Yoklama Katılım Listesi
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase block">
              Tarih
            </span>
            <span className="text-lg font-black text-blue-900 font-mono">
              {new Date(tarih).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                weekday: "long",
              })}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-600 font-bold py-6">Yükleniyor...</p>
        ) : yoklamalar.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
            Bu tarihe ait katılım kaydı bulunamadı.
          </div>
        ) : (
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-950 text-xs font-black uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Öğrenci Ad Soyad</th>
                  <th className="p-3">Giriş Saati</th>
                  <th className="p-3">Veli Ad / İletişim</th>
                  <th className="p-3 text-right">Durum</th>
                </tr>
              </thead>
              <tbody>
                {yoklamalar.map((y, index) => (
                  <tr
                    key={y._id}
                    className="border-b border-slate-200 text-xs text-slate-900"
                  >
                    <td className="p-3 font-mono font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-3 font-black text-sm text-slate-950">
                      {y.ogrenciId?.adSoyad || "Bilinmiyor"}
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-800">
                      {new Date(y.tarih).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <span className="font-bold">
                        {y.ogrenciId?.veliAdSoyad}
                      </span>{" "}
                      ({y.ogrenciId?.veliTelefon})
                    </td>
                    <td className="p-3 text-right">
                      <span className="bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-black text-[10px]">
                        Katıldı / Giriş Yapıldı
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs text-slate-600 font-bold">
              <span>
                Toplam Katılan Öğrenci:{" "}
                <strong className="text-slate-950 text-sm">
                  {yoklamalar.length}
                </strong>
              </span>
              <span>İmza / Antrenör: _____________________</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
