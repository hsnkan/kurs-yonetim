"use client";

import { useState, useEffect, useRef } from "react";

export default function NfcTerminalPage() {
  const [kartId, setKartId] = useState("");
  const [sonOkutulan, setSonOkutulan] = useState(null);
  const [hata, setHata] = useState("");
  const [bugunkuGirisler, setBugunkuGirisler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [listeModalAcik, setListeModalAcik] = useState(false);
  const inputRef = useRef(null);

  // Öğrenci adını tüm olası veri yapılarından çeken yardımcı fonksiyon
  const ogrenciAdiniGetir = (y) => {
    if (!y) return "Öğrenci";
    if (typeof y.ogrenciId === "object" && y.ogrenciId?.adSoyad) {
      return y.ogrenciId.adSoyad;
    }
    if (typeof y.ogrenci === "object" && y.ogrenci?.adSoyad) {
      return y.ogrenci.adSoyad;
    }
    if (typeof y.ogrenciId === "string" && y.ogrenciId) {
      return y.ogrenciAdi || y.adSoyad || y.ogrenciId;
    }
    return y.ogrenciAdi || y.adSoyad || y.ogrenci || "Öğrenci";
  };

  // Öğrenci grubunu tüm olası veri yapılarından çeken yardımcı fonksiyon
  const ogrenciGrubunuGetir = (y) => {
    if (!y) return "Grup Belirtilmedi";
    if (typeof y.ogrenciId === "object" && y.ogrenciId?.grup) {
      return y.ogrenciId.grup;
    }
    if (typeof y.ogrenci === "object" && y.ogrenci?.grup) {
      return y.ogrenci.grup;
    }
    return y.grup || y.grupAdi || "Grup Belirtilmedi";
  };

  const bugunGirisleriGetir = async () => {
    try {
      const bugunTarih = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/yoklama?tarih=${bugunTarih}`);
      const data = await res.json();
      if (data.success) {
        setBugunkuGirisler(data.data || []);
      }
    } catch (err) {
      console.error("Yoklama verisi çekilemedi:", err);
    }
  };

  useEffect(() => {
    bugunGirisleriGetir();
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const kartOkutIsle = async (e) => {
    e.preventDefault();
    if (!kartId.trim()) return;

    setHata("");
    setSonOkutulan(null);
    setYukleniyor(true);
    const okunanKod = kartId.trim();
    setKartId("");

    try {
      const res = await fetch("/api/yoklama/nfc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nfcKartId: okunanKod }),
      });
      const data = await res.json();

      if (data.success) {
        // Öğrenci adını API cevabından al
        const gelenAd =
          typeof data.ogrenci === "object"
            ? data.ogrenci?.adSoyad
            : data.ogrenci || data.data?.ogrenciAdi || "Öğrenci";

        setSonOkutulan(gelenAd);
        bugunGirisleriGetir();

        // ⏱️ 2 Saniye sonra başarı mesajını kaldır
        setTimeout(() => {
          setSonOkutulan(null);
        }, 2000);
      } else {
        const mesaj = data.error || "NFC Kart / Kod Sistemde Bulunamadı!";
        setHata(mesaj);

        setTimeout(() => {
          setHata("");
        }, 2000);
      }
    } catch (err) {
      setHata("Sunucu bağlantı hatası oluştu.");
      setTimeout(() => {
        setHata("");
      }, 2000);
    } finally {
      setYukleniyor(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  // 📄 DERSE GİRİŞ YAPANLAR PDF ÇIKTISI OLUŞTURUCU
  const yoklamaPdfCiktiAl = () => {
    const bugunTarihStr = new Date().toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    });

    const satirIcerikleri = bugunkuGirisler
      .map((y, index) => {
        const adSoyad = ogrenciAdiniGetir(y);
        const grup = ogrenciGrubunuGetir(y);
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
          <td style="text-align: center; color: #047857; font-weight: bold;">✓ Derse Katıldı</td>
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
        <title>Günlük Yoklama Listesi - ${bugunTarihStr}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; margin: 0; padding: 0; }
          .header { text-align: center; border-bottom: 2px solid #0F172A; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 18pt; font-weight: 800; color: #0F172A; text-transform: uppercase; }
          .sub { font-size: 11pt; font-weight: 700; color: #D97706; margin-top: 4px; }
          .info-bar { display: flex; justify-content: space-between; font-size: 9.5pt; font-weight: bold; background-color: #F1F5F9; padding: 8px 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #CBD5E1; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #CBD5E1; padding: 8px 10px; font-size: 9.5pt; }
          th { background-color: #0F172A; color: #FFF; text-transform: uppercase; font-size: 9pt; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; padding: 0 40px; font-size: 9.5pt; font-weight: bold; }
          .sig-line { margin-top: 40px; border-bottom: 1.5px solid #0F172A; width: 180px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BALANS CİMNASTİK AKADEMİSİ</div>
          <div class="sub">GÜNLÜK DERSE GİRİŞ VE YOKLAMA RAPORU</div>
        </div>

        <div class="info-bar">
          <span>Tarih: ${bugunTarihStr}</span>
          <span>Toplam Derse Katılan Sporcu: ${bugunkuGirisler.length} Kişi</span>
        </div>

        <table>
          <thead>
            <tr>
              <th width="40">#</th>
              <th width="80">Giriş Saati</th>
              <th>Sporcu Ad Soyad</th>
              <th>Cimnastik Grubu</th>
              <th width="110">Durum</th>
            </tr>
          </thead>
          <tbody>
            ${
              satirIcerikleri.length > 0
                ? satirIcerikleri
                : '<tr><td colSpan="5" style="text-align:center; padding: 20px;">Bugün derse giriş kaydı bulunmuyor.</td></tr>'
            }
          </tbody>
        </table>

        <div class="footer">
          <div>
            NFC Sistem Görevlisi
            <div class="sig-line"></div>
          </div>
          <div>
            Nöbetçi Antrenör İmza
            <div class="sig-line"></div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlIcerik);
    printWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 text-slate-900">
      {/* BAŞLIK */}
      <div className="text-center border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-white tracking-wide">
          NFC Yoklama Terminali
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          Temassız kart/bileklik okutun veya kartı arızalı öğrenciler için Kodu
          elle yazıp Enter'a basın.
        </p>
      </div>

      {/* NFC OKUYUCU KART ALANI */}
      <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-2xl text-center space-y-6 text-slate-900">
        <div className="w-20 h-20 bg-amber-100 border-2 border-amber-400 rounded-full mx-auto flex items-center justify-center text-amber-600 shadow-md relative">
          <svg
            className="w-10 h-10 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457-.337-2.838-.937-4.067"
            />
          </svg>
        </div>

        <form onSubmit={kartOkutIsle} className="max-w-md mx-auto space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            NFC Kart ID veya Manuel Kod
          </label>

          <input
            ref={inputRef}
            type="text"
            value={kartId}
            onChange={(e) => setKartId(e.target.value)}
            placeholder="Kart Okutun veya Kod Yazın..."
            disabled={yukleniyor}
            className="w-full p-4 border-4 border-slate-900 rounded-2xl text-center text-2xl font-black text-slate-900 focus:border-amber-500 outline-none transition-all shadow-inner bg-slate-50 focus:bg-white"
            autoFocus
          />

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-amber-400 font-black py-3.5 rounded-xl transition-all shadow-md text-sm uppercase tracking-wider"
          >
            {yukleniyor ? "İşleniyor..." : "Girişi Onayla (Enter)"}
          </button>
        </form>

        {/* 🔔 2 SANİYE SONRA OTOMATİK KAYBOLAN BAŞARI BİLDİRİMİ */}
        {sonOkutulan && (
          <div className="p-5 max-w-md mx-auto rounded-2xl bg-emerald-100 border-2 border-emerald-500 text-emerald-950 font-black text-xl animate-bounce shadow-md">
            ✓ {sonOkutulan} - Derse Giriş Kaydedildi!
          </div>
        )}

        {/* 🔔 2 SANİYE SONRA OTOMATİK KAYBOLAN HATA BİLDİRİMİ */}
        {hata && (
          <div className="p-5 max-w-md mx-auto rounded-2xl bg-rose-100 border-2 border-rose-500 text-rose-950 font-black text-base shadow-md">
            ✕ {hata}
          </div>
        )}
      </div>

      {/* BUGÜN GİRİŞ YAPANLAR KART KUTUSU */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden text-slate-900 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Bugün Derse Giriş Yapanlar ({bugunkuGirisler.length} Sporcu)
            </h2>
            <p className="text-xs font-bold text-slate-500">
              Yoklama verileri arka planda güvenle işlenmektedir.
            </p>
          </div>
        </div>

        {/* 📋 GİRİŞ YAPAN ÖĞRENCİ LİSTESİ VE PDF ÇIKTI BUTONU */}
        <button
          onClick={() => setListeModalAcik(true)}
          className="bg-[#0F172A] hover:bg-slate-800 text-amber-400 font-black px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all border border-slate-700 w-full sm:w-auto justify-center"
        >
          <span>📋</span>
          <span>Giriş Yapan Öğrenci Listesi & PDF Çıktı</span>
        </button>
      </div>

      {/* 📋 GİRİŞ YAPAN ÖĞRENCİLER PENCERESİ (MODAL) VE PDF İNDİRME */}
      {listeModalAcik && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-slate-900 max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-900 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setListeModalAcik(false)}
              className="absolute top-4 right-4 font-black text-xl text-slate-400 hover:text-slate-900"
            >
              ✕
            </button>

            <div className="flex justify-between items-center border-b border-slate-200 pb-3 pr-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>📋</span> Bugün Derse Giriş Yapan Sporcular
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-0.5">
                  Toplam {bugunkuGirisler.length} sporcu kart okutarak giriş
                  yaptı.
                </p>
              </div>

              <button
                onClick={yoklamaPdfCiktiAl}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
              >
                <span>📄</span>
                <span>PDF Çıktısı Al / Yazdır</span>
              </button>
            </div>

            {/* TABLO LİSTESİ */}
            <div className="overflow-y-auto flex-1 pr-1">
              {bugunkuGirisler.length === 0 ? (
                <div className="text-center text-slate-400 font-bold py-12">
                  <p className="text-3xl mb-1">🏃‍♂️</p>
                  <p>Bugün henüz hiç NFC kart giriş kaydı alınmadı.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">Saat</th>
                      <th className="p-3">Öğrenci Ad Soyad</th>
                      <th className="p-3">Grubu</th>
                      <th className="p-3 text-right">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-bold">
                    {bugunkuGirisler.map((y, idx) => (
                      <tr
                        key={y._id || idx}
                        className="hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="p-3 text-emerald-700 font-mono font-black">
                          {y.tarih
                            ? new Date(y.tarih).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--:--"}
                        </td>
                        <td className="p-3 text-slate-900 font-black">
                          {ogrenciAdiniGetir(y)}
                        </td>
                        <td className="p-3 text-slate-600">
                          {ogrenciGrubunuGetir(y)}
                        </td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-300">
                            ✓ Katıldı
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <button
                onClick={() => setListeModalAcik(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-black px-5 py-2 rounded-xl text-xs"
              >
                Pencereyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
