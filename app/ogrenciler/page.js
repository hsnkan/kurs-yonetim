"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [excelYukleniyor, setExcelYukleniyor] = useState(false);
  const [rehberGoster, setRehberGoster] = useState(false);

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

  // 📥 ÖRNEK EXCEL ŞABLONU İNDİRME FONKSİYONU
  const ornekSablonIndir = () => {
    const sablonData = [
      {
        "Öğrenci Adı": "Zeynep Asel KAN",
        "Anne Adı": "Merve KAN",
        "Anne Tel": "5551234567",
        "Baba Adı": "Ahmet KAN",
        "Baba Tel": "5559876543",
        "Kart UID": "A1B2C3D4",
        Ücret: 5000,
        "Ödeme Günü": 5,
      },
      {
        "Öğrenci Adı": "Ali YILMAZ",
        "Anne Adı": "Ayşe YILMAZ",
        "Anne Tel": "5420001122",
        "Baba Adı": "",
        "Baba Tel": "",
        "Kart UID": "",
        Ücret: 4500,
        "Ödeme Günü": 1,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sablonData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Öğrenci Sablonu");
    XLSX.writeFile(workbook, "Balans_Cimnastik_Ogrenci_Yukleme_Sablonu.xlsx");
  };

  // 📊 DETAYLI EXCEL / CSV YÜKLEME FONKSİYONU
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

        let kayitSayisi = 0;
        for (const item of data) {
          const ogrenciObj = {
            adSoyad:
              item["Öğrenci Adı"] ||
              item["Ad Soyad"] ||
              item["OgrenciAd"] ||
              "İsimsiz Öğrenci",
            veliAdSoyad:
              item["Anne Adı"] ||
              item["1. Veli Adı"] ||
              item["Veli Ad"] ||
              item["VeliAd"] ||
              "Veli",
            veliTelefon: String(
              item["Anne Tel"] ||
                item["1. Veli Tel"] ||
                item["Veli Tel"] ||
                item["VeliTelefon"] ||
                "",
            ),
            veliYakinlik: item["1. Veli Yakınlık"] || "Anne",
            ikinciVeliAdSoyad:
              item["Baba Adı"] ||
              item["2. Veli Adı"] ||
              item["İkinci Veli Ad"] ||
              "",
            ikinciVeliTelefon: String(
              item["Baba Tel"] ||
                item["2. Veli Tel"] ||
                item["İkinci Veli Tel"] ||
                "",
            ),
            ikinciVeliYakinlik: item["2. Veli Yakınlık"] || "Baba",
            nfcUid: String(
              item["Kart UID"] || item["NFC UID"] || item["Kart No"] || "",
            ).trim(),
            aylikUcret: Number(
              item["Ücret"] ||
                item["Aylık Ücret"] ||
                item["AylikUcret"] ||
                5000,
            ),
            odemeGunu: Number(item["Ödeme Günü"] || item["OdemeGunu"] || 1),
          };

          await fetch("/api/ogrenciler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ogrenciObj),
          });
          kayitSayisi++;
        }

        alert(
          `Tebrikler! Excel'den ${kayitSayisi} adet öğrencinin tüm bilgileri başarıyla aktarıldı. 🎉`,
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

  const kartKoduAtamasiYap = async (id, mevcutAd) => {
    const yeniKartUid = prompt(
      `${mevcutAd} için yeni NFC Kart UID Kodunu okutun veya girin:`,
    );
    if (!yeniKartUid || !yeniKartUid.trim()) return;

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nfcUid: yeniKartUid.trim() }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          `NFC Kartı (${yeniKartUid}) ${mevcutAd} isimli öğrenciye başarıyla tanımlandı! 🎉`,
        );
        ogrencileriGetir();
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("Kart tanımlanırken bir hata oluştu.");
    }
  };

  const kaliciSil = async (id, adSoyad) => {
    if (
      !confirm(
        `⚠️ UYARI: ${adSoyad} isimli öğrenci ve TÜM GEÇMİŞİ kalıcı olarak silinecektir! Emin misiniz?`,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

        {/* EXCEL İŞLEM ALANI */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={ornekSablonIndir}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <span>📥</span> Örnek Şablon Excel'i İndir
          </button>

          <button
            onClick={() => setRehberGoster(!rehberGoster)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <span>ℹ️</span> Sütun Format Rehberi
          </button>

          <div className="bg-white p-2.5 rounded-xl border border-slate-300 shadow-sm flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelYukle}
              className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 📊 GÖRSEL SÜTUN REHBERİ TABLOSU (İSTEĞE BAĞLI AÇILIR) */}
      {rehberGoster && (
        <div className="bg-indigo-950 text-white p-6 rounded-3xl mb-8 shadow-xl animate-fade-in border border-indigo-800">
          <div className="flex items-center justify-between mb-4 border-b border-indigo-800 pb-3">
            <h3 className="text-base font-black text-indigo-300 flex items-center gap-2">
              <span>📊</span> Excel Sütun Başlıkları Nasıl Olmalı?
            </h3>
            <button
              onClick={() => setRehberGoster(false)}
              className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-lg"
            >
              ✕ Kapat
            </button>
          </div>

          <p className="text-xs text-indigo-200 mb-4 font-medium">
            Excel dosyanızın ilk satırındaki sütun isimlerini tam olarak
            aşağıdaki gibi yazarsanız veriler eksiksiz aktarılır:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border border-indigo-800">
              <thead className="bg-indigo-900 text-emerald-400 font-bold">
                <tr>
                  <th className="p-2.5 border-r border-indigo-800">
                    Öğrenci Adı
                  </th>
                  <th className="p-2.5 border-r border-indigo-800">Anne Adı</th>
                  <th className="p-2.5 border-r border-indigo-800">Anne Tel</th>
                  <th className="p-2.5 border-r border-indigo-800">Baba Adı</th>
                  <th className="p-2.5 border-r border-indigo-800">Baba Tel</th>
                  <th className="p-2.5 border-r border-indigo-800">Kart UID</th>
                  <th className="p-2.5 border-r border-indigo-800">Ücret</th>
                  <th className="p-2.5">Ödeme Günü</th>
                </tr>
              </thead>
              <tbody className="text-indigo-100 bg-indigo-950/60">
                <tr>
                  <td className="p-2.5 border-r border-indigo-800 font-bold">
                    Zeynep Asel KAN
                  </td>
                  <td className="p-2.5 border-r border-indigo-800">
                    Merve KAN
                  </td>
                  <td className="p-2.5 border-r border-indigo-800">
                    5551234567
                  </td>
                  <td className="p-2.5 border-r border-indigo-800">
                    Ahmet KAN
                  </td>
                  <td className="p-2.5 border-r border-indigo-800">
                    5559876543
                  </td>
                  <td className="p-2.5 border-r border-indigo-800 text-amber-300">
                    A1B2C3D4
                  </td>
                  <td className="p-2.5 border-r border-indigo-800 text-emerald-300">
                    5000
                  </td>
                  <td className="p-2.5">5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {excelYukleniyor && (
        <div className="bg-emerald-900 text-white p-4 rounded-2xl mb-6 font-bold animate-pulse">
          ⏳ Excel dosyasındaki anne/baba ve tüm öğrenci detayları aktarılıyor,
          lütfen bekleyin...
        </div>
      )}

      {/* MANÜEL TEKLİ ÖĞRENCİ KAYIT FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          ➕ Manuel Tekli Öğrenci Kaydı
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

          {/* 1. VELİ */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/60 p-4 rounded-2xl border border-blue-200">
            <div className="md:col-span-3 text-xs font-black text-blue-900 uppercase tracking-wider">
              👨‍gsub 1. Veli Bilgileri (Anne / Ana İletişim)
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Yakınlık
              </label>
              <select
                className="w-full border-2 border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-900 bg-white"
                value={yeniOgrenci.veliYakinlik}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    veliYakinlik: e.target.value,
                  })
                }
              >
                <option value="Anne">Anne</option>
                <option value="Baba">Baba</option>
                <option value="Vasi">Vasi / Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                required
                className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
                placeholder="Örn: Merve KAN"
                value={yeniOgrenci.veliAdSoyad}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    veliAdSoyad: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Telefon *
              </label>
              <input
                type="text"
                required
                className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
                placeholder="5551234567"
                value={yeniOgrenci.veliTelefon}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    veliTelefon: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* 2. VELİ */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-300">
            <div className="md:col-span-3 text-xs font-black text-slate-700 uppercase tracking-wider">
              👨‍👩‍👧 2. Veli Bilgileri (Baba / İkinci İletişim)
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Yakınlık
              </label>
              <select
                className="w-full border-2 border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-900 bg-white"
                value={yeniOgrenci.ikinciVeliYakinlik}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    ikinciVeliYakinlik: e.target.value,
                  })
                }
              >
                <option value="Baba">Baba</option>
                <option value="Anne">Anne</option>
                <option value="Vasi">Vasi / Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Ad Soyad
              </label>
              <input
                type="text"
                className="w-full border-2 border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
                placeholder="Örn: Ahmet KAN"
                value={yeniOgrenci.ikinciVeliAdSoyad}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    ikinciVeliAdSoyad: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Telefon
              </label>
              <input
                type="text"
                className="w-full border-2 border-slate-300 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-white"
                placeholder="5559876543"
                value={yeniOgrenci.ikinciVeliTelefon}
                onChange={(e) =>
                  setYeniOgrenci({
                    ...yeniOgrenci,
                    ikinciVeliTelefon: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              NFC Kart UID (KODU)
            </label>
            <input
              type="text"
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-black font-mono text-slate-950 bg-slate-50"
              placeholder="Kartı okutun..."
              value={yeniOgrenci.nfcUid}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, nfcUid: e.target.value })
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

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              Ödeme Günü (1-31)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950 bg-slate-50"
              value={yeniOgrenci.odemeGunu}
              onChange={(e) =>
                setYeniOgrenci({
                  ...yeniOgrenci,
                  odemeGunu: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="md:col-span-3 mt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-8 rounded-xl text-sm transition shadow-md w-full md:w-auto"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* TÜM ÖĞRENCİLER LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          📋 Aktif Kayıtlı Öğrenci Listesi
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
                  <th className="p-4">1. Veli (Anne)</th>
                  <th className="p-4">2. Veli (Baba)</th>
                  <th className="p-4">NFC Kart UID</th>
                  <th className="p-4">Ücret / Gün</th>
                  <th className="p-4 text-right">Eylemler</th>
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
                        {o.veliAdSoyad}{" "}
                        <span className="text-xs text-blue-700">
                          ({o.veliYakinlik || "Anne"})
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                        {o.veliTelefon}
                      </div>
                    </td>
                    <td className="p-4">
                      {o.ikinciVeliAdSoyad ? (
                        <>
                          <div className="font-extrabold text-slate-900">
                            {o.ikinciVeliAdSoyad}{" "}
                            <span className="text-xs text-slate-600">
                              ({o.ikinciVeliYakinlik || "Baba"})
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-700 font-mono mt-0.5">
                            {o.ikinciVeliTelefon}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">
                          Kayıtlı Değil
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {o.nfcUid ? (
                        <span className="font-mono font-black text-xs text-indigo-950 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          💳 {o.nfcUid}
                        </span>
                      ) : (
                        <button
                          onClick={() => kartKoduAtamasiYap(o._id, o.adSoyad)}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-black px-2.5 py-1 rounded-lg transition"
                        >
                          ➕ Kart Tanımla
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-black text-emerald-700 text-base">
                        ₺ {o.aylikUcret}
                      </div>
                      <div className="text-xs font-bold text-slate-600">
                        Her ayın {o.odemeGunu || 1}'i
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {o.nfcUid && (
                          <button
                            onClick={() => kartKoduAtamasiYap(o._id, o.adSoyad)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-1.5 px-2.5 rounded-lg text-xs transition border border-slate-300"
                            title="Kart Kodunu Değiştir"
                          >
                            ✏️ Kartı Değiştir
                          </button>
                        )}
                        <button
                          onClick={() => kaliciSil(o._id, o.adSoyad)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition shadow-sm"
                          title="Sistemden tamamen siler"
                        >
                          🗑️ Sil
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
