"use client";
import { useState, useEffect } from "react";

export default function DuyurularPage() {
  const [ogrenciler, setOgrenciler] = useState([]); // 🛡️ Boş dizi başlangıcı
  const [topluMesajMetni, setTopluMesajMetni] = useState("");
  const [seciliGrup, setSeciliGrup] = useState("TUMU");

  useEffect(() => {
    ogrencileriGetir();
  }, []);

  const ogrencileriGetir = async () => {
    try {
      const res = await fetch("/api/ogrenciler?durum=AKTIF", {
        cache: "no-store",
      });
      const result = await res.json();
      if (result.success) {
        setOgrenciler(result.data || []); // 🛡️ KORUMA
      }
    } catch (error) {
      console.error("Öğrenciler yüklenemedi:", error);
      setOgrenciler([]);
    }
  };

  const whatsappMesajGonder = (telefon, mesaj) => {
    if (!telefon) return;
    const temizTel = telefon.replace(/\D/g, "");
    const tel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;
    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(mesaj)}`,
      "_blank",
    );
  };

  const liste = ogrenciler || []; // 🛡️ KORUMA

  const duyuruGonder = () => {
    if (!topluMesajMetni.trim()) {
      alert("Lütfen gönderilecek duyuru metnini yazın!");
      return;
    }

    const hedefOgrenciler =
      seciliGrup === "TUMU"
        ? liste
        : liste.filter((o) => o.grup === seciliGrup);

    if (
      confirm(
        `Seçilen kriterdeki ${hedefOgrenciler.length} öğrencinin velilerine mesaj penceresi açılacaktır. Devam edilsin mi?`,
      )
    ) {
      hedefOgrenciler.forEach((o, index) => {
        setTimeout(() => {
          if (o.veliTelefon)
            whatsappMesajGonder(o.veliTelefon, topluMesajMetni);
          if (o.ikinciVeliTelefon)
            whatsappMesajGonder(o.ikinciVeliTelefon, topluMesajMetni);
        }, index * 1000);
      });
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          📢 Velilere Duyuru Gönderme Paneli
        </h1>
        <p className="text-slate-600 text-sm font-semibold mt-1">
          Tüm velilere veya sadece seçtiğiniz bir gruba toplu WhatsApp duyurusu
          yapabilirsiniz.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-300 space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-900 uppercase mb-2">
            🎯 Duyuru Yapılacak Hedef Kitle
          </label>
          <select
            value={seciliGrup}
            onChange={(e) => setSeciliGrup(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 rounded-xl text-sm font-bold bg-slate-50 text-slate-900 outline-none focus:border-blue-600"
          >
            <option value="TUMU">
              📢 Tüm Aktif Veliler (Toplam {liste.length} Öğrenci)
            </option>
            <option value="Başlangıç Grubu">Başlangıç Grubu Velileri</option>
            <option value="Orta Seviye Grubu">
              Orta Seviye Grubu Velileri
            </option>
            <option value="İleri Seviye Grubu">
              İleri Seviye Grubu Velileri
            </option>
            <option value="Yarışma / Performans Grubu">
              Yarışma / Performans Grubu Velileri
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-900 uppercase mb-2">
            ✍️ Duyuru Metni
          </label>
          <textarea
            rows="5"
            placeholder="Duyuru metninizi buraya yazın..."
            value={topluMesajMetni}
            onChange={(e) => setTopluMesajMetni(e.target.value)}
            className="w-full border-2 border-slate-300 p-4 rounded-xl text-sm font-semibold text-slate-950 outline-none focus:border-blue-600 bg-slate-50"
          ></textarea>
        </div>

        <button
          onClick={duyuruGonder}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-xl text-sm transition shadow-lg w-full flex items-center justify-center gap-2"
        >
          <span>🚀</span> WhatsApp Duyurusunu Başlat
        </button>
      </div>
    </div>
  );
}
