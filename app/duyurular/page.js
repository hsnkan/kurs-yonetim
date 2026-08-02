"use client";
import { useState, useEffect } from "react";

export default function DuyurularPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gönderim Seçenekleri: 'TUMU', 'GRUP', 'SECILI', 'ODEME_GELEN'
  const [hedefModu, setHedefModu] = useState("TUMU");
  const [seciliGrup, setSeciliGrup] = useState("");
  const [secilenOgrenciIdleri, setSecilenOgrenciIdleri] = useState([]);
  const [duyuruMetni, setDuyuruMetni] = useState("");
  const [aramaMetni, setAramaMetni] = useState("");

  // 📜 GÖNDERİLEN MESAJLARIN TAKİP STATE'İ (Öğrenci ID -> Gönderildi mi?)
  const [gonderilenOgrenciler, setGonderilenOgrenciler] = useState({});

  useEffect(() => {
    veriGetir();
  }, []);

  useEffect(() => {
    // Ödemesi Gelenler modu seçildiğinde hazır şablonu dolduralım
    if (hedefModu === "ODEME_GELEN") {
      setDuyuruMetni(
        "Balans Cimnastik Akademi bünyesinde eğitim alan öğrencimizin aylık kurs aidat ödeme zamanı gelmiştir. Ödemenizi gerçekleştirdiyseniz bu mesajı dikkate almayınız. İyi günler dileriz.",
      );
    }
  }, [hedefModu]);

  const veriGetir = async () => {
    setLoading(true);
    try {
      const [ogrenciRes, grupRes] = await Promise.all([
        fetch("/api/ogrenciler?durum=AKTIF", { cache: "no-store" }),
        fetch("/api/gruplar", { cache: "no-store" }),
      ]);

      const ogrenciData = await ogrenciRes.json();
      const grupData = await grupRes.json();

      if (ogrenciData.success) {
        const bugün = new Date().getDate();
        const IslenmisOgrenciler = (ogrenciData.data || []).map((o) => ({
          ...o,
          odemesiGeldimi: bugün >= (o.odemeGunu || 1),
        }));
        setOgrenciler(IslenmisOgrenciler);
      }

      if (grupData.success) {
        setGruplar(grupData.data || []);
        if (grupData.data.length > 0) setSeciliGrup(grupData.data[0].ad);
      }
    } catch (err) {
      console.error("Veriler çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMesajGonder = (ogrenci, duyuru) => {
    const telefon = ogrenci.veliTelefon;
    if (!telefon) return;

    const temizTel = telefon.replace(/\D/g, "");
    const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
    const tamMesaj = `Sayın ${ogrenci.veliAdSoyad || "Velimiz"},\n\n*${ogrenci.adSoyad}* isimli öğrencimiz hakkında:\n${duyuru}\n\nBalans Cimnastik Akademi 🤸‍♀️`;

    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(tamMesaj)}`,
      "_blank",
    );

    // 🎯 MESAJ GÖNDERİLDİ DURUMUNU GÜNCELLE
    setGonderilenOgrenciler((prev) => ({
      ...prev,
      [ogrenci._id]: true,
    }));
  };

  const ogrenciSecimiDegistir = (id) => {
    if (secilenOgrenciIdleri.includes(id)) {
      setSecilenOgrenciIdleri(
        secilenOgrenciIdleri.filter((item) => item !== id),
      );
    } else {
      setSecilenOgrenciIdleri([...secilenOgrenciIdleri, id]);
    }
  };

  const tumunuSecVeyaKaldir = (liste) => {
    if (secilenOgrenciIdleri.length === liste.length) {
      setSecilenOgrenciIdleri([]);
    } else {
      setSecilenOgrenciIdleri(liste.map((o) => o._id));
    }
  };

  // Gönderilecek Velileri Belirleme
  const hedefOgrencileriHesapla = () => {
    const liste = ogrenciler || [];
    if (hedefModu === "TUMU") {
      return liste;
    } else if (hedefModu === "GRUP") {
      return liste.filter((o) => o.grup === seciliGrup);
    } else if (hedefModu === "SECILI") {
      return liste.filter((o) => secilenOgrenciIdleri.includes(o._id));
    } else if (hedefModu === "ODEME_GELEN") {
      return liste.filter((o) => o.odemesiGeldimi);
    }
    return [];
  };

  const topluDuyuruGonder = () => {
    if (!duyuruMetni.trim()) {
      alert("Lütfen gönderilecek duyuru metnini yazınız!");
      return;
    }

    const hedefler = hedefOgrencileriHesapla();

    if (hedefler.length === 0) {
      alert("Lütfen mesaj gönderilecek en az 1 öğrenci/veli seçiniz!");
      return;
    }

    if (
      confirm(
        `Seçilen ${hedefler.length} öğrencinin velilerine WhatsApp mesajı sırayla başlatılacaktır. Devam edilsin mi?`,
      )
    ) {
      hedefler.forEach((o, index) => {
        setTimeout(() => {
          whatsappMesajGonder(o, duyuruMetni);
        }, index * 1200);
      });
    }
  };

  const filtreliOgrenciListesi = (ogrenciler || []).filter(
    (o) =>
      o.adSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      o.veliAdSoyad?.toLowerCase().includes(aramaMetni.toLowerCase()),
  );

  const hedefler = hedefOgrencileriHesapla();

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          📢 WhatsApp Duyuru & Ödeme Hatırlatma Paneli
        </h1>
        <p className="text-slate-600 text-sm font-semibold mt-1">
          Velilerinize özel duyurular gönderebilir veya ödeme zamanı gelen
          velilere toplu mesaj atabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL: DUYURU METNİ VE HEDEF KİTLE SEÇİMİ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. HEDEF KİTLE MODU SEÇİMİ */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300">
            <label className="block text-xs font-black text-slate-950 uppercase mb-3">
              🎯 1. Mesaj Gönderilecek Hedef Kitle
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setHedefModu("TUMU")}
                className={`p-3.5 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "TUMU"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-blue-400"
                }`}
              >
                <span className="text-sm mb-1">📢 Tüm Veliler</span>
                <span className="opacity-80 text-[10px]">
                  {ogrenciler.length} Öğrenci
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHedefModu("ODEME_GELEN")}
                className={`p-3.5 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "ODEME_GELEN"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-emerald-400"
                }`}
              >
                <span className="text-sm mb-1">💳 Ödemesi Gelenler</span>
                <span className="opacity-80 text-[10px]">
                  {ogrenciler.filter((o) => o.odemesiGeldimi).length} Veli
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHedefModu("GRUP")}
                className={`p-3.5 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "GRUP"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-indigo-400"
                }`}
              >
                <span className="text-sm mb-1">🏆 Belirli Bir Grup</span>
                <span className="opacity-80 text-[10px]">Gruba Göre</span>
              </button>

              <button
                type="button"
                onClick={() => setHedefModu("SECILI")}
                className={`p-3.5 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "SECILI"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-amber-400"
                }`}
              >
                <span className="text-sm mb-1">🎯 Seçilenler</span>
                <span className="opacity-80 text-[10px]">
                  {secilenOgrenciIdleri.length} Seçili
                </span>
              </button>
            </div>

            {/* GRUP SEÇİMİ AÇILIR MENÜSÜ */}
            {hedefModu === "GRUP" && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-xs font-black text-slate-900 uppercase mb-1.5">
                  🏆 Grubu Seçiniz
                </label>
                <select
                  value={seciliGrup}
                  onChange={(e) => setSeciliGrup(e.target.value)}
                  className="w-full border-2 border-indigo-600 p-3 rounded-xl text-sm font-black text-indigo-950 bg-indigo-50 outline-none"
                >
                  {gruplar.map((g) => (
                    <option key={g._id} value={g.ad}>
                      {g.ad}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. DUYURU METNİ YAZMA ALANI */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300">
            <label className="block text-xs font-black text-slate-950 uppercase mb-2">
              ✍️ 2. Duyuru / Mesaj Metni
            </label>
            <textarea
              rows="6"
              placeholder="Duyuru metninizi buraya yazınız..."
              value={duyuruMetni}
              onChange={(e) => setDuyuruMetni(e.target.value)}
              className="w-full border-2 border-slate-400 p-4 rounded-2xl text-sm font-semibold text-slate-950 outline-none focus:border-blue-600 bg-slate-50 placeholder:text-slate-400"
            ></textarea>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Alıcı Sayısı:{" "}
                <strong className="text-emerald-700 text-sm font-black">
                  {hedefler.length} Veli
                </strong>
              </span>

              <button
                type="button"
                onClick={topluDuyuruGonder}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-2xl text-sm transition shadow-lg flex items-center gap-2"
              >
                <span>🚀</span> WhatsApp Mesajlarını Gönder
              </button>
            </div>
          </div>
        </div>

        {/* SAĞ: ÖĞRENCİ LİSTESİ VE GÖNDERİLDİ DURUMLARI */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300 flex flex-col h-[580px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-950 uppercase">
              👥 Veliler & Mesaj Durumu
            </h2>
            {hedefModu === "SECILI" && (
              <button
                onClick={() => tumunuSecVeyaKaldir(filtreliOgrenciListesi)}
                className="text-[11px] font-black text-blue-700 hover:underline"
              >
                {secilenOgrenciIdleri.length === filtreliOgrenciListesi.length
                  ? "Tümünü Kaldır"
                  : "Tümünü Seç"}
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="İsim ile ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-xs font-bold text-slate-950 mb-3 outline-none focus:border-blue-600"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <p className="text-xs font-bold text-slate-500 py-4">
                Öğrenciler yükleniyor...
              </p>
            ) : (
              filtreliOgrenciListesi.map((o) => {
                const seciliMi = secilenOgrenciIdleri.includes(o._id);
                const gonderildiMi = gonderilenOgrenciler[o._id];

                return (
                  <div
                    key={o._id}
                    onClick={() => {
                      if (hedefModu === "SECILI") ogrenciSecimiDegistir(o._id);
                    }}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      gonderildiMi
                        ? "bg-emerald-50 border-emerald-400"
                        : hedefModu === "SECILI" && seciliMi
                          ? "bg-amber-100 border-amber-500"
                          : "bg-slate-50 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs text-slate-950">
                        {o.adSoyad}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        👩 {o.veliAdSoyad} ({o.grup})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* ✅ MESAJ GÖNDERİLDİ İFADESİ */}
                      {gonderildiMi ? (
                        <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          ✓ Mesaj Gönderildi
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            whatsappMesajGonder(
                              o,
                              duyuruMetni || "Duyuru bilgilendirmesi",
                            );
                          }}
                          className="text-[10px] bg-slate-200 hover:bg-slate-300 font-bold px-2 py-1 rounded-lg text-slate-800"
                        >
                          Tekli At
                        </button>
                      )}

                      {hedefModu === "SECILI" && (
                        <input
                          type="checkbox"
                          checked={seciliMi}
                          onChange={() => ogrenciSecimiDegistir(o._id)}
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
