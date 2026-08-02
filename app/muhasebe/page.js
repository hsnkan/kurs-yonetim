"use client";
import { useState, useEffect } from "react";

export default function MaliYonetimPage() {
  const [seciliYil, setSeciliYil] = useState(new Date().getFullYear());
  const [aylikVeriler, setAylikVeriler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seciliAy, setSeciliAy] = useState(null);

  // Form Düzenleme State'i
  const [formVerisi, setFormVerisi] = useState({
    kazanc: 0,
    katilanOgrenci: 0,
    ayrilanOgrenci: 0,
    donduranOgrenci: 0,
    notlar: "",
  });

  useEffect(() => {
    aylikVerileriGetir();
  }, [seciliYil]);

  const aylikVerileriGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/muhasebe/kayit?yil=${seciliYil}`, {
        cache: "no-store",
      });
      const result = await res.json();
      if (result && result.success && Array.isArray(result.data)) {
        setAylikVeriler(result.data);
      } else {
        setAylikVeriler([]);
      }
    } catch (err) {
      console.error("Aylık veriler çekilemedi:", err);
      setAylikVeriler([]);
    } finally {
      setLoading(false);
    }
  };

  const aySecVeDuzenle = (ay) => {
    setSeciliAy(ay);
    setFormVerisi({
      kazanc: ay.kazanc || 0,
      katilanOgrenci: ay.katilanOgrenci || 0,
      ayrilanOgrenci: ay.ayrilanOgrenci || 0,
      donduranOgrenci: ay.donduranOgrenci || 0,
      notlar: ay.notlar || "",
    });
  };

  const ayKaydet = async (e) => {
    e.preventDefault();
    if (!seciliAy) return;

    try {
      const res = await fetch("/api/muhasebe/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yil: seciliYil,
          aySira: seciliAy.aySira,
          ...formVerisi,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          `${seciliYil} ${seciliAy.ay} ayı verileri başarıyla kaydedildi! 🎉`,
        );
        setSeciliAy(null);
        aylikVerileriGetir();
      }
    } catch (err) {
      alert("Kaydetme esnasında hata oluştu.");
    }
  };

  const guvenliListe = Array.isArray(aylikVeriler) ? aylikVeriler : [];

  // Yıllık Toplam Gerçekleşen Hesaplamalar
  const toplamYillikKazanc = guvenliListe.reduce(
    (acc, item) => acc + (item?.kazanc || 0),
    0,
  );
  const toplamKatilan = guvenliListe.reduce(
    (acc, item) => acc + (item?.katilanOgrenci || 0),
    0,
  );
  const toplamAyrilan = guvenliListe.reduce(
    (acc, item) => acc + (item?.ayrilanOgrenci || 0),
    0,
  );
  const toplamDonduran = guvenliListe.reduce(
    (acc, item) => acc + (item?.donduranOgrenci || 0),
    0,
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      {/* ÜST BAŞLIK VE YIL SEÇİMİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            💰 Gerçekleşen Mali Yönetim & Aylık Kayıtlar
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Her ayın gerçekleşen kazanç, katılım, ayrılış ve dondurma verilerini
            işleyin ve inceleyin.
          </p>
        </div>

        {/* 📅 YILLAR SEÇİMİ */}
        <div className="bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex items-center gap-3">
          <span className="text-xs font-black text-slate-700">
            📅 Çalışma Yılı:
          </span>
          <select
            value={seciliYil}
            onChange={(e) => setSeciliYil(Number(e.target.value))}
            className="font-black text-sm text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl outline-none cursor-pointer"
          >
            <option value={2026}>2026 Yılı</option>
            <option value={2025}>2025 Yılı</option>
            <option value={2024}>2024 Yılı</option>
          </select>
        </div>
      </div>

      {/* YILLIK GERÇEKLEŞEN ÖZET KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 shadow-lg">
          <span className="text-[11px] font-black text-emerald-300 uppercase block mb-1">
            {seciliYil} Toplam Gerçekleşen Kazanç
          </span>
          <span className="text-2xl font-black text-emerald-400">
            ₺ {toplamYillikKazanc.toLocaleString("tr-TR")}
          </span>
        </div>

        <div className="bg-blue-950 text-white p-6 rounded-3xl border border-blue-800 shadow-lg">
          <span className="text-[11px] font-black text-blue-300 uppercase block mb-1">
            Toplam Katılan Öğrenci
          </span>
          <span className="text-2xl font-black text-blue-400">
            +{toplamKatilan} Öğrenci
          </span>
        </div>

        <div className="bg-rose-950 text-white p-6 rounded-3xl border border-rose-800 shadow-lg">
          <span className="text-[11px] font-black text-rose-300 uppercase block mb-1">
            Toplam Ayrılan Öğrenci
          </span>
          <span className="text-2xl font-black text-rose-400">
            -{toplamAyrilan} Öğrenci
          </span>
        </div>

        <div className="bg-amber-950 text-white p-6 rounded-3xl border border-amber-800 shadow-lg">
          <span className="text-[11px] font-black text-amber-300 uppercase block mb-1">
            Toplam Donduran Öğrenci
          </span>
          <span className="text-2xl font-black text-amber-400">
            ⏸️ {toplamDonduran} Öğrenci
          </span>
        </div>
      </div>

      {/* 🗓️ AYLARIN LİSTESİ VE KARTLARI */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-6 text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
          <span>📊 {seciliYil} Yılı Aylık Kayıt Tablosu</span>
          <span className="text-xs text-slate-500 font-bold">
            Veri işlemek/düzenlemek için ilgili aya tıklayın
          </span>
        </h2>

        {loading ? (
          <p className="text-slate-600 font-bold py-6">
            Yıllık veriler getiriliyor...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guvenliListe.map((item) => (
              <div
                key={item._id || item.aySira}
                onClick={() => aySecVeDuzenle(item)}
                className="bg-slate-50 hover:bg-blue-50/60 border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-5 transition cursor-pointer shadow-sm relative group"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-black text-slate-900">
                    {item.ay}
                  </span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                    ✏️ İşle / Düzenle
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-200 pt-3 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-600">Net Kazanç:</span>
                    <span className="text-emerald-700 font-black text-sm">
                      ₺ {(item.kazanc || 0).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Katılan Öğrenci:</span>
                    <span className="text-blue-700 font-bold">
                      +{item.katilanOgrenci || 0}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Ayrılan Öğrenci:</span>
                    <span className="text-rose-600 font-bold">
                      -{item.ayrilanOgrenci || 0}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Donduran Öğrenci:</span>
                    <span className="text-amber-700 font-bold">
                      ⏸️ {item.donduranOgrenci || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✏️ AYLIK VERİ İŞLEME / DÜZENLEME MODALI */}
      {seciliAy && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  {seciliYil} Veri Kaydı
                </span>
                <h2 className="text-2xl font-black mt-1 text-emerald-400">
                  {seciliAy.ay} Ayı Kaydı
                </h2>
              </div>
              <button
                onClick={() => setSeciliAy(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white w-9 h-9 rounded-full font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={ayKaydet} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-1">
                  💰 Ayın Gerçekleşen Net Kazancı (₺)
                </label>
                <input
                  type="number"
                  required
                  className="w-full border-2 border-emerald-500 p-3 rounded-xl text-base font-black text-emerald-900 bg-emerald-50 outline-none"
                  value={formVerisi.kazanc}
                  onChange={(e) =>
                    setFormVerisi({
                      ...formVerisi,
                      kazanc: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-blue-900 uppercase mb-1">
                    ➕ Katılan
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-blue-300 p-2.5 rounded-xl text-sm font-bold text-blue-900"
                    value={formVerisi.katilanOgrenci}
                    onChange={(e) =>
                      setFormVerisi({
                        ...formVerisi,
                        katilanOgrenci: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-rose-900 uppercase mb-1">
                    ➖ Ayrılan
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-rose-300 p-2.5 rounded-xl text-sm font-bold text-rose-900"
                    value={formVerisi.ayrilanOgrenci}
                    onChange={(e) =>
                      setFormVerisi({
                        ...formVerisi,
                        ayrilanOgrenci: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-amber-900 uppercase mb-1">
                    ⏸️ Donduran
                  </label>
                  <input
                    type="number"
                    className="w-full border-2 border-amber-300 p-2.5 rounded-xl text-sm font-bold text-amber-900"
                    value={formVerisi.donduranOgrenci}
                    onChange={(e) =>
                      setFormVerisi({
                        ...formVerisi,
                        donduranOgrenci: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notlar / Açıklama (İsteğe Bağlı)
                </label>
                <textarea
                  rows="2"
                  placeholder="Örn: Bu ay yarışma katılım ücretleri de dahil edildi."
                  className="w-full border-2 border-slate-300 p-2.5 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                  value={formVerisi.notlar}
                  onChange={(e) =>
                    setFormVerisi({ ...formVerisi, notlar: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSeciliAy(null)}
                  className="bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  💾 Aylık Veriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
