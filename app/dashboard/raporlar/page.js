"use client";

import { useEffect, useState } from "react";

export default function RaporlarPage() {
  const simdikiTarih = new Date();
  const simdikiYil = simdikiTarih.getFullYear();
  const simdikiAy = simdikiTarih.getMonth() + 1;
  const simdikiGun = simdikiTarih.getDate();

  // 📅 GÜNLÜK YOKLAMA FİLTRE STATE'LERİ
  const [secilenGun, setSecilenGun] = useState(simdikiGun);
  const [secilenGunAy, setSecilenGunAy] = useState(simdikiAy);
  const [secilenGunYil, setSecilenGunYil] = useState(simdikiYil);

  // 1. YENİ KAYIT FİLTRELERİ (Eski Özellik Korundu)
  const [yeniHedefYil, setYeniHedefYil] = useState(simdikiYil);
  const [yeniHedefAy, setYeniHedefAy] = useState(simdikiAy);
  const [yeniKiyasYil, setYeniKiyasYil] = useState(
    simdikiAy === 1 ? simdikiYil - 1 : simdikiYil,
  );
  const [yeniKiyasAy, setYeniKiyasAy] = useState(
    simdikiAy === 1 ? 12 : simdikiAy - 1,
  );

  // 2. DONDURULAN FİLTRELERİ (Eski Özellik Korundu)
  const [donHedefYil, setDonHedefYil] = useState(simdikiYil);
  const [donHedefAy, setDonHedefAy] = useState(simdikiAy);
  const [donKiyasYil, setDonKiyasYil] = useState(
    simdikiAy === 1 ? simdikiYil - 1 : simdikiYil,
  );
  const [donKiyasAy, setDonKiyasAy] = useState(
    simdikiAy === 1 ? 12 : simdikiAy - 1,
  );

  const [loading, setLoading] = useState(true);

  const [raporData, setRaporData] = useState({
    gunlukYoklamaListesi: [],
    toplamOgrenci: 0,
    aktifOgrenci: 0,
    pasifOgrenci: 0,
    yeniHedefSayi: 0,
    yeniKiyasSayi: 0,
    yeniFark: 0,
    donHedefSayi: 0,
    donKiyasSayi: 0,
    donFark: 0,
    grupDağılimi: [],
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
  const gunler = Array.from({ length: 31 }, (_, i) => i + 1);

  const raporlariGetir = async () => {
    try {
      setLoading(true);
      const query = `gun=${secilenGun}&gunAy=${secilenGunAy}&gunYil=${secilenGunYil}&yeniHedefYil=${yeniHedefYil}&yeniHedefAy=${yeniHedefAy}&yeniKiyasYil=${yeniKiyasYil}&yeniKiyasAy=${yeniKiyasAy}&donHedefYil=${donHedefYil}&donHedefAy=${donHedefAy}&donKiyasYil=${donKiyasYil}&donKiyasAy=${donKiyasAy}`;
      const res = await fetch(`/api/raporlar?${query}`);
      const data = await res.json();
      if (data.success) {
        setRaporData(data.data);
      }
    } catch (err) {
      console.error("Rapor çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    raporlariGetir();
  }, [
    secilenGun,
    secilenGunAy,
    secilenGunYil,
    yeniHedefYil,
    yeniHedefAy,
    yeniKiyasYil,
    yeniKiyasAy,
    donHedefYil,
    donHedefAy,
    donKiyasYil,
    donKiyasAy,
  ]);

  const ayAdGetir = (id) => aylar.find((a) => a.id === Number(id))?.ad || "";

  // 📄 SEÇİLEN GÜNÜN YOKLAMA LİSTESİNİ PDF OLARAK YAZDIRMA
  const secilenGunPdfYazdir = () => {
    const tarihMetni = `${secilenGun} ${ayAdGetir(secilenGunAy)} ${secilenGunYil}`;
    const liste = raporData.gunlukYoklamaListesi || [];

    const satirIcerikleri = liste
      .map((y, index) => {
        const adSoyad =
          y.ogrenciId?.adSoyad || y.ogrenciAdi || y.adSoyad || "Sporcu";
        const grup = y.ogrenciId?.grup || y.grup || "Grup Belirtilmedi";
        const saat = y.tarih
          ? new Date(y.tarih).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "--:--";

        return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${index + 1}</td>
          <td style="text-align: center; font-weight: bold; color: #047857;">${saat}</td>
          <td><strong>${adSoyad}</strong></td>
          <td>${grup}</td>
          <td style="text-align: center; color: #047857; font-weight: bold;">✓ Katıldı</td>
        </tr>
      `;
      })
      .join("");

    const printWindow = window.open("", "_blank");
    const htmlIcerik = `
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Yoklama Raporu - ${tarihMetni}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 18pt; font-weight: 800; text-transform: uppercase; }
          .sub { font-size: 11pt; font-weight: 700; color: #D97706; margin-top: 4px; }
          .info-bar { display: flex; justify-content: space-between; font-size: 10pt; font-weight: bold; background: #F1F5F9; padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #CBD5E1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #CBD5E1; padding: 8px 10px; font-size: 9.5pt; }
          th { background: #0F172A; color: #FFF; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BALANS CİMNASTİK AKADEMİSİ</div>
          <div class="sub">GÜNLÜK ÖZEL YOKLAMA VE DERSE KATILIM RAPORU</div>
        </div>
        <div class="info-bar">
          <span>Seçilen Tarih: ${tarihMetni}</span>
          <span>Derse Katılan Toplam Sporcu: ${liste.length} Kişi</span>
        </div>
        <table>
          <thead>
            <tr>
              <th width="40">#</th>
              <th width="80">Giriş Saati</th>
              <th>Sporcu Ad Soyad</th>
              <th>Cimnastik Grubu</th>
              <th width="100">Durum</th>
            </tr>
          </thead>
          <tbody>
            ${
              satirIcerikleri.length > 0
                ? satirIcerikleri
                : '<tr><td colSpan="5" style="text-align:center; padding:20px;">Bu tarihte kaydolmuş derse giriş verisi bulunmamaktadır.</td></tr>'
            }
          </tbody>
        </table>
        <script>
          window.onload = function() { setTimeout(function() { window.print(); }, 300); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlIcerik);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 text-slate-900 pb-12 font-sans">
      {/* ÜST BAŞLIK */}
      <div className="bg-[#0F172A] text-white p-6 rounded-3xl shadow-2xl flex justify-between items-center border border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-wide flex items-center gap-2">
            <span>📊</span> Raporlar & Analiz Paneli
          </h1>
          <p className="text-xs font-bold text-amber-400 mt-1">
            Günlük özel yoklama dökümü, dönemsel kıyaslamalar ve öğrenci
            hareketleri.
          </p>
        </div>
        <button
          onClick={raporlariGetir}
          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all"
        >
          <span>🔄</span> Yenile
        </button>
      </div>

      {/* GENEL DURUM ÖZETİ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <span className="text-[10px] font-black uppercase text-slate-400">
            Toplam Kayıtlı Öğrenci
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {raporData.toplamOgrenci} Sporcu
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <span className="text-[10px] font-black uppercase text-slate-400">
            Aktif Sporcu Sayısı
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {raporData.aktifOgrenci} Sporcu
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <span className="text-[10px] font-black uppercase text-slate-400">
            Pasif (Dondurulan) Sporcu
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {raporData.pasifOgrenci} Sporcu
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center font-bold text-slate-400">
          Raporlar ve gün sorgusu hesaplanıyor...
        </div>
      ) : (
        <div className="space-y-8">
          {/* 📅 1. YENİ MODÜL: GÜN / AY / YIL ÖZEL GÜNLÜK YOKLAMA İNCELEME */}
          <div className="bg-white p-6 rounded-3xl border-2 border-amber-400 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📅</span> Gün / Ay / Yıl Seçimli Özel Günlük Yoklama
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  İstediğiniz geçmiş veya güncel tarihi seçerek o günün yoklama
                  kaydını listeleyin.
                </p>
              </div>

              {/* GÜN / AY / YIL SEÇİCİ */}
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-300">
                {/* GÜN */}
                <select
                  value={secilenGun}
                  onChange={(e) => setSecilenGun(Number(e.target.value))}
                  className="bg-white border-2 border-amber-400 font-black text-xs p-2 rounded-xl outline-none"
                >
                  {gunler.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                {/* AY */}
                <select
                  value={secilenGunAy}
                  onChange={(e) => setSecilenGunAy(Number(e.target.value))}
                  className="bg-white border-2 border-amber-400 font-black text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>

                {/* YIL */}
                <select
                  value={secilenGunYil}
                  onChange={(e) => setSecilenGunYil(Number(e.target.value))}
                  className="bg-white border-2 border-amber-400 font-black text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={secilenGunPdfYazdir}
                  className="bg-[#0F172A] hover:bg-slate-800 text-amber-400 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md transition-all ml-1"
                >
                  <span>📄</span> PDF Çıktı
                </button>
              </div>
            </div>

            {/* SEÇİLEN GÜNÜN TABLOSU */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-black tracking-wider">
                  <tr>
                    <th className="p-3">Giriş Saati</th>
                    <th className="p-3">Sporcu Ad Soyad</th>
                    <th className="p-3">Grubu</th>
                    <th className="p-3 text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold">
                  {!raporData.gunlukYoklamaListesi ||
                  raporData.gunlukYoklamaListesi.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-6 text-center text-slate-400"
                      >
                        {secilenGun} {ayAdGetir(secilenGunAy)} {secilenGunYil}{" "}
                        tarihinde derse giriş kaydı bulunmuyor.
                      </td>
                    </tr>
                  ) : (
                    raporData.gunlukYoklamaListesi.map((y, idx) => (
                      <tr key={y._id || idx} className="hover:bg-amber-50/50">
                        <td className="p-3 font-mono font-black text-emerald-700">
                          {y.tarih
                            ? new Date(y.tarih).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--:--"}
                        </td>
                        <td className="p-3 font-black text-slate-900">
                          {y.ogrenciId?.adSoyad ||
                            y.ogrenciAdi ||
                            y.adSoyad ||
                            "Sporcu"}
                        </td>
                        <td className="p-3 text-slate-600">
                          {y.ogrenciId?.grup || y.grup || "Grup Belirtilmedi"}
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-300">
                            ✓ Katıldı
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🌟 2. BAŞLIK: YENİ KAYDOLAN ÖĞRENCİ KIYASLAMASI (Mevcut Özellik) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-emerald-800 flex items-center gap-2 border-b border-slate-200 pb-3">
              <span>✨</span> 1. Konu: Yeni Kaydolan Öğrenci Kıyaslaması
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Hedef Dönem:
                </span>
                <select
                  value={yeniHedefAy}
                  onChange={(e) => setYeniHedefAy(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={yeniHedefYil}
                  onChange={(e) => setYeniHedefYil(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Kıyaslanacak Dönem:
                </span>
                <select
                  value={yeniKiyasAy}
                  onChange={(e) => setYeniKiyasAy(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={yeniKiyasYil}
                  onChange={(e) => setYeniKiyasYil(Number(e.target.value))}
                  className="bg-white border-2 border-emerald-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-emerald-100/60 rounded-2xl border-2 border-emerald-300 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-black text-emerald-950 text-base">
                  {ayAdGetir(yeniHedefAy)} {yeniHedefYil} vs{" "}
                  {ayAdGetir(yeniKiyasAy)} {yeniKiyasYil}
                </h3>
                <p className="text-xs font-bold text-emerald-800 mt-1">
                  {ayAdGetir(yeniHedefAy)} {yeniHedefYil} döneminde{" "}
                  <strong>{raporData.yeniHedefSayi} yeni kayıt</strong> alındı.
                  ({ayAdGetir(yeniKiyasAy)} {yeniKiyasYil}:{" "}
                  {raporData.yeniKiyasSayi} kayıt)
                </p>
              </div>

              <div
                className={`px-5 py-3 rounded-2xl font-black text-sm border ${
                  raporData.yeniFark >= 0
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-rose-600 text-white border-rose-700"
                }`}
              >
                {raporData.yeniFark >= 0
                  ? `▲ +${raporData.yeniFark} Daha Fazla Kayıt`
                  : `▼ ${raporData.yeniFark} Daha Az Kayıt`}
              </div>
            </div>
          </div>

          {/* ❄️ 3. BAŞLIK: DONDURULAN / AYRILAN ÖĞRENCİ KIYASLAMASI (Mevcut Özellik) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-rose-800 flex items-center gap-2 border-b border-slate-200 pb-3">
              <span>❄️</span> 2. Konu: Kaydı Dondurulan / Ayrılan Öğrenci
              Kıyaslaması
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rose-50/50 p-4 rounded-2xl border border-rose-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Hedef Dönem:
                </span>
                <select
                  value={donHedefAy}
                  onChange={(e) => setDonHedefAy(Number(e.target.value))}
                  className="bg-white border-2 border-rose-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={donHedefYil}
                  onChange={(e) => setDonHedefYil(Number(e.target.value))}
                  className="bg-white border-2 border-rose-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">
                  Kıyaslanacak Dönem:
                </span>
                <select
                  value={donKiyasAy}
                  onChange={(e) => setDonKiyasAy(Number(e.target.value))}
                  className="bg-white border-2 border-rose-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {aylar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.ad}
                    </option>
                  ))}
                </select>
                <select
                  value={donKiyasYil}
                  onChange={(e) => setDonKiyasYil(Number(e.target.value))}
                  className="bg-white border-2 border-rose-300 font-bold text-xs p-2 rounded-xl outline-none"
                >
                  {yillar.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-rose-100/60 rounded-2xl border-2 border-rose-300 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="font-black text-rose-950 text-base">
                  {ayAdGetir(donHedefAy)} {donHedefYil} vs{" "}
                  {ayAdGetir(donKiyasAy)} {donKiyasYil}
                </h3>
                <p className="text-xs font-bold text-rose-800 mt-1">
                  {ayAdGetir(donHedefAy)} {donHedefYil} döneminde{" "}
                  <strong>
                    {raporData.donHedefSayi} öğrencinin kaydı donduruldu
                  </strong>
                  . ({ayAdGetir(donKiyasAy)} {donKiyasYil}:{" "}
                  {raporData.donKiyasSayi} dondurulan)
                </p>
              </div>

              <div
                className={`px-5 py-3 rounded-2xl font-black text-sm border ${
                  raporData.donFark <= 0
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-rose-600 text-white border-rose-700"
                }`}
              >
                {raporData.donFark <= 0
                  ? `▼ ${Math.abs(raporData.donFark)} Daha Az Ayrılan`
                  : `▲ +${raporData.donFark} Daha Fazla Ayrılan`}
              </div>
            </div>
          </div>

          {/* 🏆 GRUPLARA GÖRE SPORCU DAĞILIMI (Mevcut Özellik) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-xl space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <span>🏆</span> Aktif Sporcu Grupları Dağılımı
            </h2>

            {raporData.grupDağılimi?.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 py-4 text-center">
                Henüz tanımlı grup veya öğrenci bulunmuyor.
              </p>
            ) : (
              <div className="space-y-3">
                {raporData.grupDağılimi.map((g, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-black text-slate-900 text-sm">
                        {g.grup}
                      </p>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        Aktif Sporcu Sayısı
                      </p>
                    </div>

                    <span className="bg-amber-100 text-amber-950 border border-amber-300 font-black text-xs px-3.5 py-1.5 rounded-xl">
                      {g.sayi} Sporcu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
