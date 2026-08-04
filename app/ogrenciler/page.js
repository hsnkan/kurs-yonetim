"use client";
import { useState, useEffect } from "react";

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliGrupFiltre, setSeciliGrupFiltre] = useState("TÜMÜ");
  const [durumFiltresi, setDurumFiltresi] = useState("AKTIF");

  // Modal Yönetim State'leri
  const [excelModal, setExcelModal] = useState(false);
  const [excelMetni, setExcelMetni] = useState("");
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);

  // Form State
  const [yeniOgrenci, setYeniOgrenci] = useState({
    adSoyad: "",
    veliAdSoyad: "",
    veliTelefon: "",
    babaAdSoyad: "",
    babaTelefon: "",
    grup: "",
    aylikUcret: "",
    odemeGunu: "1",
  });

  useEffect(() => {
    veriGetir();
  }, [durumFiltresi]);

  // ==========================================
  // A. ÖĞRENCİ VE GRUP VERİLERİNİ ÇEKME
  // ==========================================
  const veriGetir = async () => {
    setLoading(true);
    try {
      const [ogrenciRes, grupRes] = await Promise.all([
        fetch(`/api/ogrenciler?durum=${durumFiltresi}`, { cache: "no-store" }),
        fetch("/api/gruplar", { cache: "no-store" }),
      ]);

      const ogrenciData = await ogrenciRes.json();
      const grupData = await grupRes.json();

      if (ogrenciData.success) setOgrenciler(ogrenciData.data || []);
      if (grupData.success) {
        setGruplar(grupData.data || []);
        if (grupData.data.length > 0 && !yeniOgrenci.grup) {
          setYeniOgrenci((prev) => ({ ...prev, grup: grupData.data[0].ad }));
        }
      }
    } catch (err) {
      console.error("Veri getirme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // B. TEKLİ ÖĞRENCİ KAYDETME FONKSİYONU
  // ==========================================
  const ogrenciEkle = async (e) => {
    e.preventDefault();
    if (!yeniOgrenci.adSoyad.trim())
      return alert("Öğrenci Adı Soyadı zorunludur!");

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(yeniOgrenci),
      });

      const data = await res.json();
      if (data.success) {
        alert("Öğrenci başarıyla eklendi! 🎉");
        setYeniOgrenci({
          adSoyad: "",
          veliAdSoyad: "",
          veliTelefon: "",
          babaAdSoyad: "",
          babaTelefon: "",
          grup: gruplar[0]?.ad || "",
          aylikUcret: "",
          odemeGunu: "1",
        });
        veriGetir();
      } else {
        alert(data.error || "Eklenemedi.");
      }
    } catch (err) {
      alert("Ekleme esnasında sunucu hatası.");
    }
  };

  // ==========================================
  // C. ÖĞRENCİ KAYDINI DONDURMA / AKTİF ETME
  // ==========================================
  const ogrenciDurumDegistir = async (id, adSoyad, mevcutDurum) => {
    const yeniDurum = mevcutDurum === "DONDURULDU" ? "AKTIF" : "DONDURULDU";
    const eylemMetni =
      yeniDurum === "DONDURULDU" ? "DONDURMAK" : "TEKRAR AKTİF ETMEK";

    if (
      confirm(
        `"${adSoyad}" isimli öğrencinin kaydını ${eylemMetni} istediğinize emin misiniz?`,
      )
    ) {
      try {
        const res = await fetch("/api/ogrenciler", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, durum: yeniDurum }),
        });

        const data = await res.json();
        if (data.success) {
          alert(`Öğrenci kaydı başarıyla "${yeniDurum}" yapıldı.`);
          if (seciliOgrenci?._id === id) setSeciliOgrenci(null);
          veriGetir();
        }
      } catch (err) {
        alert("Durum güncellenirken hata oluştu.");
      }
    }
  };

  // ==========================================
  // D. ÖĞRENCİ KARTINI TAMAMEN SİLME FONKSİYONU
  // ==========================================
  const ogrenciSil = async (id, adSoyad) => {
    if (
      confirm(
        `"${adSoyad}" isimli öğrenciyi sistemden TAMAMEN SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      )
    ) {
      try {
        const res = await fetch(`/api/ogrenciler?id=${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          alert("Öğrenci tamamen silindi.");
          if (seciliOgrenci?._id === id) setSeciliOgrenci(null);
          veriGetir();
        }
      } catch (err) {
        alert("Silme esnasında hata oluştu.");
      }
    }
  };

  // ==========================================
  // E. EXCEL'DEN TOPLU ÖĞRENCİ YÜKLEME FONKSİYONU
  // ==========================================
  const excelYukle = async () => {
    if (!excelMetni.trim()) return alert("Lütfen Excel verilerini yapıştırın!");

    try {
      const satirDizisi = excelMetni.trim().split("\n");
      const islenmisVeriler = [];

      satirDizisi.forEach((satir) => {
        const sutunlar = satir.split(/[\t;,]+/); // Tab veya noktalı virgülle ayırma
        if (sutunlar[0]?.trim()) {
          islenmisVeriler.push({
            adSoyad: sutunlar[0]?.trim(),
            veliAdSoyad: sutunlar[1]?.trim() || "",
            veliTelefon: sutunlar[2]?.trim() || "",
            grup: sutunlar[3]?.trim() || gruplar[0]?.ad || "Genel Kadro",
            aylikUcret: parseFloat(sutunlar[4]?.trim() || 0),
            odemeGunu: parseInt(sutunlar[5]?.trim() || 1),
          });
        }
      });

      if (islenmisVeriler.length === 0) return alert("Format okunamadı.");

      const res = await fetch("/api/ogrenciler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liste: islenmisVeriler }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`${islenmisVeriler.length} adet öğrenci aktarıldı! 🎉`);
        setExcelModal(false);
        setExcelMetni("");
        veriGetir();
      }
    } catch (err) {
      alert("Excel aktarımı başarısız.");
    }
  };

  // Filtreleme
  const guvenliListe = Array.isArray(ogrenciler) ? ogrenciler : [];
  const filtreliOgrenciler = guvenliListe.filter((o) => {
    const adEslesiyor =
      o.adSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliAdSoyad?.toLowerCase().includes(aramaMetni.toLowerCase());
    const grupEslesiyor =
      seciliGrupFiltre === "TÜMÜ" || o.grup === seciliGrupFiltre;
    return adEslesiyor && grupEslesiyor;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      {/* ÜST BAŞLIK VE BUTONLAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            👥 Öğrenci Yönetim & Kayıt Paneli
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Öğrencilerinizi kaydedin, durumlarını dondurun veya Excel ile toplu
            içe aktarın.
          </p>
        </div>

        <button
          onClick={() => setExcelModal(true)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-4 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-1.5"
        >
          <span>📊</span> Excel'den Toplu Öğrenci Yükle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL PANEL: TEKLİ KAYIT FORMU */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300 space-y-4 h-fit">
          <h2 className="text-lg font-black text-slate-950 border-b-2 border-slate-200 pb-3">
            ➕ Yeni Öğrenci Ekle
          </h2>

          <form onSubmit={ogrenciEkle} className="space-y-3">
            <div>
              <label className="block text-[11px] font-black text-slate-900 uppercase mb-1">
                Öğrenci Adı Soyadı *
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Zeynep Kaya"
                value={yeniOgrenci.adSoyad}
                onChange={(e) =>
                  setYeniOgrenci({ ...yeniOgrenci, adSoyad: e.target.value })
                }
                className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-xs font-bold text-slate-950 outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  👩 Anne Adı
                </label>
                <input
                  type="text"
                  placeholder="Anne Adı"
                  value={yeniOgrenci.veliAdSoyad}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      veliAdSoyad: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  📞 Anne Tel
                </label>
                <input
                  type="text"
                  placeholder="5xx..."
                  value={yeniOgrenci.veliTelefon}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      veliTelefon: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  👨 Baba Adı
                </label>
                <input
                  type="text"
                  placeholder="Baba Adı"
                  value={yeniOgrenci.babaAdSoyad}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      babaAdSoyad: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  📞 Baba Tel
                </label>
                <input
                  type="text"
                  placeholder="5xx..."
                  value={yeniOgrenci.babaTelefon}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      babaTelefon: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-900 uppercase mb-1">
                🏆 Eğitim Grubu
              </label>
              <select
                value={yeniOgrenci.grup}
                onChange={(e) =>
                  setYeniOgrenci({ ...yeniOgrenci, grup: e.target.value })
                }
                className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-xs font-black text-indigo-950 bg-indigo-50 outline-none"
              >
                {gruplar.map((g) => (
                  <option key={g._id} value={g.ad}>
                    {g.ad}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  💰 Aylık Ücret (₺)
                </label>
                <input
                  type="number"
                  placeholder="2000"
                  value={yeniOgrenci.aylikUcret}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      aylikUcret: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-bold text-emerald-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-900 uppercase mb-1">
                  📅 Ödeme Günü
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1 - 31"
                  value={yeniOgrenci.odemeGunu}
                  onChange={(e) =>
                    setYeniOgrenci({
                      ...yeniOgrenci,
                      odemeGunu: e.target.value,
                    })
                  }
                  className="w-full border-2 border-slate-300 p-2 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl text-xs transition shadow-md mt-2"
            >
              🚀 Öğrenciyi Kaydet
            </button>
          </form>
        </div>

        {/* SAĞ PANEL: ÖĞRENCİ LİSTESİ VE AKSİYONLAR */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300 space-y-4">
          {/* TAB SEÇİMİ */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-b-2 border-slate-200 pb-3">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-300">
              <button
                onClick={() => setDurumFiltresi("AKTIF")}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                  durumFiltresi === "AKTIF"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-700"
                }`}
              >
                ✅ Aktif Öğrenciler
              </button>
              <button
                onClick={() => setDurumFiltresi("DONDURULDU")}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition ${
                  durumFiltresi === "DONDURULDU"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-700"
                }`}
              >
                ⏸️ Kaydı Dondurulanlar
              </button>
            </div>

            <span className="text-xs font-black text-slate-600">
              Kayıt Sayısı:{" "}
              <strong className="text-blue-900">
                {filtreliOgrenciler.length}
              </strong>
            </span>
          </div>

          {/* ARAMA VE GRUP FİLTRESİ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="İsim veya Veli adı ile ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="border-2 border-slate-300 p-2.5 rounded-xl text-xs font-bold text-slate-950 outline-none focus:border-blue-600"
            />
            <select
              value={seciliGrupFiltre}
              onChange={(e) => setSeciliGrupFiltre(e.target.value)}
              className="border-2 border-slate-300 p-2.5 rounded-xl text-xs font-black text-slate-900 outline-none"
            >
              <option value="TÜMÜ">🏆 Tüm Gruplar</option>
              {gruplar.map((g) => (
                <option key={g._id} value={g.ad}>
                  {g.ad}
                </option>
              ))}
            </select>
          </div>

          {/* TABLO */}
          {loading ? (
            <p className="text-xs font-bold text-slate-500 py-6">
              Yükleniyor...
            </p>
          ) : filtreliOgrenciler.length === 0 ? (
            <p className="text-xs font-bold text-slate-500 py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              Kayıt bulunamadı.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-[11px] font-black text-slate-700 uppercase bg-slate-50">
                    <th className="p-3">Öğrenci Adı</th>
                    <th className="p-3">Grup</th>
                    <th className="p-3">Veli / İletişim</th>
                    <th className="p-3">Ücret</th>
                    <th className="p-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filtreliOgrenciler.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-black text-slate-950">
                        <button
                          onClick={() => setSeciliOgrenci(o)}
                          className="hover:underline text-left text-blue-900"
                        >
                          {o.adSoyad}
                        </button>
                      </td>
                      <td className="p-3 font-bold text-indigo-900">
                        🏆 {o.grup}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">
                        👩 {o.veliAdSoyad || "-"} ({o.veliTelefon || "-"})
                      </td>
                      <td className="p-3 font-black text-emerald-700">
                        ₺ {(o.aylikUcret || 0).toLocaleString("tr-TR")}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {/* ⏸️ KAYDI DONDUR / AKTİF ET */}
                        <button
                          onClick={() =>
                            ogrenciDurumDegistir(o._id, o.adSoyad, o.durum)
                          }
                          className={`px-2.5 py-1 rounded-lg font-black text-[10px] transition ${
                            o.durum === "DONDURULDU"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          }`}
                        >
                          {o.durum === "DONDURULDU"
                            ? "▶️ Aktif Et"
                            : "⏸️ Dondur"}
                        </button>

                        {/* 🗑️ ÖĞRENCİYİ SİL */}
                        <button
                          onClick={() => ogrenciSil(o._id, o.adSoyad)}
                          className="bg-rose-100 text-rose-900 hover:bg-rose-200 px-2.5 py-1 rounded-lg font-black text-[10px] transition"
                        >
                          🗑️ Sil
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

      {/* 📊 EXCEL MODALI */}
      {excelModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300">
            <div className="bg-emerald-950 text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-emerald-700 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  Toplu Öğrenci Yükleme
                </span>
                <h2 className="text-2xl font-black mt-1 text-emerald-400">
                  Excel'den İçe Aktar
                </h2>
              </div>
              <button
                onClick={() => setExcelModal(false)}
                className="text-white font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-xs font-semibold">
                <p className="font-black">📌 Excel Sıralaması:</p>
                <div className="bg-white p-2 rounded-xl font-mono text-[11px] mt-1 border border-emerald-200">
                  Öğrenci_Adı Veli_Adı Veli_Tel Grup Ücret Ödeme_Günü
                </div>
              </div>

              <textarea
                rows="6"
                placeholder="Excel tablosundan kopyaladığınız satırları buraya yapıştırın..."
                value={excelMetni}
                onChange={(e) => setExcelMetni(e.target.value)}
                className="w-full border-2 border-slate-400 p-3 rounded-2xl text-xs font-mono outline-none focus:border-emerald-600 bg-slate-50"
              ></textarea>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setExcelModal(false)}
                  className="bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  İptal
                </button>
                <button
                  onClick={excelYukle}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2 rounded-xl text-xs"
                >
                  🚀 Aktarımı Başlat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📄 ÖĞRENCİ DETAY MODALI */}
      {seciliOgrenci && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Öğrenci Profili
                </span>
                <h2 className="text-xl font-black mt-1 text-emerald-400">
                  {seciliOgrenci.adSoyad}
                </h2>
              </div>
              <button
                onClick={() => setSeciliOgrenci(null)}
                className="text-white font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div>
                  🏆 <strong>Grup:</strong> {seciliOgrenci.grup}
                </div>
                <div>
                  💰 <strong>Aylık Ücret:</strong> ₺ {seciliOgrenci.aylikUcret}{" "}
                  (Ödeme Günü: {seciliOgrenci.odemeGunu})
                </div>
                <div>
                  👩 <strong>Anne Veli:</strong>{" "}
                  {seciliOgrenci.veliAdSoyad || "-"} (
                  {seciliOgrenci.veliTelefon || "-"})
                </div>
                <div>
                  👨 <strong>Baba Veli:</strong>{" "}
                  {seciliOgrenci.babaAdSoyad || "-"} (
                  {seciliOgrenci.babaTelefon || "-"})
                </div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button
                  onClick={() =>
                    ogrenciDurumDegistir(
                      seciliOgrenci._id,
                      seciliOgrenci.adSoyad,
                      seciliOgrenci.durum,
                    )
                  }
                  className="flex-1 bg-amber-600 text-white font-black py-2.5 rounded-xl text-xs"
                >
                  {seciliOgrenci.durum === "DONDURULDU"
                    ? "▶️ Aktif Et"
                    : "⏸️ Dondur"}
                </button>
                <button
                  onClick={() =>
                    ogrenciSil(seciliOgrenci._id, seciliOgrenci.adSoyad)
                  }
                  className="flex-1 bg-rose-600 text-white font-black py-2.5 rounded-xl text-xs"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
