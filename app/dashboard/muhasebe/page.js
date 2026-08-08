"use client";

import { useEffect, useState } from "react";

export default function MuhasebePage() {
  const simdikiYil = new Date().getFullYear();
  const simdikiAy = new Date().getMonth() + 1;

  // 🗓️ HEDEF VE KIYAS DÖNEM SEÇİM STATE'LERİ
  const [hedefYil, setHedefYil] = useState(simdikiYil);
  const [hedefAy, setHedefAy] = useState(simdikiAy);
  const [kiyasYil, setKiyasYil] = useState(
    simdikiAy === 1 ? simdikiYil - 1 : simdikiYil,
  );
  const [kiyasAy, setKiyasAy] = useState(simdikiAy === 1 ? 12 : simdikiAy - 1);

  const [odemeler, setOdemeler] = useState([]);
  const [sadeceOdemesiGelenler, setSadeceOdemesiGelenler] = useState(false);
  const [loading, setLoading] = useState(true);

  // Patron Finansal Bilanço Verileri State'i
  const [maliData, setMaliData] = useState({
    hedefBeklenenToplam: 0,
    hedefTahsilEdilen: 0,
    hedefKalanAlacak: 0,
    kiyasTahsilEdilen: 0,
    tahsilatFarki: 0,
    toplamAktifOgrenci: 0,
    odemesiGelenSayisi: 0,
  });

  const aylar = [
    { id: 1, ad: "Ocak" },
    { id: 2, ad: "Şubat" },
    { id: 3, ad: "Mart" },
    { id: 4, ad: "Nisan" },
    { id: 5, ad: "Mayıs" },
    { id: 6, ad: "Haziran" },
    { id: 7, ad: "Temmuz" },
    { id: 8, ad: "Ağustos" },
    { id: 9, ad: "Eylül" },
    { id: 10, ad: "Ekim" },
    { id: 11, ad: "Kasım" },
    { id: 12, ad: "Aralık" },
  ];

  const yillar = [simdikiYil - 2, simdikiYil - 1, simdikiYil, simdikiYil + 1];

  const odemeleriGetir = async () => {
    try {
      setLoading(true);
      const query = `hedefYil=${hedefYil}&hedefAy=${hedefAy}&kiyasYil=${kiyasYil}&kiyasAy=${kiyasAy}`;
      const res = await fetch(`/api/muhasebe?${query}`);
      const data = await res.json();

      if (data.success) {
        setOdemeler(data.data || []);
        if (data.dataMali) {
          setMaliData(data.dataMali);
        }
      }
    } catch (err) {
      console.error("Ödemeler ve mali veri çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    odemeleriGetir();
  }, [hedefYil, hedefAy, kiyasYil, kiyasAy]);

  // 📲 GELİŞMİŞ WHATSAPP ÖDEME HATIRLATMA FONKSİYONU (Eski özellik + Yedekli Tel Arama)
  const hatirlatmaGonder = async (odeme) => {
    try {
      const o = odeme.ogrenciId || {};

      // 1. Tüm olası telefon alanlarını sırayla deniyoruz
      let veliTel = o.telefon || o.veliTelefon || "";
      if (
        !veliTel &&
        Array.isArray(o.veliListesi) &&
        o.veliListesi.length > 0
      ) {
        veliTel =
          o.veliListesi[0].telefon || o.veliListesi[0].veliTelefon || "";
      }

      const veliAd = o.veliAdi || o.veliAdSoyad || "Velimiz";
      const ogrenciAd = o.adSoyad || "Sporcumuz";

      if (veliTel) {
        const temizTel = veliTel.replace(/\D/g, "");
        const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
        const mesaj = `Sayın ${veliAd},\n\n*${ogrenciAd}* isimli öğrencimizin aylık kurs aidat ödeme zamanı gelmiştir. Ödemenizi gerçekleştirdiyseniz bu mesajı dikkate almayınız. İyi günler dileriz.\n\nBalans Cimnastik Akademi 🤸‍♀️`;

        window.open(
          `https://wa.me/${tel}?text=${encodeURIComponent(mesaj)}`,
          "_blank",
        );

        // DB'deki gerçek kayıt için hatırlatma durumunu sunucuda güncelle
        if (odeme._id && !String(odeme._id).startsWith("sanal_")) {
          await fetch("/api/muhasebe/hatirlatma", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ odemeId: odeme._id }),
          });
          odemeleriGetir();
        }
      } else {
        alert("⚠️ Bu öğrenciye ait kayıtlı telefon numarası bulunamadı!");
      }
    } catch (err) {
      alert("✕ Mesaj gönderilirken bir hata oluştu!");
    }
  };

  const ayAdGetir = (id) => aylar.find((a) => a.id === Number(id))?.ad || "";

  // Para Biçimlendirici (TL)
  const formatTL = (val) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(val || 0);

  // Filtrelenmiş Ödeme Listesi
  const gosterilecekOdemeler = sadeceOdemesiGelenler
    ? odemeler.filter((m) => m.durum !== "odendi")
    : odemeler;

  return (
    <div className="space-y-8 text-slate-900 pb-12 font-sans">
      {/* 👑 PATRON ÖZEL KONTROL PANELDEN ANA BAŞLIK */}
      <div className="bg-[#0F172A] text-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wide text-amber-400 flex items-center gap-3 uppercase">
            <span>💼</span> Mali Yönetim & Bilanço Paneli
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-300 mt-1">
            Akademi kasasına giren net tutarlar, ödeme takibi ve karşılaştırmalı
            finansal bilanço.
          </p>
        </div>
        <div className="bg-amber-400 text-slate-950 px-4 py-2 rounded-2xl text-xs font-black shadow-lg uppercase tracking-wider">
          👑 Yönetici & Patron Özel Ekranı
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center font-bold text-slate-400">
          Ödemeler ve bilanço hesaplanıyor...
        </div>
      ) : (
        <>
          {/* 📊 BİLANÇO ÖZET KARTLARI (SİSTEMDEN OTOMATİK HESAPLANIR) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* BEKLENEN TOPLAM CİRO */}
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-2">
              <span className="text-xs font-black uppercase text-slate-400">
                🎯 Toplam Beklenen Aylık Ciro
              </span>
              <p className="text-3xl font-black text-slate-900">
                {formatTL(maliData.hedefBeklenenToplam)}
              </p>
              <p className="text-[11px] font-bold text-slate-500">
                Kayıtlı {maliData.toplamAktifOgrenci} aktif sporcu üzerinden
                hesaplandı.
              </p>
            </div>

            {/* TAHSİL EDİLEN (KASAYA GİREN) */}
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-200 shadow-xl space-y-2 bg-emerald-50/30">
              <span className="text-xs font-black uppercase text-emerald-800">
                ✅ Kasaya Giren / Tahsil Edilen
              </span>
              <p className="text-3xl font-black text-emerald-600">
                {formatTL(maliData.hedefTahsilEdilen)}
              </p>
              <p className="text-[11px] font-bold text-emerald-700">
                Ödemesini tamamlayan velilerin net toplamı.
              </p>
            </div>

            {/* KALAN ALACAK / GECİKEN */}
            <div className="bg-white p-6 rounded-3xl border-2 border-rose-200 shadow-xl space-y-2 bg-rose-50/30">
              <span className="text-xs font-black uppercase text-rose-800">
                ⏳ Kalan Alacak / Bekleyen Aidatlar
              </span>
              <p className="text-3xl font-black text-rose-600">
                {formatTL(maliData.hedefKalanAlacak)}
              </p>
              <p className="text-[11px] font-bold text-rose-700">
                Henüz tahsilatı yapılmamış toplam tutar.
              </p>
            </div>
          </div>

          {/* 📈 DÖNEMSEL MALİ KARŞILAŞTIRMA MODÜLÜ (TARİH VS TARİH) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <span>📈</span> Karşılaştırmalı Mali Bilanço Raporu
            </h2>

            {/* TARİH SEÇİM FİLTRELERİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* HEDEF DÖNEM */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Hedef Dönem:
                </span>
                <select
                  value={hedefAy}
                  onChange={(e) => setHedefAy(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={hedefYil}
                  onChange={(e) => setHedefYil(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* KIYASLANACAK DÖNEM */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Kıyaslanacak Dönem:
                </span>
                <select
                  value={kiyasAy}
                  onChange={(e) => setKiyasAy(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={kiyasYil}
                  onChange={(e) => setKiyasYil(Number(e.target.value))}
                  className="bg-white border-2 border-slate-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* KIYASLAMA SONUÇ KARTI */}
            <div className="p-6 bg-emerald-50/70 rounded-3xl border-2 border-emerald-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs font-black uppercase text-emerald-800">
                  💵 Tahsilat Karşılaştırma Analizi
                </span>
                <h3 className="text-2xl font-black text-emerald-950 mt-1">
                  {ayAdGetir(hedefAy)} {hedefYil}:{" "}
                  {formatTL(maliData.hedefTahsilEdilen)}
                </h3>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  Kıyaslanan Dönem ({ayAdGetir(kiyasAy)} {kiyasYil}):{" "}
                  <strong>{formatTL(maliData.kiyasTahsilEdilen)}</strong>
                </p>
              </div>

              <div
                className={`px-5 py-3 rounded-2xl font-black text-sm border shadow-md ${
                  maliData.tahsilatFarki >= 0
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-rose-600 text-white border-rose-700"
                }`}
              >
                {maliData.tahsilatFarki >= 0
                  ? `▲ +${formatTL(maliData.tahsilatFarki)} Gelir Artışı`
                  : `▼ ${formatTL(maliData.tahsilatFarki)} Gelir Azalışı`}
              </div>
            </div>
          </div>

          {/* 📋 ÖDEME GEÇMİŞİ VE AİDAT TAKİP TABLOSU (TÜM ESKİ KOLONLAR KORUNDU) */}
          <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden space-y-0">
            <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-base font-black tracking-wide flex items-center gap-2">
                  <span>📋</span> Ödeme Zamanı Gelenler ve Hatırlatma Listesi
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  Ödemesi gelen öğrenciler sistem tarafından otomatik tespit
                  edilir.
                </p>
              </div>

              {/* FİLTRELEME BUTONU */}
              <button
                onClick={() => setSadeceOdemesiGelenler(!sadeceOdemesiGelenler)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                  sadeceOdemesiGelenler
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-lg"
                    : "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {sadeceOdemesiGelenler
                  ? "Tüm Ödemeleri Göster"
                  : `💳 Sadece Ödemesi Gelenleri Göster (${maliData.odemesiGelenSayisi || 0})`}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800 text-white uppercase text-xs font-black tracking-wider">
                  <tr>
                    <th className="p-4 border-b border-slate-700">
                      Öğrenci & Veli Bilgisi
                    </th>
                    <th className="p-4 border-b border-slate-700">
                      Aidat Tutarı
                    </th>
                    <th className="p-4 border-b border-slate-700">
                      Son Ödeme Tarihi
                    </th>
                    <th className="p-4 border-b border-slate-700">
                      Ödeme Durumu
                    </th>
                    <th className="p-4 border-b border-slate-700">
                      Hatırlatma Durumu
                    </th>
                    <th className="p-4 border-b border-slate-700 text-right">
                      İşlem
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 text-sm font-bold text-slate-900">
                  {gosterilecekOdemeler.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="p-8 text-center text-slate-500 font-black"
                      >
                        Gösterilebilecek ödeme kaydı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    gosterilecekOdemeler.map((m) => (
                      <tr
                        key={m._id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-black text-slate-950 text-base">
                            {m.ogrenciId?.adSoyad || "Öğrenci Silinmiş"}
                          </div>
                          <div className="text-xs font-bold text-slate-500 mt-0.5">
                            Veli: {m.ogrenciId?.veliAdi || "Belirtilmedi"} (
                            {m.ogrenciId?.telefon || "Telefon Yok"})
                          </div>
                        </td>
                        <td className="p-4 font-black text-slate-950 text-lg">
                          {formatTL(m.tutar)}
                        </td>
                        <td className="p-4 text-slate-800 font-extrabold">
                          {m.sonOdemeTarihi
                            ? new Date(m.sonOdemeTarihi).toLocaleDateString(
                                "tr-TR",
                              )
                            : "--.--.----"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-black border ${
                              m.durum === "odendi"
                                ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                                : "bg-rose-100 text-rose-950 border-rose-300 animate-pulse"
                            }`}
                          >
                            {m.durum === "odendi"
                              ? "✓ ÖDENDİ"
                              : "⏳ ÖDEME BEKLİYOR"}
                          </span>
                        </td>
                        <td className="p-4">
                          {m.hatirlatmaGonderildi ? (
                            <span className="text-xs bg-sky-100 text-sky-950 border border-sky-300 px-3 py-1.5 rounded-full font-black">
                              ✓ Mesaj Gönderildi (
                              {m.hatirlatmaTarihi
                                ? new Date(
                                    m.hatirlatmaTarihi,
                                  ).toLocaleDateString("tr-TR")
                                : "Bugün"}
                              )
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-bold">
                              Gönderilmedi
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {m.durum !== "odendi" && (
                            <button
                              onClick={() => hatirlatmaGonder(m)}
                              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-colors border border-amber-500"
                            >
                              📱 Veliye Hatırlat
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
