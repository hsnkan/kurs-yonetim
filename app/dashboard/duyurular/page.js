"use client";

import { useState, useEffect } from "react";

export default function DuyurularPage() {
  const [ogrenciler, setOgrenciler] = useState([]);
  const [gruplar, setGruplar] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gönderim Seçenekleri: 'TUMU', 'SECILI', 'ODEME_GELEN'
  const [hedefModu, setHedefModu] = useState("TUMU");
  const [seciliGrupFiltre, setSeciliGrupFiltre] = useState("TUMU");
  const [secilenVeliKeyleri, setSecilenVeliKeyleri] = useState([]);
  const [duyuruMetni, setDuyuruMetni] = useState("");
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliSablon, setSeciliSablon] = useState("");

  // 📜 GÖNDERİLEN MESAJLARIN TAKİP STATE'İ
  const [gonderilenVeliler, setGonderilenVeliler] = useState({});

  // HAZIR MESAJ ŞABLONLARI
  const sablonlar = {
    ODEME:
      "Balans Cimnastik Akademi bünyesinde eğitim alan öğrencimizin aylık kurs aidat ödeme zamanı gelmiştir. Ödemenizi gerçekleştirdiyseniz bu mesajı dikkate almayınız. İyi günler dileriz.",
    GENEL:
      "Balans Cimnastik Akademi ailesi olarak tüm sporcularımıza ve velilerimize sağlıklı, başarılı günler dileriz. Güncel antrenman takvimimiz ve duyurularımız hakkında bilgilendirmelerimiz devam edecektir.",
    ARA_TATIL:
      "Değerli Velilerimiz, okulların ara tatil dönemine girmesi nedeniyle antrenman saatlerimizde düzenlemeye gidilmiştir. Detaylı antrenman programı gruplarınızda paylaşılacaktır. Tüm sporcularımıza iyi tatiller dileriz.",
    RESMI_TATIL:
      "Değerli Velilerimiz, yaklaşan resmi tatil nedeniyle akademimiz belirtilen tarihlerde kapalı olacaktır. Tatil sonrası antrenmanlarımız normal seyriyle devam edecektir. Bilgilerinize sunarız.",
    KAR_TATILI:
      "Değerli Velilerimiz, bölgemizdeki olumsuz hava şartları ve kar yağışı nedeniyle sporcularımızın güvenliği açısından bugün yapılacak tüm antrenmanlarımız iptal edilmiştir. Telafi dersleri hakkında bilgilendirme yapılacaktır.",
    YARISMA:
      "Değerli Velilerimiz, önümüzdeki yarışma ve turnuva dönemi hazırlıkları kapsamında antrenman tempomuz artırılmıştır. Sporcularımızın antrenman saatlerine ve beslenme düzenlerine hassasiyet göstermenizi rica ederiz.",
  };

  useEffect(() => {
    veriGetir();
    // Varsayılan olarak Genel Duyuru Metnini Yükle
    setDuyuruMetni(sablonlar.GENEL);
  }, []);

  // 🎯 KİTLE MODU DEĞİŞTİĞİNDE OTOMATİK MESAJ DOLDURMA
  useEffect(() => {
    if (hedefModu === "ODEME_GELEN") {
      setDuyuruMetni(sablonlar.ODEME);
      setSeciliSablon("ODEME");
    } else if (hedefModu === "TUMU") {
      setDuyuruMetni(sablonlar.GENEL);
      setSeciliSablon("GENEL");
    }
  }, [hedefModu]);

  // 🗓️ HAFTA SONU & PAZARTESİ ÖDEME HESAPLAMA MANTIĞI
  const odemeGunuGeldimiHesapla = (odemeGunu) => {
    const bugun = new Date();
    const bugunGun = bugun.getDate();
    const haftaninGunu = bugun.getDay(); // 0: Pazar, 1: Pazartesi, 6: Cumartesi

    const hedefOdemeGunu = odemeGunu || 1;

    if (bugunGun >= hedefOdemeGunu) {
      return true;
    }

    if (haftaninGunu === 1) {
      const cumartesiGun = bugunGun - 2;
      const pazarGun = bugunGun - 1;

      if (hedefOdemeGunu === cumartesiGun || hedefOdemeGunu === pazarGun) {
        return true;
      }
    }

    return false;
  };

  const veriGetir = async () => {
    setLoading(true);
    try {
      const [ogrenciRes, grupRes] = await Promise.all([
        fetch("/api/ogrenciler", { cache: "no-store" }),
        fetch("/api/gruplar", { cache: "no-store" }),
      ]);

      const ogrenciData = await ogrenciRes.json();
      const grupData = await grupRes.json();

      let aktifOgrenciler = [];
      if (ogrenciData.success && Array.isArray(ogrenciData.data)) {
        aktifOgrenciler = ogrenciData.data.filter(
          (o) => !o.durum || String(o.durum).toLowerCase() === "aktif",
        );

        const islenmisOgrenciler = aktifOgrenciler.map((o) => ({
          ...o,
          odemesiGeldimi: odemeGunuGeldimiHesapla(o.odemeGunu),
        }));
        setOgrenciler(islenmisOgrenciler);
      }

      // 🏆 GRUP İSİMLERİNİ DİNAMİK LİSTELEME
      let grupIsimleri = [];
      if (grupData.success && Array.isArray(grupData.data)) {
        grupIsimleri = grupData.data
          .map((g) => (typeof g === "string" ? g : g.ad || g.grup || g.isim))
          .filter(Boolean);
      }

      const ogrenciGrupIsimleri = aktifOgrenciler
        .map((o) => o.grup)
        .filter(Boolean);

      const tumGruplar = Array.from(
        new Set([...grupIsimleri, ...ogrenciGrupIsimleri]),
      );

      setGruplar(tumGruplar);
    } catch (err) {
      console.error("Veriler çekilemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  // 👥 ANNE / BABA BİREYSEL VELİ KİŞİ LİSTESİ OLUŞTURMA
  const tumVeliKisileriniOlustur = (ogrenciListesi) => {
    const veliListesi = [];

    ogrenciListesi.forEach((o) => {
      if (
        o.veliListesi &&
        Array.isArray(o.veliListesi) &&
        o.veliListesi.length > 0
      ) {
        o.veliListesi.forEach((v, idx) => {
          if (v.telefon || v.veliTelefon) {
            veliListesi.push({
              uniqueKey: `${o._id}_v_${idx}`,
              ogrenciId: o._id,
              ogrenciAdSoyad: o.adSoyad,
              grup: o.grup || "Grup Belirtilmedi",
              veliAdSoyad: v.adSoyad || v.veliAdSoyad || "Veli",
              yakinlik: v.yakinlikDerecesi || v.yakinlik || "Veli",
              veliTelefon: v.telefon || v.veliTelefon || "",
              odemesiGeldimi: o.odemesiGeldimi,
            });
          }
        });
      } else if (o.veliTelefon || o.telefon) {
        veliListesi.push({
          uniqueKey: `${o._id}_v_0`,
          ogrenciId: o._id,
          ogrenciAdSoyad: o.adSoyad,
          grup: o.grup || "Grup Belirtilmedi",
          veliAdSoyad: o.veliAdSoyad || "Veli",
          yakinlik: "Veli",
          veliTelefon: o.veliTelefon || o.telefon || "",
          odemesiGeldimi: o.odemesiGeldimi,
        });
      }
    });

    return veliListesi;
  };

  const tumVeliler = tumVeliKisileriniOlustur(ogrenciler);

  // 🎯 LİSTE SÜZGEÇ SİSTEMİ (Arama + Grup Filtresi + Ödemesi Gelenler Filtresi)
  const filtreliVeliListesi = tumVeliler.filter((v) => {
    let grupUygunMu = true;
    if (seciliGrupFiltre === "ODEME_GELENLER") {
      grupUygunMu = v.odemesiGeldimi;
    } else if (seciliGrupFiltre !== "TUMU") {
      grupUygunMu = v.grup === seciliGrupFiltre;
    }

    const aramaUygunMu =
      v.ogrenciAdSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      v.veliAdSoyad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      v.grup.toLowerCase().includes(aramaMetni.toLowerCase());

    return grupUygunMu && aramaUygunMu;
  });

  // 🎯 HEDEF MODUNA GÖRE SEÇİLEN VELİ LİSTESİNİ HESAPLAMA
  const hedefVelileriHesapla = () => {
    if (hedefModu === "TUMU") {
      return filtreliVeliListesi;
    } else if (hedefModu === "SECILI") {
      return filtreliVeliListesi.filter((v) =>
        secilenVeliKeyleri.includes(v.uniqueKey),
      );
    } else if (hedefModu === "ODEME_GELEN") {
      return filtreliVeliListesi.filter((v) => v.odemesiGeldimi);
    }
    return [];
  };

  const hedefler = hedefVelileriHesapla();

  // 📋 ŞABLON SEÇİLDİĞİNDE TEXTAREA'YI DOLDUR
  const sablonSecildi = (key) => {
    setSeciliSablon(key);
    if (sablonlar[key]) {
      setDuyuruMetni(sablonlar[key]);
    }
  };

  const whatsappMesajGonder = (veli, duyuru) => {
    const telefon = veli.veliTelefon;
    if (!telefon) {
      alert("Bu veliye ait telefon numarası bulunamadı!");
      return;
    }

    const temizTel = telefon.replace(/\D/g, "");
    const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
    const tamMesaj = `Sayın ${veli.veliAdSoyad || "Velimiz"} (${veli.yakinlik || "Veli"}),\n\n*${veli.ogrenciAdSoyad}* isimli öğrencimiz hakkında:\n${duyuru}\n\nBalans Cimnastik Akademi 🤸‍♀️`;

    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(tamMesaj)}`,
      "_blank",
    );

    setGonderilenVeliler((prev) => ({
      ...prev,
      [veli.uniqueKey]: true,
    }));
  };

  const veliSecimiDegistir = (key) => {
    if (secilenVeliKeyleri.includes(key)) {
      setSecilenVeliKeyleri(secilenVeliKeyleri.filter((item) => item !== key));
    } else {
      setSecilenVeliKeyleri([...secilenVeliKeyleri, key]);
    }
  };

  const tumunuSecVeyaKaldir = () => {
    const suAnkiListelerinKeyleri = filtreliVeliListesi.map((v) => v.uniqueKey);
    const hepsiSeciliMi = suAnkiListelerinKeyleri.every((k) =>
      secilenVeliKeyleri.includes(k),
    );

    if (hepsiSeciliMi) {
      setSecilenVeliKeyleri(
        secilenVeliKeyleri.filter((k) => !suAnkiListelerinKeyleri.includes(k)),
      );
    } else {
      const yeniSet = new Set([
        ...secilenVeliKeyleri,
        ...suAnkiListelerinKeyleri,
      ]);
      setSecilenVeliKeyleri(Array.from(yeniSet));
    }
  };

  const topluDuyuruGonder = () => {
    if (!duyuruMetni.trim()) {
      alert("Lütfen gönderilecek duyuru metnini yazınız!");
      return;
    }

    if (hedefler.length === 0) {
      alert("Lütfen mesaj gönderilecek en az 1 veli seçiniz!");
      return;
    }

    if (
      confirm(
        `Seçilen ${hedefler.length} veli için WhatsApp sohbet pencereleri sırayla açılacaktır. Devam edilsin mi?`,
      )
    ) {
      hedefler.forEach((v, index) => {
        setTimeout(() => {
          whatsappMesajGonder(v, duyuruMetni);
        }, index * 1200);
      });
    }
  };

  const odemesiGelenVeliSayisi = tumVeliler.filter(
    (v) => v.odemesiGeldimi,
  ).length;

  return (
    <div className="space-y-8 text-slate-900 pb-12 font-sans">
      {/* 🌟 YÜKSEK KONTRASTLI ANA SAYFA BAŞLIĞI */}
      <div className="bg-[#0F172A] text-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-amber-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-wide text-amber-400 flex items-center gap-3 uppercase">
            <span>📢</span> WhatsApp Duyuru & Ödeme Paneli
          </h1>
          <p className="text-xs md:text-sm font-semibold text-slate-300 mt-1">
            Velilerinize özel duyurular gönderebilir, otomatik mesaj
            şablonlarını kullanabilir veya düzenleyebilirsiniz.
          </p>
        </div>
        <div className="bg-slate-900 border border-amber-400/50 px-4 py-2 rounded-2xl text-amber-400 text-xs font-black shadow-inner whitespace-nowrap">
          Balans Akademi Mesaj Portalı
        </div>
      </div>

      {/* PAZARTESİ VE ÖDEME HATIRLATMA UYARI ROZETİ */}
      {odemesiGelenVeliSayisi > 0 && (
        <div className="p-4 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <span>
              Sistem Tespiti: Bugün / Hafta Sonu Ödemesi Gelen{" "}
              <strong>{odemesiGelenVeliSayisi} Veli</strong> Mevcut.
            </span>
          </div>
          <button
            onClick={() => {
              setHedefModu("ODEME_GELEN");
              setSeciliGrupFiltre("ODEME_GELENLER");
            }}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-1.5 rounded-xl font-black text-[11px] shadow-sm uppercase"
          >
            Ödemesi Gelenleri Seç
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL: DUYURU METNİ VE HEDEF KİTLE SEÇİMİ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. HEDEF KİTLE MODU SEÇİMİ */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300">
            <label className="block text-xs font-black text-slate-950 uppercase mb-3">
              🎯 1. Mesaj Gönderilecek Hedef Kitle
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHedefModu("TUMU")}
                className={`p-4 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "TUMU"
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-blue-400"
                }`}
              >
                <span className="text-sm mb-1">📢 Tüm Veliler</span>
                <span className="opacity-80 text-[10px]">
                  {tumVeliler.length} Veli ({ogrenciler.length} Sporcu)
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHedefModu("ODEME_GELEN");
                  setSeciliGrupFiltre("ODEME_GELENLER");
                }}
                className={`p-4 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "ODEME_GELEN"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-emerald-400"
                }`}
              >
                <span className="text-sm mb-1">💳 Ödemesi Gelenler</span>
                <span className="opacity-80 text-[10px]">
                  {odemesiGelenVeliSayisi} Veli
                </span>
              </button>

              <button
                type="button"
                onClick={() => setHedefModu("SECILI")}
                className={`p-4 rounded-2xl text-xs font-black transition border-2 text-left flex flex-col justify-between ${
                  hedefModu === "SECILI"
                    ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md"
                    : "bg-slate-50 text-slate-900 border-slate-300 hover:border-amber-400"
                }`}
              >
                <span className="text-sm mb-1">🎯 Kutucuk İle Seçilenler</span>
                <span className="opacity-80 text-[10px]">
                  {secilenVeliKeyleri.length} Veli Seçili
                </span>
              </button>
            </div>
          </div>

          {/* 2. DUYURU METNİ VE DİNAMİK ŞABLON SEÇİCİ */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <label className="block text-xs font-black text-slate-950 uppercase">
                ✍️ 2. Duyuru / Mesaj Metni
              </label>

              {/* ⚡ HAZIR MESAJ ŞABLONLARI SEÇİM MENÜSÜ */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-slate-500 uppercase">
                  Hazır Şablon:
                </span>
                <select
                  value={seciliSablon}
                  onChange={(e) => sablonSecildi(e.target.value)}
                  className="bg-amber-100 border-2 border-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl outline-none cursor-pointer"
                >
                  <option value="GENEL">📢 Genel Bilgilendirme</option>
                  <option value="ODEME">💳 Aidat / Ödeme Hatırlatma</option>
                  <option value="ARA_TATIL">🏝️ Ara Tatil Duyurusu</option>
                  <option value="RESMI_TATIL">🇹🇷 Resmi Tatil Duyurusu</option>
                  <option value="KAR_TATILI">❄️ Kar / Hava Şartı Tatili</option>
                  <option value="YARISMA">
                    🏆 Yarışma / Turnuva Hazırlığı
                  </option>
                </select>
              </div>
            </div>

            <textarea
              rows="6"
              placeholder="Duyuru metninizi buraya yazabilir veya yukarıdan hazır bir şablon seçerek düzenleyebilirsiniz..."
              value={duyuruMetni}
              onChange={(e) => setDuyuruMetni(e.target.value)}
              className="w-full border-2 border-slate-400 p-4 rounded-2xl text-sm font-semibold text-slate-950 outline-none focus:border-blue-600 bg-slate-50 placeholder:text-slate-400"
            ></textarea>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Hedef Alıcı Sayısı:{" "}
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

        {/* SAĞ: ÖĞRENCİ & ANNE/BABA BİREYSEL VELİ LİSTESİ VE GRUP/ÖDEME FİLTRESİ */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-300 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-black text-slate-950 uppercase">
              👥 Veliler ({filtreliVeliListesi.length})
            </h2>

            <button
              onClick={tumunuSecVeyaKaldir}
              className="text-[11px] font-black text-blue-700 hover:underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
            >
              {filtreliVeliListesi.length > 0 &&
              filtreliVeliListesi.every((v) =>
                secilenVeliKeyleri.includes(v.uniqueKey),
              )
                ? "Tümünü Kaldır"
                : "Tümünü Seç"}
            </button>
          </div>

          {/* 🏆 ÖĞRENCİ FİLTRELEME SEÇİM KUTUSU (Grup + Ödemesi Gelenler) */}
          <div className="mb-2">
            <select
              value={seciliGrupFiltre}
              onChange={(e) => setSeciliGrupFiltre(e.target.value)}
              className="w-full border-2 border-indigo-600 p-2.5 rounded-xl text-xs font-black text-indigo-950 bg-indigo-50 outline-none"
            >
              <option value="TUMU">🏆 Tüm Grupları Göster</option>
              <option
                value="ODEME_GELENLER"
                className="font-bold text-emerald-800"
              >
                💳 Sadece Ödemesi Gelenleri Göster ({odemesiGelenVeliSayisi})
              </option>
              {gruplar.map((g, idx) => (
                <option key={idx} value={g}>
                  🏆 {g}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="İsim ile hızlı ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full border-2 border-slate-400 p-2.5 rounded-xl text-xs font-bold text-slate-950 mb-3 outline-none focus:border-blue-600"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <p className="text-xs font-bold text-slate-500 py-4 text-center">
                Veli kayıtları yükleniyor...
              </p>
            ) : filtreliVeliListesi.length === 0 ? (
              <p className="text-xs font-bold text-slate-400 py-8 text-center">
                Bu kriterlere uygun veli bulunamadı.
              </p>
            ) : (
              filtreliVeliListesi.map((v) => {
                const seciliMi = secilenVeliKeyleri.includes(v.uniqueKey);
                const gonderildiMi = gonderilenVeliler[v.uniqueKey];

                return (
                  <div
                    key={v.uniqueKey}
                    onClick={() => veliSecimiDegistir(v.uniqueKey)}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${
                      gonderildiMi
                        ? "bg-emerald-50 border-emerald-400"
                        : seciliMi
                          ? "bg-amber-100 border-amber-500"
                          : "bg-slate-50 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* KUTUCUK (CHECKBOX) */}
                      <input
                        type="checkbox"
                        checked={seciliMi}
                        onChange={() => veliSecimiDegistir(v.uniqueKey)}
                        className="w-4 h-4 accent-amber-600 rounded cursor-pointer shrink-0"
                      />

                      <div>
                        <div className="font-black text-xs text-slate-950 flex items-center gap-1">
                          <span>{v.ogrenciAdSoyad}</span>
                          {v.odemesiGeldimi && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-900 font-black px-1.5 py-0.5 rounded">
                              💳 Ödemesi Geldi
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-600 font-bold mt-0.5">
                          👤 {v.yakinlik}: <strong>{v.veliAdSoyad}</strong> (
                          {v.grup})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* ✅ MESAJ GÖNDERİLDİ İFADESİ */}
                      {gonderildiMi ? (
                        <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          ✓ Gönderildi
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            whatsappMesajGonder(
                              v,
                              duyuruMetni || "Duyuru bilgilendirmesi",
                            );
                          }}
                          className="text-[10px] bg-slate-200 hover:bg-slate-300 font-bold px-2 py-1 rounded-lg text-slate-800 whitespace-nowrap"
                        >
                          Tekli At
                        </button>
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
