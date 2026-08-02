"use client";
import { useState, useEffect } from "react";

// TANIMLI KURS GRUPLARI (İsteğinize göre ekleyip çıkarabilirsiniz)
const GRUPLAR = [
  "Başlangıç Grubu",
  "Orta Seviye Grubu",
  "İleri Seviye Grubu",
  "Yarışma / Performans Grubu",
  "Hobi Grubu",
];

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliGrupFiltre, setSeciliGrupFiltre] = useState("TUMU");

  const [seciliOgrenciDetay, setSeciliOgrenciDetay] = useState(null);
  const [detayLoading, setDetayLoading] = useState(false);

  const [yeniOgrenci, setYeniOgrenci] = useState({
    adSoyad: "",
    grup: "Başlangıç Grubu",
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
  }, [seciliGrupFiltre]);

  const ogrencileriGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ogrenciler?durum=AKTIF&grup=${seciliGrupFiltre}`,
        { cache: "no-store" },
      );
      const result = await res.json();
      if (result.success) setOgrenciler(result.data);
    } catch (error) {
      console.error("Öğrenciler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 GRUPLAR ARASI TRANSFER İŞLEMİ
  const grupTransferEt = async (id, adSoyad, mevcutGrup) => {
    const yeniGrup = prompt(
      `${adSoyad} isimli öğrenciyi hangi gruba transfer etmek istersiniz?\n\nMevcut Grup: ${mevcutGrup}\n\nSeçenekler:\n${GRUPLAR.join("\n")}`,
      mevcutGrup,
    );

    if (!yeniGrup || yeniGrup === mevcutGrup) return;

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, grup: yeniGrup }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          `${adSoyad} başarıyla "${yeniGrup}" seviyesine transfer edildi! 🎉`,
        );
        if (seciliOgrenciDetay?.ogrenci._id === id) {
          setSeciliOgrenciDetay((prev) => ({
            ...prev,
            ogrenci: { ...prev.ogrenci, grup: yeniGrup },
          }));
        }
        ogrencileriGetir();
      }
    } catch (err) {
      alert("Transfer işleminde hata oluştu.");
    }
  };

  // 🔍 ÖĞRENCİ DETAY GETİR
  const ogrenciDetayGetir = async (id) => {
    setDetayLoading(true);
    try {
      const res = await fetch(`/api/ogrenciler/detay?id=${id}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setSeciliOgrenciDetay(result.data);
      }
    } catch (err) {
      alert("Öğrenci detayları alınamadı.");
    } finally {
      setDetayLoading(false);
    }
  };

  const kaliciSil = async (id, adSoyad) => {
    if (
      !confirm(`⚠️ UYARI: ${adSoyad} kalıcı olarak silinecektir! Emin misiniz?`)
    )
      return;
    try {
      const res = await fetch("/api/ogrenciler/sil", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) {
        alert(`${adSoyad} silindi.`);
        if (seciliOgrenciDetay?.ogrenci._id === id) setSeciliOgrenciDetay(null);
        ogrencileriGetir();
      }
    } catch (err) {
      alert("Silme hatası");
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
        alert(
          `${yeniOgrenci.adSoyad} "${yeniOgrenci.grup}" kadrosuna kaydedildi! 🎉`,
        );
        setYeniOgrenci({
          adSoyad: "",
          grup: "Başlangıç Grubu",
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

  // Metne ve Gruba Göre Canlı Filtreleme
  const filtrelenmisOgrenciler = ogrenciler.filter(
    (o) =>
      o.adSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliAdSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliTelefon.includes(aramaMetni),
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            🎓 Öğrenci & Grup Yönetimi
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Öğrencileri gruplara göre süzebilir ve gelişimine göre transfer
            edebilirsiniz.
          </p>
        </div>
      </div>

      {/* 🔍 ARAMA VE GRUP FİLTRELEME PANENİ */}
      <div className="bg-white p-5 rounded-3xl shadow-md border border-slate-300 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-700 uppercase mb-1">
            🔍 Öğrenci / Veli Ara
          </label>
          <input
            type="text"
            placeholder="İsim veya telefon numarası yazın..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 uppercase mb-1">
            🏷️ Gruba Göre Filtrele
          </label>
          <select
            value={seciliGrupFiltre}
            onChange={(e) => setSeciliGrupFiltre(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-white"
          >
            <option value="TUMU">Tüm Gruplar ({ogrenciler.length})</option>
            {GRUPLAR.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ➕ YENİ ÖĞRENCİ KAYIT FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          ➕ Yeni Öğrenci & İlk Grup Kaydı
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">
              Öğrenci Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50"
              placeholder="Örn: Zeynep Asel KAN"
              value={yeniOgrenci.adSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, adSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">
              Başlangıç Grubu *
            </label>
            <select
              className="w-full border-2 border-blue-600 p-3 rounded-xl text-sm font-black text-blue-900 bg-blue-50"
              value={yeniOgrenci.grup}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, grup: e.target.value })
              }
            >
              {GRUPLAR.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* VELİ VE İLETİŞİM ALANLARI */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Veli Ad Soyad *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
              value={yeniOgrenci.veliAdSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliAdSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Veli Telefon *
            </label>
            <input
              type="text"
              required
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
              value={yeniOgrenci.veliTelefon}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliTelefon: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-900 uppercase mb-1">
              Aylık Ücret (₺)
            </label>
            <input
              type="number"
              className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-sm font-bold text-slate-950"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-8 rounded-xl text-sm transition shadow-md"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 📋 ÖĞRENCİ LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
          <span>📋 Kayıtlı Öğrenci Listesi</span>
          <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-600 font-bold">
            Gösterilen: {filtrelenmisOgrenciler.length} / {ogrenciler.length}
          </span>
        </h2>

        {loading ? (
          <p className="text-slate-700 font-bold">Yükleniyor...</p>
        ) : filtrelenmisOgrenciler.length === 0 ? (
          <p className="text-slate-700 font-bold py-4">
            Arama kriterinize uygun öğrenci bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Öğrenci Adı</th>
                  <th className="p-4">Mevcut Grubu</th>
                  <th className="p-4">1. Veli İletişim</th>
                  <th className="p-4">Ücret</th>
                  <th className="p-4 text-right">Grup Transfer & Sil</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisOgrenciler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-200 hover:bg-blue-50/50 text-slate-950 transition"
                  >
                    <td className="p-4">
                      <button
                        onClick={() => ogrenciDetayGetir(o._id)}
                        className="font-black text-base text-blue-700 hover:text-blue-900 hover:underline text-left"
                      >
                        👤 {o.adSoyad}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-900 font-black text-xs px-3 py-1.5 rounded-xl border border-indigo-200">
                        🏆 {o.grup || "Başlangıç Grubu"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">
                        {o.veliAdSoyad}
                      </div>
                      <div className="text-xs font-bold text-slate-700 font-mono">
                        {o.veliTelefon}
                      </div>
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-base">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🔄 GRUP TRANSFER BUTONU */}
                        <button
                          onClick={() =>
                            grupTransferEt(
                              o._id,
                              o.adSoyad,
                              o.grup || "Başlangıç Grubu",
                            )
                          }
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold py-1.5 px-3 rounded-lg text-xs transition"
                          title="Öğrenciyi üst/alt gruba transfer et"
                        >
                          🔄 Transfer Et
                        </button>
                        <button
                          onClick={() => kaliciSil(o._id, o.adSoyad)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition"
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

      {/* 🔍 ÖĞRENCİ DETAY MODALI */}
      {detayLoading && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl font-bold text-slate-900">
            ⏳ Yükleniyor...
          </div>
        </div>
      )}

      {seciliOgrenciDetay && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Öğrenci Detay Kartı
                </span>
                <h2 className="text-2xl font-black mt-1 text-emerald-400">
                  {seciliOgrenciDetay.ogrenci.adSoyad}
                </h2>
              </div>
              <button
                onClick={() => setSeciliOgrenciDetay(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white w-9 h-9 rounded-full font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* GRUP BİLGİSİ VE TRANSFER */}
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase block">
                    Kayıtlı Grubu
                  </span>
                  <span className="text-lg font-black text-indigo-950">
                    🏆 {seciliOgrenciDetay.ogrenci.grup || "Başlangıç Grubu"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    grupTransferEt(
                      seciliOgrenciDetay.ogrenci._id,
                      seciliOgrenciDetay.ogrenci.adSoyad,
                      seciliOgrenciDetay.ogrenci.grup || "Başlangıç Grubu",
                    )
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition"
                >
                  🔄 Grubu Değiştir / Transfer Et
                </button>
              </div>

              {/* FINANS VE YOKLAMA GEÇMİŞİ */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase block">
                    Aylık Ücret
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    ₺ {seciliOgrenciDetay.ogrenci.aylikUcret}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase block">
                    Toplam Katılım
                  </span>
                  <span className="text-lg font-black text-blue-700">
                    {seciliOgrenciDetay.toplamGelis} Ders
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setSeciliOgrenciDetay(null)}
                className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
