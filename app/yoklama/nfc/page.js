"use client";
import { useState, useEffect, useRef } from "react";

export default function NfcYoklamaPage() {
  const [nfcUid, setNfcUid] = useState("");
  const [sonOkutulan, setSonOkutulan] = useState(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [nfcDestegi, setNfcDestegi] = useState(false);
  const [nfcTaraniyor, setNfcTaraniyor] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputOdakla();
    if (typeof window !== "undefined" && "NDEFReader" in window) {
      setNfcDestegi(true);
    }
  }, []);

  const inputOdakla = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const yoklamaAl = async (uid) => {
    if (!uid.trim()) return;
    setYukleniyor(true);
    setHata("");
    setSonOkutulan(null);

    try {
      const res = await fetch("/api/yoklama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nfcUid: uid.trim() }),
      });

      const result = await res.json();

      if (result.success) {
        setSonOkutulan(result.data);
        setNfcUid("");

        const o = result.data.ogrenci;
        if (o && o.veliTelefon) {
          const temizTel = o.veliTelefon.replace(/\D/g, "");
          const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
          const mesaj = `Sayın ${o.veliAdSoyad}, öğrencimiz ${o.adSoyad} bugün saat ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} itibarıyla Balans Cimnastik tesisine giriş yapmıştır. 🤸‍♀️`;

          window.open(
            `https://wa.me/${tel}?text=${encodeURIComponent(mesaj)}`,
            "_blank",
          );
        }
      } else {
        setHata(result.error || "Kart tanımlı değil veya bir hata oluştu.");
        setNfcUid("");
      }
    } catch (err) {
      setHata("Sunucu ile iletişim kurulamadı.");
      setNfcUid("");
    } finally {
      setYukleniyor(false);
      setTimeout(inputOdakla, 300);
    }
  };

  const telefonNfcBaslat = async () => {
    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      setNfcTaraniyor(true);
      setHata("");

      ndef.addEventListener("reading", ({ serialNumber }) => {
        if (serialNumber) {
          yoklamaAl(serialNumber);
        }
      });

      ndef.addEventListener("readingerror", () => {
        setHata("NFC Kart okunamadı, lütfen tekrar yaklaştırın.");
      });
    } catch (error) {
      setHata("Telefon NFC okuyucusu başlatılamadı veya izin verilmedi.");
      setNfcTaraniyor(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    yoklamaAl(nfcUid);
  };

  return (
    <div
      onClick={inputOdakla}
      className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans cursor-pointer select-none"
    >
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-full mb-6">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            Masaüstü USB & Mobil NFC İstasyonu
          </span>
        </div>

        <h1 className="text-4xl font-black mb-2 tracking-tight">
          🤸‍♀️ Balans Cimnastik
        </h1>
        <p className="text-slate-400 font-medium mb-8 text-sm">
          USB okuyucuya dokundurun veya telefon NFC okuyucusunu başlatın
        </p>

        {nfcDestegi && (
          <div className="mb-8">
            <button
              type="button"
              onClick={telefonNfcBaslat}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-xl transition flex items-center justify-center gap-3 border-2 ${
                nfcTaraniyor
                  ? "bg-emerald-600 border-emerald-400 text-white animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-700 border-indigo-500 text-white"
              }`}
            >
              <span>📱</span>
              <span>
                {nfcTaraniyor
                  ? "NFC Dinleniyor... Kartı Telefona Dokundurun"
                  : "Telefon NFC Okutmayı Başlat"}
              </span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <input
            ref={inputRef}
            type="text"
            value={nfcUid}
            onChange={(e) => setNfcUid(e.target.value)}
            placeholder="USB Okuyucu Bekleniyor..."
            className="w-full bg-slate-900 border-2 border-slate-700 text-center text-xl font-black font-mono py-4 px-6 rounded-2xl text-emerald-400 placeholder:text-slate-600 outline-none focus:border-emerald-500 transition shadow-2xl"
            autoFocus
          />
        </form>

        {yukleniyor && (
          <div className="bg-blue-900/40 border border-blue-700/50 text-blue-200 p-5 rounded-2xl mb-6 font-bold text-base">
            ⏳ Yoklama işleniyor...
          </div>
        )}

        {hata && (
          <div className="bg-rose-950/80 border-2 border-rose-600 text-rose-200 p-6 rounded-2xl mb-6 shadow-xl">
            <div className="font-black text-lg">{hata}</div>
          </div>
        )}

        {sonOkutulan && (
          <div className="bg-emerald-950/80 border-2 border-emerald-500 text-white p-6 rounded-3xl shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3 mb-4">
              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                Giriş Başarılı 🎉
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {new Date(sonOkutulan.tarih).toLocaleTimeString("tr-TR")}
              </span>
            </div>

            <div className="text-2xl font-black text-emerald-300 mb-1">
              {sonOkutulan.ogrenci?.adSoyad}
            </div>
            <div className="text-sm font-semibold text-slate-300">
              Veli: {sonOkutulan.ogrenci?.veliAdSoyad} (
              {sonOkutulan.ogrenci?.veliTelefon})
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
