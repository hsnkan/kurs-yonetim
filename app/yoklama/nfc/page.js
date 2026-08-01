"use client";
import { useState, useRef, useEffect } from "react";

export default function NfcYoklamaPage() {
  const [nfcCode, setNfcCode] = useState("");
  const [bildirim, setBildirim] = useState(null);
  const [bugunkuGirisler, setBugunkuGirisler] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKartOkutuldu = async (e) => {
    if (e.key === "Enter" && nfcCode.trim() !== "") {
      e.preventDefault();
      const kod = nfcCode.trim();
      setNfcCode("");

      try {
        const res = await fetch("/api/yoklama/nfc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nfcUid: kod }),
        });

        const data = await res.json();

        if (data.success) {
          setBildirim({ tip: "basari", mesaj: data.message });
          setBugunkuGirisler((prev) => [
            { adSoyad: data.ogrenci.adSoyad, saat: data.ogrenci.saat },
            ...prev,
          ]);
        } else if (data.zatenGirdi) {
          setBildirim({ tip: "uyari", mesaj: data.message });
        } else {
          setBildirim({ tip: "hata", mesaj: data.error });
        }
      } catch (err) {
        setBildirim({ tip: "hata", mesaj: "Sunucuya bağlanılamadı!" });
      }

      setTimeout(() => setBildirim(null), 4000);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-start cursor-pointer font-sans"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="text-center mt-4 mb-6">
        <h1 className="text-4xl font-extrabold tracking-wide mb-2 text-blue-400">
          🎴 BALANS CİMNASTİK YOKLAMA İSTASYONU
        </h1>
        <p className="text-slate-400 text-lg">
          Kartınızı okuyucuya dokundurun veya ID yazıp Enter'a basın.
        </p>
      </div>

      <div className="mb-6 w-full max-w-md">
        <label className="block text-sm text-slate-400 mb-2 text-center">
          NFC Kart UID Giriş Alanı:
        </label>
        <input
          ref={inputRef}
          type="text"
          value={nfcCode}
          onChange={(e) => setNfcCode(e.target.value)}
          onKeyDown={handleKartOkutuldu}
          placeholder="Örn: 123456789"
          className="w-full p-4 rounded-xl bg-slate-800 border border-slate-600 text-white text-center text-xl font-mono focus:outline-none focus:border-blue-500 shadow-inner"
          autoFocus
        />
      </div>

      {bildirim && (
        <div
          className={`w-full max-w-xl p-5 rounded-2xl text-center font-bold text-2xl shadow-2xl transition-all duration-300 mb-6 ${
            bildirim.tip === "basari"
              ? "bg-emerald-600 text-white border-4 border-emerald-400"
              : bildirim.tip === "uyari"
                ? "bg-amber-500 text-slate-900 border-4 border-amber-300"
                : "bg-rose-600 text-white border-4 border-rose-400"
          }`}
        >
          {bildirim.mesaj}
        </div>
      )}

      <div className="w-full max-w-2xl bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-slate-300 flex justify-between items-center">
          <span>📋 Bugün Giriş Yapan Öğrenciler</span>
          <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
            {bugunkuGirisler.length} Öğrenci
          </span>
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {bugunkuGirisler.length === 0 ? (
            <p className="text-center text-slate-500 py-6">
              Henüz bugün kart okutan öğrenci olmadı.
            </p>
          ) : (
            bugunkuGirisler.map((g, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-slate-700/60 p-4 rounded-xl border border-slate-600/50"
              >
                <span className="font-semibold text-lg text-slate-100">
                  {g.adSoyad}
                </span>
                <span className="text-emerald-400 font-mono font-bold bg-slate-900 px-3 py-1 rounded-lg">
                  {g.saat}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
