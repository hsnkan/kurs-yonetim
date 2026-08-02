"use client";
import { useState, useEffect } from "react";

export default function OgrencilerPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliGrupFiltre, setSeciliGrupFiltre] = useState("TUMU");

  // Modal Durumları
  const [seciliOgrenci, setSeciliOgrenci] = useState(null);
  const [transferOgrenci, setTransferOgrenci] = useState(null);
  const [yeniHedefGrup, setYeniHedefGrup] = useState("");
  const [grupYonetimAcik, setGrupYonetimAcik] = useState(false);
  const [yeniEklenecekGrupAd, setYeniEklenecekGrupAd] = useState("");
  const [whatsappGrupLinki, setWhatsappGrupLinki] = useState("");

  // ➕ ÖĞRENCİ KAYIT FORMU STATE'İ
  const [yeniOgrenci, setYeniOgrenci] = useState({
    adSoyad: "",
    grup: "",
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
    gruplariGetir();
  }, []);

  useEffect(() => {
    ogrencileriGetir();
  }, [seciliGrupFiltre]);

  const gruplariGetir = async () => {
    try {
      const res = await fetch("/api/gruplar", { cache: "no-store" });
      const result = await res.json();
      if (result.success) {
        setGruplar(result.data || []);
        if (result.data.length > 0 && !yeniOgrenci.grup) {
          setYeniOgrenci((prev) => ({ ...prev, grup: result.data[0].ad }));
        }
      }
    } catch (err) {
      console.error("Gruplar çekilemedi:", err);
    }
  };

  const ogrencileriGetir = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ogrenciler?durum=AKTIF&grup=${seciliGrupFiltre}`,
        { cache: "no-store" },
      );
      const result = await res.json();
      if (result.success) setOgrenciler(result.data || []);
    } catch (error) {
      console.error("Öğrenciler yüklenemedi:", error);
      setOgrenciler([]);
    } finally {
      setLoading(false);
    }
  };

  // 💬 WHATSAPP GRUP DAVETİ GÖNDERME
  const whatsappGrupDavetiGonder = (telefon, veliAd, ogrenciAd, grupLink) => {
    if (!telefon) {
      alert("Veli telefon numarası bulunamadı!");
      return;
    }
    if (!grupLink) {
      alert("Lütfen önce WhatsApp Grup Katılım Linkini giriniz!");
      return;
    }

    const mesaj =
      `Sayın ${veliAd || "Velimiz"},\n\n` +
      `*Balans Cimnastik Akademi* bünyesinde eğitim alan öğrencimiz *${ogrenciAd}*'ın duyuru ve bilgilendirme grubuna katılmak için aşağıdaki linke tıklayabilirsiniz:\n\n` +
      `🔗 ${grupLink}\n\nİyi günler dileriz! 🤸‍♀️`;

    const temizTel = telefon.replace(/\D/g, "");
    const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(mesaj)}`,
      "_blank",
    );
  };

  // ➕ YENİ GRUP EKLEME
  const grupEkle = async (e) => {
    e.preventDefault();
    if (!yeniEklenecekGrupAd.trim()) return;

    try {
      const res = await fetch("/api/gruplar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ad: yeniEklenecekGrupAd }),
      });
      const result = await res.json();
      if (result.success) {
        setYeniEklenecekGrupAd("");
        gruplariGetir();
        alert("Yeni grup eklendi!");
      } else {
        alert(result.error || "Grup eklenemedi.");
      }
    } catch (err) {
      alert("Grup ekleme hatası.");
    }
  };

  // 🗑️ GRUP SİLME
  const grupSil = async (id, ad) => {
    if (!confirm(`"${ad}" grubunu silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch("/api/gruplar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.success) gruplariGetir();
    } catch (err) {
      alert("Grup silme hatası.");
    }
  };

  // 🔄 TRANSFER İŞLEMİ
  const transferiOnayla = async () => {
    if (!transferOgrenci || !yeniHedefGrup) return;

    try {
      const res = await fetch("/api/ogrenciler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: transferOgrenci._id, grup: yeniHedefGrup }),
      });

      const result = await res.json();
      if (result.success) {
        alert(
          `${transferOgrenci.adSoyad} başarıyla "${yeniHedefGrup}" grubuna transfer edildi! 🎉`,
        );
        setTransferOgrenci(null);
        ogrencileriGetir();
      }
    } catch (err) {
      alert("Transfer işleminde hata oluştu.");
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
        if (seciliOgrenci?._id === id) setSeciliOgrenci(null);
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
        alert(`${yeniOgrenci.adSoyad} başarıyla kaydedildi! 🎉`);
        setYeniOgrenci({
          adSoyad: "",
          grup: gruplar.length > 0 ? gruplar[0].ad : "",
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

  const liste = ogrenciler || [];
  const filtrelenmisOgrenciler = liste.filter(
    (o) =>
      o.adSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliAdSoyad?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliTelefon?.includes(aramaMetni),
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans">
      {/* ÜST SAYFA BAŞLIĞI VE GRUP YÖNETİMİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            📝 Öğrenci Kaydetme
          </h1>
          <p className="text-slate-600 text-sm font-semibold mt-1">
            Yeni öğrenci kaydedebilir, öğrenci detaylarını inceleyebilir ve
            gruplar arası transfer yapabilirsiniz.
          </p>
        </div>

        <button
          onClick={() => setGrupYonetimAcik(true)}
          className="bg-indigo-900 hover:bg-indigo-950 text-white font-black px-5 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2 self-start md:self-auto"
        >
          <span>⚙️</span> Grup İsimlerini Yönet ({gruplar.length})
        </button>
      </div>

      {/* 🔍 ARAMA VE GRUP FİLTRELEME PANENİ */}
      <div className="bg-white p-5 rounded-3xl shadow-md border-2 border-slate-300 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-black text-slate-900 uppercase mb-1">
            🔍 Öğrenci / Veli Ara
          </label>
          <input
            type="text"
            placeholder="Öğrenci adı, veli adı veya telefon numarası yazınız..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-600 bg-slate-50 text-slate-950 placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-900 uppercase mb-1">
            🏷️ Gruba Göre Filtrele
          </label>
          <select
            value={seciliGrupFiltre}
            onChange={(e) => setSeciliGrupFiltre(e.target.value)}
            className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-black outline-none focus:border-blue-600 bg-white text-slate-950"
          >
            <option value="TUMU">Tüm Gruplar ({liste.length})</option>
            {gruplar.map((g) => (
              <option key={g._id} value={g.ad}>
                {g.ad}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ➕ ÖĞRENCİ KAYDETME FORMU */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-2 border-slate-300 mb-8">
        <h2 className="text-xl font-black mb-6 text-slate-950 border-b-2 border-slate-200 pb-3 flex items-center gap-2">
          <span>✍️</span> Öğrenci Kaydetme Formu
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* ÖĞRENCİ BİLGİLERİ */}
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              Öğrenci Adı Soyadı *
            </label>
            <input
              type="text"
              required
              placeholder="Öğrencinin adını ve soyadını giriniz..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none focus:border-blue-600 placeholder:text-slate-400"
              value={yeniOgrenci.adSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, adSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              Katılacağı Grup *
            </label>
            <select
              className="w-full border-2 border-blue-600 p-3 rounded-xl text-sm font-black text-blue-950 bg-blue-50 outline-none focus:border-blue-800"
              value={yeniOgrenci.grup}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, grup: e.target.value })
              }
            >
              {gruplar.map((g) => (
                <option key={g._id} value={g.ad}>
                  {g.ad}
                </option>
              ))}
            </select>
          </div>

          {/* ANNE BİLGİLERİ (1. VELİ) */}
          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              👩 Anne / 1. Veli Ad Soyad *
            </label>
            <input
              type="text"
              required
              placeholder="Anne adını ve soyadını giriniz..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none focus:border-blue-600 placeholder:text-slate-400"
              value={yeniOgrenci.veliAdSoyad}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliAdSoyad: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              📞 Anne / 1. Veli Telefon *
            </label>
            <input
              type="text"
              required
              placeholder="05XXXXXXXXX formatında giriniz..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none focus:border-blue-600 placeholder:text-slate-400 font-mono"
              value={yeniOgrenci.veliTelefon}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliTelefon: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              Yakınlık Derecesi
            </label>
            <select
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none"
              value={yeniOgrenci.veliYakinlik}
              onChange={(e) =>
                setYeniOgrenci({ ...yeniOgrenci, veliYakinlik: e.target.value })
              }
            >
              <option value="Anne">Anne</option>
              <option value="Baba">Baba</option>
              <option value="Vasi">Vasi / Diğer</option>
            </select>
          </div>

          {/* BABA BİLGİLERİ (2. VELİ) */}
          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              👨 Baba / 2. Veli Ad Soyad
            </label>
            <input
              type="text"
              placeholder="Baba adını ve soyadını giriniz (İsteğe bağlı)..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none focus:border-blue-600 placeholder:text-slate-400"
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
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              📞 Baba / 2. Veli Telefon
            </label>
            <input
              type="text"
              placeholder="05XXXXXXXXX formatında giriniz..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 bg-slate-50 outline-none focus:border-blue-600 placeholder:text-slate-400 font-mono"
              value={yeniOgrenci.ikinciVeliTelefon}
              onChange={(e) =>
                setYeniOgrenci({
                  ...yeniOgrenci,
                  ikinciVeliTelefon: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-950 uppercase mb-1.5">
              Aylık Ücret (₺)
            </label>
            <input
              type="number"
              placeholder="Aylık kurs ücretini giriniz (Örn: 5000)..."
              className="w-full border-2 border-slate-500 p-3 rounded-xl text-sm font-black text-emerald-900 bg-emerald-50 outline-none focus:border-emerald-600"
              value={yeniOgrenci.aylikUcret}
              onChange={(e) =>
                setYeniOgrenci({
                  ...yeniOgrenci,
                  aylikUcret: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded-2xl text-sm transition shadow-lg w-full md:w-auto flex items-center justify-center gap-2"
            >
              <span>💾</span> Öğrenciyi Sisteme Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* 📋 ÖĞRENCİ LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border-2 border-slate-300">
        <h2 className="text-xl font-black mb-5 text-slate-950 border-b-2 border-slate-200 pb-3 flex justify-between items-center">
          <span>📋 Kayıtlı Öğrenci Listesi</span>
          <span className="text-xs bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-slate-700 font-black">
            Gösterilen: {filtrelenmisOgrenciler.length} / {liste.length}
          </span>
        </h2>

        {loading ? (
          <p className="text-slate-700 font-bold py-4">
            Öğrenciler yükleniyor...
          </p>
        ) : filtrelenmisOgrenciler.length === 0 ? (
          <p className="text-slate-700 font-bold py-4">
            Arama kriterinize uygun öğrenci bulunamadı.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-400 bg-slate-100 text-slate-950 text-xs font-black uppercase tracking-wider">
                  <th className="p-4">Öğrenci Adı (Detay İçin Tıklayın)</th>
                  <th className="p-4">Mevcut Grubu</th>
                  <th className="p-4">Anne / Baba İletişim</th>
                  <th className="p-4">Aylık Ücret</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisOgrenciler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b border-slate-200 hover:bg-blue-50/60 text-slate-950 transition"
                  >
                    <td className="p-4">
                      {/* 👤 ÖĞRENCİ ADINA TIKLANDIĞINDA TÜM BİLGİLERİN YER ALDIĞI MODAL AÇILIR */}
                      <button
                        onClick={() => setSeciliOgrenci(o)}
                        className="font-black text-base text-blue-700 hover:text-blue-950 hover:underline text-left flex items-center gap-2"
                      >
                        <span>👤</span> {o.adSoyad}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-100 text-indigo-950 font-black text-xs px-3 py-1.5 rounded-xl border border-indigo-300">
                        🏆 {o.grup || "Belirtilmedi"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-slate-950">
                        👩 {o.veliAdSoyad} ({o.veliTelefon})
                      </div>
                      {o.ikinciVeliAdSoyad && (
                        <div className="text-xs font-bold text-slate-700">
                          👨 {o.ikinciVeliAdSoyad} ({o.ikinciVeliTelefon})
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-base">
                      ₺ {o.aylikUcret}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setTransferOgrenci(o);
                            setYeniHedefGrup(o.grup || gruplar[0]?.ad || "");
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400 font-bold py-1.5 px-3 rounded-xl text-xs transition"
                        >
                          🔄 Transfer Et
                        </button>
                        <button
                          onClick={() => kaliciSil(o._id, o.adSoyad)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition"
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

      {/* 📄 ÖĞRENCİ DETAY VE WHATSAPP GRUP DAVETİ MODALI */}
      {seciliOgrenci && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                  Öğrenci Profil Kartı
                </span>
                <h2 className="text-2xl font-black text-emerald-400 mt-1">
                  {seciliOgrenci.adSoyad}
                </h2>
              </div>
              <button
                onClick={() => setSeciliOgrenci(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white w-9 h-9 rounded-full font-black text-base"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* GENEL BİLGİLER */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-black text-slate-500 uppercase block">
                    Mevcut Grubu
                  </span>
                  <span className="text-sm font-black text-indigo-900">
                    🏆 {seciliOgrenci.grup}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-black text-slate-500 uppercase block">
                    Aylık Kurs Ücreti
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    ₺ {seciliOgrenci.aylikUcret}
                  </span>
                </div>
              </div>

              {/* ANNE VE BABA İLETİŞİM BİLGİLERİ */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  👨‍👩‍👧 Veli İletişim Bilgileri
                </h3>

                {/* 1. VELİ (ANNE) */}
                <div className="flex justify-between items-center bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      👩 Anne / 1. Veli: {seciliOgrenci.veliAdSoyad}
                    </span>
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {seciliOgrenci.veliTelefon}
                    </span>
                  </div>
                  {seciliOgrenci.veliTelefon && (
                    <button
                      onClick={() =>
                        whatsappGrupDavetiGonder(
                          seciliOgrenci.veliTelefon,
                          seciliOgrenci.veliAdSoyad,
                          seciliOgrenci.adSoyad,
                          whatsappGrupLinki,
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                    >
                      <span>📲</span> WhatsApp Daveti Gönder
                    </button>
                  )}
                </div>

                {/* 2. VELİ (BABA) */}
                {seciliOgrenci.ikinciVeliAdSoyad ? (
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        👨 Baba / 2. Veli: {seciliOgrenci.ikinciVeliAdSoyad}
                      </span>
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {seciliOgrenci.ikinciVeliTelefon}
                      </span>
                    </div>
                    {seciliOgrenci.ikinciVeliTelefon && (
                      <button
                        onClick={() =>
                          whatsappGrupDavetiGonder(
                            seciliOgrenci.ikinciVeliTelefon,
                            seciliOgrenci.ikinciVeliAdSoyad,
                            seciliOgrenci.adSoyad,
                            whatsappGrupLinki,
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                      >
                        <span>📲</span> WhatsApp Daveti Gönder
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-bold italic">
                    2. Veli (Baba) bilgisi girilmemiş.
                  </p>
                )}
              </div>

              {/* WHATSAPP GRUP LİNKİ GİRDİSİ */}
              <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl">
                <label className="block text-xs font-black text-emerald-950 uppercase mb-1">
                  🔗 WhatsApp Grup Katılım Linkiniz
                </label>
                <input
                  type="text"
                  placeholder="https://chat.whatsapp.com/... linkini buraya yapıştırın"
                  value={whatsappGrupLinki}
                  onChange={(e) => setWhatsappGrupLinki(e.target.value)}
                  className="w-full border-2 border-emerald-400 p-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                  Yukarıdaki "WhatsApp Daveti Gönder" butonuna bastığınızda bu
                  link otomatik mesaja eklenir.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setSeciliOgrenci(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-2.5 rounded-xl text-xs"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ ÖZEL GRUP YÖNETİM MODALI */}
      {grupYonetimAcik && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300">
            <div className="bg-indigo-950 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-emerald-400">
                  ⚙️ Kurs Grup İsimleri Yönetimi
                </h2>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  İstediğiniz grup isimlerini ekleyip çıkarın.
                </p>
              </div>
              <button
                onClick={() => setGrupYonetimAcik(false)}
                className="bg-indigo-900 text-white w-9 h-9 rounded-full font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <form onSubmit={grupEkle} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Örn: Hafta Sonu 10:00 Grubu..."
                  value={yeniEklenecekGrupAd}
                  onChange={(e) => setYeniEklenecekGrupAd(e.target.value)}
                  className="flex-1 border-2 border-slate-500 p-3 rounded-xl text-sm font-bold text-slate-950 outline-none focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-xl text-xs transition"
                >
                  ➕ Ekle
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                <span className="text-xs font-black text-slate-500 uppercase block mb-1">
                  Mevcut Gruplar
                </span>
                {gruplar.map((g) => (
                  <div
                    key={g._id}
                    className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200"
                  >
                    <span className="font-bold text-slate-900 text-sm">
                      🏆 {g.ad}
                    </span>
                    <button
                      onClick={() => grupSil(g._id, g.ad)}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
              <button
                onClick={() => setGrupYonetimAcik(false)}
                className="bg-slate-900 text-white font-black px-6 py-2.5 rounded-xl text-xs"
              >
                Tamam / Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 GRUP TRANSFER MODALI */}
      {transferOgrenci && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300">
            <div className="bg-amber-500 text-slate-950 p-6">
              <span className="bg-slate-950 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                Grup Transfer İşlemi
              </span>
              <h2 className="text-xl font-black mt-2">
                {transferOgrenci.adSoyad}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">
                  Mevcut Grubu
                </span>
                <span className="text-sm font-black text-slate-900">
                  🏆 {transferOgrenci.grup || "Belirtilmedi"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 uppercase mb-2">
                  🎯 Transfer Edilecek Yeni Grup
                </label>
                <select
                  value={yeniHedefGrup}
                  onChange={(e) => setYeniHedefGrup(e.target.value)}
                  className="w-full border-2 border-amber-500 p-3 rounded-xl text-sm font-black text-slate-900 bg-amber-50 outline-none"
                >
                  {gruplar.map((g) => (
                    <option key={g._id} value={g.ad}>
                      {g.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setTransferOgrenci(null)}
                className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition"
              >
                İptal
              </button>
              <button
                onClick={transferiOnayla}
                className="bg-amber-600 hover:bg-amber-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md"
              >
                🔄 Transferi Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
