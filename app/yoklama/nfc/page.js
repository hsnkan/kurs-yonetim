"use client";
import { useState, useEffect } from "react";

export default function YoklamaRaporPage() {
  const [tarih, setTarih] = useState(new Date().toISOString().split("T")[0]);
  const [seciliGrup, setSeciliGrup] = useState("TÜM GRUPLAR");
  const [yoklamalar, setYoklamalar] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gruplariGetir();
  }, []);

  useEffect(() => {
    yoklamalariGetir();
  }, [tarih]);

  const gruplariGetir = async () => {
    try {
      const res = await fetch("/api/gruplar", { cache: "no-store" });
      const result = await res.json();
      if (result.success) setGruplar(result.data || []);
    } catch (err) {
      console.error("Gruplar çekilemedi");
    }
  };

  const yoklamalariGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/yoklama/rapor?tarih=${tarih}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setYoklamalar(result.data || []);
      } else {
        setYoklamalar([]);
      }
    } catch (err) {
      console.error("Yoklama getirilemedi:", err);
      setYoklamalar([]);
    } finally {
      setLoading(false);
    }
  };

  const yazdir = () => {
    window.print();
  };

  const guvenliListe = Array.isArray(yoklamalar) ? yoklamalar : [];

  // Grup Filtreleme
  const filtrelenmisYoklamalar =
    seciliGrup === "TÜM GRUPLAR"
      ? guvenliListe
      : guvenliListe.filter((y) => y.ogrenciId?.grup === seciliGrup);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans">
      {/* 🔍 FİLTRELEME VE ÇIKTI ALMA PANENİ (BASKIDA GİZLENİR) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            📋 Günlük Yoklama & Çıktı Paneli
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            İstediğiniz tarihi ve grubu seçerek katılım listesini görüntüleyin
            ve yazdırın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* TARİH SEÇİMİ */}
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-sm">
            <span className="text-xs font-black text-slate-700 pl-1">
              📅 Tarih:
            </span>
            <input
              type="date"
              value={tarih}
              onChange={(e) => setTarih(e.target.value)}
              className="font-bold text-xs text-slate-950 bg-slate-50 p-2 rounded-xl outline-none"
            />
          </div>

          {/* GRUP SEÇİMİ */}
          <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-sm">
            <span className="text-xs font-black text-slate-700 pl-1">
              🏆 Grup:
            </span>
            <select
              value={seciliGrup}
              onChange={(e) => setSeciliGrup(e.target.value)}
              className="font-black text-xs text-indigo-950 bg-indigo-50 p-2 rounded-xl outline-none cursor-pointer"
            >
              <option value="TÜM GRUPLAR">Tüm Gruplar</option>
              {gruplar.map((g) => (
                <option key={g._id} value={g.ad}>
                  {g.ad}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={yazdir}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2"
          >
            <span>🖨️</span> Çıktı Al / PDF
          </button>
        </div>
      </div>

      {/* 📄 ÇIKTI VE RAPOR SAYFASI */}
      <div className="bg-white p-8 rounded-3xl border-2 border-slate-300 shadow-xl print:shadow-none print:border-none print:p-0">
        {/* ÜST LOGO VE BAŞLIK ALANI */}
        <div className="border-b-2 border-slate-950 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
              🤸‍♀️ BALANS CİMNASTİK AKADEMİ
            </h2>
            <p className="text-xs font-black text-slate-700 uppercase mt-0.5">
              GÜNLÜK YOKLAMA KATILIM RAPORU
            </p>
            <div className="mt-2 text-xs font-black text-indigo-950">
              Seçili Grup:{" "}
              <span className="uppercase text-slate-950 bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                {seciliGrup}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black text-slate-500 uppercase block">
              Yoklama Tarihi
            </span>
            <span className="text-base font-black text-slate-950 font-mono">
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
          <p className="text-slate-600 font-bold py-6">
            Yoklama verileri getiriliyor...
          </p>
        ) : filtrelenmisYoklamalar.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
            Seçilen tarihe ve gruba ait katılım kaydı bulunamadı.
          </div>
        ) : (
          <div>
            {/* ÖĞRENCİ LİSTESİ TABLOSU */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-950 bg-slate-100 text-slate-950 text-xs font-black uppercase">
                  <th className="p-3">#</th>
                  <th className="p-3">Öğrenci Adı Soyadı</th>
                  <th className="p-3">Grup Adı</th>
                  <th className="p-3">Giriş Saati</th>
                  <th className="p-3">Veli Adı / İletişim</th>
                  <th className="p-3 text-right">Durum</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisYoklamalar.map((y, index) => (
                  <tr
                    key={y._id}
                    className="border-b border-slate-200 text-xs text-slate-950"
                  >
                    <td className="p-3 font-mono font-bold text-slate-500">
                      {index + 1}
                    </td>
                    <td className="p-3 font-black text-sm text-slate-950">
                      {y.ogrenciId?.adSoyad || "Bilinmiyor"}
                    </td>
                    <td className="p-3 font-bold text-indigo-950">
                      🏆 {y.ogrenciId?.grup || "-"}
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-900">
                      {y.tarih
                        ? new Date(y.tarih).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="p-3 font-semibold">
                      {y.ogrenciId?.veliAdSoyad || "-"} (
                      {y.ogrenciId?.veliTelefon || "-"})
                    </td>
                    <td className="p-3 text-right font-black text-emerald-800">
                      ✓ Giriş Yapıldı
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✍️ ÇIKTI SAYFASININ EN ALT SAĞ TARAFINDAKİ İSİM VE İMZA HANESİ */}
            <div className="mt-16 pt-6 border-t border-slate-300 flex justify-between items-end text-xs text-slate-900 font-black">
              <div>
                <span>
                  Toplam Katılan Öğrenci Sayısı:{" "}
                  <strong className="text-base text-blue-900 font-mono">
                    {filtrelenmisYoklamalar.length}
                  </strong>
                </span>
              </div>

              <div className="text-center space-y-8 pr-4">
                <div>
                  <span className="block text-[11px] font-black uppercase text-slate-700">
                    Antrenör / Yetkili
                  </span>
                  <span className="block text-xs font-black text-slate-950 mt-1">
                    İsim Soyisim: _____________________
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-black uppercase text-slate-700">
                    İmza
                  </span>
                  <span className="block text-slate-400">
                    _____________________
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
