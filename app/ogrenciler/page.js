"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excelYukleniyor, setExcelYukleniyor] = useState(false);

  const [yeniOgrenci, setYeniOgrenci] = useState({
    adSoyad: "",
    veliAdSoyad: "",
    veliTelefon: "",
    veliYakinlik: "Anne",
    ikinciVeliAdSoyad: "",
    ikinciVeliTelefon: "",
    ikinciVeliYakinlik: "Baba",
    nfcUid: "",
    aylikUcret: 5000,
    odemeGunu: 1,
  });

  useEffect(() => {
    ogrencileriGetir();
  }, []);

  const ogrencileriGetir = async () => {
    try {
      const res = await fetch("/api/ogrenciler?durum=AKTIF", {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) setOgrenciler(result.data);
    } catch (error) {
      console.error("Öğrenciler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📄 EXCEL DOSYASI YÜKLEME VE TOPLU KAYIT
  const handleExcelYukle = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelYukleniyor(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Excel sütun başlıkları: "Ad Soyad", "Veli Ad", "Veli Tel", "Ücret"
        let kayitSayisi = 0;
        for (const item of data) {
          const ogrenciObj = {
            adSoyad: item["Ad Soyad"] || item["OgrenciAd"] || "İsimsiz",
            veliAdSoyad: item["Veli Ad"] || item["VeliAd"] || "Veli",
            veliTelefon: String(item["Veli Tel"] || item["VeliTelefon"] || ""),
            aylikUcret: Number(item["Ücret"] || item["AylikUcret"] || 5000),
            odemeGunu: 1,
          };

          await fetch("/api/ogrenciler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ogrenciObj),
          });
          kayitSayisi++;
        }

        alert(
          `Tebrikler! Excel'den ${kayitSayisi} adet öğrenci başarıyla aktarıldı. 🎉`,
        );
        ogrencileriGetir();
      } catch (err) {
        alert(
          "Excel dosyası okunurken hata oluştu. Lütfen sütun isimlerini kontrol edin.",
        );
      } finally {
        setExcelYukleniyor(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // 🗑️ KALICI SİLME (MongoDB'den Tamamen Kaldırır)
  const kaliciSil = async (id, adSoyad) => {
    if (
      !confirm(
        `⚠️ UYARI: ${adSoyad} isimli öğrenci ve TÜM GEÇMİŞİ kalıcı olarak veritabanından silinecektir! Bu işlem geri alınamaz. Emin misiniz?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/ogrenciler/sil", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${adSoyad} veritabanından kalıcı olarak silindi.`);
        ogrencileriGetir();
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("Silme işleminde hata oluştu.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/ogrenciler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yeniOgrenci),
      });

      const result = await res.json();
      if (result.success) {
        alert("Öğrenci kaydı başarıyla oluşturuldu! 🎉");
        setYeniOgrenci({
          adSoyad: "",
          veliAdSoyad: "",
          veliTelefon: "",
          veliYakinlik: "Anne",
          ikinciVeliAdSoyad: "",
          ikinciVeliTelefon: "",
          ikinciVeliYakinlik: "Baba",
          nfcUid: "",
          aylikUcret: 5000,
          odemeGunu: 1,
        });
        ogrencileriGetir();
      }
    } catch (err) {
      alert("Kayıt oluşturulurken hata oluştu.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            🎓 Aktif Öğrenci Yönetimi
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Toplam Aktif Öğrenci Sayısı:{" "}
            <span className="text-blue-600 font-black">
              {ogrenciler.length}
            </span>
          </p>
        </div>

        {/* 📊 EXCEL İLE TOPLU ÖĞRENCİ YÜKLEME BUTONU */}
        <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex items-center gap-3">
          <div className="text-xs font-black text-slate-700">
            📊 Excel'den Yükle:
          </div>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelYukle}
            className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
          />
        </div>
      </div>

      {excelYukleniyor && (
        <div className="bg-emerald-900 text-white p-4 rounded-2xl mb-6 font-bold animate-pulse">
          ⏳ Excel dosyasındaki öğrenciler veritabanına aktarılıyor, lütfen
          bekleyin...
        </div>
      )}

      {/* YENİ ÖĞRENCİ KAYIT FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          ➕ Tekli Yeni Öğrenci Kaydı
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <div className="md:col-span-3">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              Öğrenci Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition"
              placeholder="Örn: Zeynep Asel KAN"
              value={yeniOgrenci.adSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, adSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Veli Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
              placeholder="Örn: Merve KAN"
              value={yeniOgrenci.veliAdSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliAdSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Veli Telefon *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
              placeholder="5551234567"
              value={yeniOgrenci.veliTelefon}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliTelefon: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              Aylık Ücret (₺)
            </label>
            <input
              type="number"
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-slate-50"
              value={yeniOgrenci.aylikUcret}
              onChange={(e) =>
                setYeniOgrenci({
                  ...yeniOgrenci,
                  aylikUcret: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-8 rounded-xl text-sm transition shadow-md"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* TÜM ÖĞRENCİLER LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          📋 Aktif Öğrenci Listesi
        </h2>
        {loading ? (
          <p className="text-slate-700 font-bold">Yükleniyor...</p>
        ) : ogrenciler.length === 0 ? (
          <p className="text-slate-700 font-bold py-4">
            Henüz aktif kayıtlı öğrenci yok.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Öğrenci Adı</th>
                  <th className="p-4">Veli İletişim</th>
                  <th className="p-4">NFC UID</th>
                  <th className="p-4">Ücret</th>
                  <th className="p-4 text-right">Eylemler (Sil / Arşivle)</th>
                </tr>
              </thead>
              <tbody>
                {ogrenciler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-200 hover:bg-slate-50 text-slate-950 transition"
                  >
                    <td className="p-4 font-black text-base">{o.adSoyad}</td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">
                        {o.veliAdSoyad}
                      </div>
                      <div className="text-xs font-bold text-slate-700 font-mono">
                        {o.veliTelefon}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-black text-xs text-indigo-950 bg-slate-100/80 px-2 py-1 rounded">
                      {o.nfcUid || "Tanımlı Değil"}
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-base">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🗑️ DENEME KAYITLARINI TAMAMEN SİLME BUTONU */}
                        <button
                          onClick={() => kaliciSil(o._id, o.adSoyad)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                          title="Sistemden tamamen siler"
                        >
                          🗑️ Kalıcı Sil
                        </button>
                      </div>
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
