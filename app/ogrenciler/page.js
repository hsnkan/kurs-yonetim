"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grupLink, setGrupLink] = useState(
    "https://chat.whatsapp.com/Kx1Y2z3abc456def...",
  );

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

  const ogrencileriGetir = async () => {
    try {
      const res = await fetch("/api/ogrenciler?durum=AKTIF", {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setOgrenciler(result.data);
      }
    } catch (error) {
      console.error("Öğrenciler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ogrencileriGetir();
  }, []);

  const whatsappDavetGonder = (veliAd, telefon) => {
    if (!telefon) return;
    const temizTel = telefon.replace(/\D/g, "");
    const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
    const mesaj = `Sayın ${veliAd}, Balans Cimnastik ailesine hoş geldiniz! 🤸\n\nResmi duyuru ve bilgilendirmeleri takip edebileceğiniz WhatsApp Veliler Grubumuza katılmak için lütfen aşağıdaki bağlantıya tıklayın:\n\n${grupLink}`;
    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(mesaj)}`,
      "_blank",
    );
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

        if (
          confirm(
            `1. Veli (${yeniOgrenci.veliAdSoyad}) için WhatsApp grup daveti gönderilsin mi?`,
          )
        ) {
          whatsappDavetGonder(yeniOgrenci.veliAdSoyad, yeniOgrenci.veliTelefon);
        }

        if (
          yeniOgrenci.ikinciVeliTelefon &&
          confirm(
            `2. Veli (${yeniOgrenci.ikinciVeliAdSoyad}) için WhatsApp grup daveti gönderilsin mi?`,
          )
        ) {
          whatsappDavetGonder(
            yeniOgrenci.ikinciVeliAdSoyad,
            yeniOgrenci.ikinciVeliTelefon,
          );
        }

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
      } else {
        alert("Hata: " + result.error);
      }
    } catch (err) {
      alert("Kayıt oluşturulurken bir hata oluştu.");
    }
  };

  // ÖĞRENCİYİ ARŞİVLE (PASİFE AL)
  const ogrenciArsivle = async (id, adSoyad) => {
    if (
      !confirm(
        `${adSoyad} isimli öğrenciyi arşivlemek (pasife almak) istediğinize emin misiniz?`,
      )
    )
      return;

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, durum: "PASIF" }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${adSoyad} arşive kaldırıldı.`);
        ogrencileriGetir();
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
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          🎓 Aktif Öğrenci Yönetimi
        </h1>

        {/* ARŞİV EKRANINA GİT BUTONU */}
        <Link
          href="/ogrenciler/arsiv"
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <span>📁</span>
          <span>Ayrılan / Pasif Öğrenci Arşivi →</span>
        </Link>
      </div>

      {/* YENİ ÖĞRENCİ KAYIT FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          ➕ Yeni Öğrenci Kaydı
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
              👨‍👩‍👧 1. Veli Bilgileri (Ana İletişim Kişisi)
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
              👨‍👩‍👧 2. Veli Bilgileri (İkinci İletişim / Opsiyonel)
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

          {/* DİĞER KURS BİLGİLERİ */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-1.5">
              NFC Kart UID (Opsiyonel)
            </label>
            <input
              type="text"
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-black font-mono text-slate-950 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition"
              placeholder="123456789"
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
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition"
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
              Her Ayın Hangi Günü Ödeme?
            </label>
            <input
              type="number"
              min="1"
              max="31"
              className="w-full border-2 border-slate-400 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition"
              value={yeniOgrenci.odemeGunu}
              onChange={(e) =>
                setYeniOgrenci({
                  ...yeniOgrenci,
                  odemeGunu: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="md:col-span-3 mt-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 px-8 rounded-xl text-sm transition shadow-md w-full md:w-auto"
            >
              Kaydet & Velilere WhatsApp Daveti Gönder
            </button>
          </div>
        </form>
      </div>

      {/* TÜM ÖĞRENCİLER LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-900 border-b border-slate-200 pb-3">
          📋 Aktif Kayıtlı Öğrenciler Listesi
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
                  <th className="p-4">1. Veli (Ana)</th>
                  <th className="p-4">2. Veli (Ek)</th>
                  <th className="p-4">NFC UID</th>
                  <th className="p-4">Ücret</th>
                  <th className="p-4 text-right">Eylem</th>
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
                    <td className="p-4 font-mono font-black text-xs text-indigo-950 bg-slate-100/80 px-2 py-1 rounded">
                      {o.nfcUid || "Tanımlı Değil"}
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-base">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => ogrenciArsivle(o._id, o.adSoyad)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold py-1.5 px-3 rounded-lg text-xs transition inline-flex items-center gap-1"
                      >
                        📁 Arşivle / Pasif Et
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
