"use client";

import { useState, useEffect, useRef } from "react";

export default function NfcYoklamaPage() {
  const [cardIdInput, setCardIdInput] = useState("");
  const [ogrenci, setOgrenci] = useState(null);
  const [mesaj, setMesaj] = useState({ tip: "", metin: "" });
  const [loading, setLoading] = useState(false);
  const [yoklamaGecmisi, setYoklamaGecmisi] = useState([]);

  // 🎯 INPUT ODAK REF'İ (OTOMATİK ODAKLANMA İÇİN)
  const inputRef = useRef(null);

  // 1. SAYFA AÇILDIĞINDA VE HER İŞLEM SONRASI OTOMATİK ODAKLANMA
  const odagiKoru = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde odaklan
    odagiKoru();

    // Kullanıcı ekranda herhangi bir boş yere tıklasa dahi odağı NFC inputuna geri getir
    const handleClickGlobal = () => {
      odagiKoru();
    };

    window.addEventListener("click", handleClickGlobal);
    return () => {
      window.removeEventListener("click", handleClickGlobal);
    };
  }, []);

  // 2. URL PARAMETRESİ İLE GELEN KART ID KONTROLÜ (iOS Kestirmeler / QR İçin)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCardId = urlParams.get("cardId");
      if (urlCardId) {
        setCardIdInput(urlCardId);
        yoklamaIsle(urlCardId);
      }
    }
  }, []);

  // 3. KART OKUNDUĞUNDA YOKLAMA İŞLEME FONKSİYONU
  const yoklamaIsle = async (okunanId) => {
    const kartId = okunanId || cardIdInput;
    if (!kartId.trim()) return;

    setLoading(true);
    setMesaj({ tip: "", metin: "" });

    try {
      const res = await fetch("/api/yoklama/nfc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: kartId.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setOgrenci(data.ogrenci);
        setMesaj({
          tip: "basari",
          metin: `✅ ${data.ogrenci.adSoyad} (${data.ogrenci.grup || "Grup Belirtilmedi"}) - Yoklama Başarıyla Alındı!`,
        });

        // Geçmişe ekle
        setYoklamaGecmisi((prev) => [
          {
            _id: Date.now(),
            adSoyad: data.ogrenci.adSoyad,
            grup: data.ogrenci.grup || "Grup Yok",
            saat: new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          },
          ...prev,
        ]);
      } else {
        setOgrenci(null);
        setMesaj({
          tip: "hata",
          metin: `❌ ${data.error || "Kart sistemde eşleşmedi veya öğrenci bulunamadı!"}`,
        });
      }
    } catch (err) {
      setMesaj({
        tip: "hata",
        metin: "✕ Sunucu bağlantı hatası oluştu!",
      });
    } finally {
      setLoading(false);
      setCardIdInput(""); // Inputu sıfırla
      setTimeout(odagiKoru, 100); // Tıklamaya gerek kalmadan odağı anında yenile
    }
  };

  // ENTER TUŞUNA BASILDIĞINDA (NFC Okuyucular otomatik Enter gönderir)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      yoklamaIsle(cardIdInput);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 pb-12 font-sans max-w-4xl mx-auto">
      {/* BAŞLIK VE CANLI DURUM PANOLARI */}
      <div className="bg-[#0F172A] text-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wide text-amber-400 flex items-center gap-3 uppercase">
            <span>🎴</span> Temassız NFC / Kartlı Yoklama
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-300 mt-1">
            Kartı cihaza veya okuyucuya yaklaştırınız. Ekrana tıklamanıza gerek
            yoktur, sistem sürekli okumaya hazırdır.
          </p>
        </div>
        <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 animate-pulse whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-950"></span>
          SİSTEM OKUMAYA HAZIR
        </div>
      </div>

      {/* ⚡ OTOMATİK ODAKLANAN HIZLI OKUMA ALANI */}
      <div className="bg-white p-8 rounded-3xl border-2 border-slate-300 shadow-xl text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-900 border-2 border-amber-400 text-3xl">
          📡
        </div>

        <div className="max-w-md mx-auto space-y-3">
          <label className="block text-xs font-black text-slate-500 uppercase">
            Sürekli Aktif NFC / Kart ID Girişi
          </label>

          <input
            ref={inputRef}
            type="text"
            value={cardIdInput}
            onChange={(e) => setCardIdInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kartı okutun..."
            autoFocus
            className="w-full text-center border-4 border-amber-400 focus:border-emerald-500 p-4 rounded-2xl text-xl font-black text-slate-900 bg-amber-50/30 focus:bg-emerald-50/30 outline-none shadow-inner transition-all"
          />

          <p className="text-[11px] font-bold text-slate-400">
            * İmleç otomatik olarak bu alandadır. Kart dokundurulduğunda işlem
            anında tamamlanır.
          </p>
        </div>

        {/* BİLDİRİM VE DURUM MESAJLARI */}
        {mesaj.metin && (
          <div
            className={`p-4 rounded-2xl font-black text-sm border-2 shadow-md transition-all ${
              mesaj.tip === "basari"
                ? "bg-emerald-100 text-emerald-950 border-emerald-400"
                : "bg-rose-100 text-rose-950 border-rose-400"
            }`}
          >
            {mesaj.metin}
          </div>
        )}
      </div>

      {/* SON OKUNAN SPORCU DETAY KARTI */}
      {ogrenci && (
        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between border-2 border-emerald-400">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-200">
              Son Derse Katılan Sporcu
            </span>
            <h2 className="text-2xl font-black">{ogrenci.adSoyad}</h2>
            <p className="text-xs font-bold text-emerald-100">
              Cimnastik Grubu:{" "}
              <strong>{ogrenci.grup || "Grup Belirtilmedi"}</strong>
            </p>
          </div>
          <span className="text-4xl bg-emerald-700 p-3 rounded-2xl border border-emerald-400">
            🤸‍♀️
          </span>
        </div>
      )}

      {/* ANLIK CANLI YOKLAMA AKIŞI / GEÇMİŞİ */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <span>📋</span> Bu Oturumda Alınan Yoklamalar (
            {yoklamaGecmisi.length})
          </h2>
          <span className="text-[10px] text-amber-400 font-bold">
            Canlı Akış
          </span>
        </div>

        <div className="divide-y-2 divide-slate-100">
          {yoklamaGecmisi.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold text-xs">
              Henüz bu oturumda kart okutulmadı.
            </div>
          ) : (
            yoklamaGecmisi.map((item) => (
              <div
                key={item._id}
                className="p-4 flex justify-between items-center hover:bg-slate-50 font-bold text-xs"
              >
                <div>
                  <span className="font-black text-slate-950 text-sm">
                    {item.adSoyad}
                  </span>
                  <span className="text-slate-500 ml-2">({item.grup})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-mono font-black">
                    {item.saat}
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-300">
                    ✓ Katıldı
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
