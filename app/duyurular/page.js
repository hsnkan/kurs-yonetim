"use client";
import { useState, useEffect } from "react";

export default function DuyurularPage() {
  const [odemesiBekleyenler, setOdemesiBekleyenler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duyuruMetni, setDuyuruMetni] = useState("");

  useEffect(() => {
    velileriGetir();
  }, []);

  const velileriGetir = async () => {
    try {
      const res = await fetch("/api/muhasebe", { cache: "no-store" });
      const result = await res.json();
      if (result.success) {
        setOdemesiBekleyenler(result.data.odemesiBekleyenler || []);
      }
    } catch (err) {
      console.error("Veli verileri alınamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const whatsappBireyselHatirlat = (veliAd, ogrenciAd, tel, tutar) => {
    if (!tel) return;
    const temizTel = tel.replace(/\D/g, "");
    const formattedTel = temizTel.startsWith("90") ? temizTel : `90${temizTel}`;

    const mesaj = `Sayın ${veliAd}, ${ogrenciAd} isimli öğrencimizin bu ayki kurs ücreti olan ₺${tutar} ödeme zamanı gelmiştir. Balans Cimnastik olarak sağlıklı günler dileriz.`;
    const url = `https://wa.me/${formattedTel}?text=${encodeURIComponent(mesaj)}`;

    window.open(url, "_blank");
  };

  const anlikGrupDuyurusuGonder = () => {
    if (!duyuruMetni.trim()) {
      alert("Lütfen gruba gönderilecek duyuru metnini yazın.");
      return;
    }
    const mesaj = `📢 *BALANS CİMNASTİK DUYURU*\n\n${duyuruMetni}\n\nİyi günler dileriz.`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mesaj)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span>📢</span> Veli İletişim & Anlık Duyuru Paneli
        </h1>
        <p className="text-slate-600 text-sm mt-1 font-medium">
          Günlük/Saatlik duyuruları gruba atın veya 1. ve 2. velilere bireysel
          hatırlatma gönderin.
        </p>
      </div>

      {/* ANLIK GRUP DUYURUSU YAZMA ALANI */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 md:p-8 rounded-3xl shadow-xl mb-10 border border-emerald-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black tracking-wide flex items-center gap-2">
            ⚡ Anlık / Saatlik WhatsApp Grubu Duyurusu Hazırla
          </h2>
          <span className="bg-emerald-800/60 text-emerald-100 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-400/30">
            Canlı Yayın
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() =>
              setDuyuruMetni(
                `⏰ SAAT DEĞİŞİKLİĞİ:\nBugünkü antrenman saatlerimiz [Saat] olarak güncellenmiştir.`,
              )
            }
            className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold py-1.5 px-3 rounded-lg border border-white/20 transition"
          >
            ⏰ Saat Değişikliği
          </button>
          <button
            onClick={() =>
              setDuyuruMetni(
                `🌧️ DERS İPTALİ / ERTELEME:\nHava koşulları sebebiyle bugünkü derslerimiz iptal edilmiştir.`,
              )
            }
            className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold py-1.5 px-3 rounded-lg border border-white/20 transition"
          >
            🌧️ Ders İptali
          </button>
        </div>

        <textarea
          rows="4"
          value={duyuruMetni}
          onChange={(e) => setDuyuruMetni(e.target.value)}
          placeholder="Bugüne veya bu saate özel duyurunuzu buraya yazın..."
          className="w-full bg-white text-slate-900 rounded-2xl p-4 text-base font-medium shadow-inner outline-none focus:ring-4 focus:ring-emerald-300 transition placeholder:text-slate-400"
        ></textarea>

        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-emerald-100 font-medium">
            💡 Hazırlanan duyuru WhatsApp grubuna gönderilmek üzere açılacaktır.
          </p>
          <button
            onClick={anlikGrupDuyurusuGonder}
            className="w-full md:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-black py-3.5 px-8 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>WhatsApp Grubuna Gönder</span>
          </button>
        </div>
      </div>

      {/* BİREYSEL ÖDEME MESAJA İHTİYACI OLAN VELİLER LİSTESİ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-extrabold mb-4 text-slate-800 flex items-center gap-2">
          <span>✉️</span> Bireysel Ödeme Hatırlatması Gönderilecek Veliler
        </h2>

        {loading ? (
          <p className="text-slate-500 py-4">Yükleniyor...</p>
        ) : odemesiBekleyenler.length === 0 ? (
          <div className="p-8 text-center text-emerald-700 font-bold bg-emerald-50 rounded-2xl border border-emerald-100">
            🎉 Ödeme hatırlatması yapılacak veli bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase font-extrabold tracking-wider">
                  <th className="p-4">Öğrenci Adı</th>
                  <th className="p-4">1. Veli İletişim</th>
                  <th className="p-4">2. Veli İletişim</th>
                  <th className="p-4">Ödeme Günü</th>
                </tr>
              </thead>
              <tbody>
                {odemesiBekleyenler.map((o) => (
                  <tr
                    key={o._id}
                    className="border-b hover:bg-slate-50/80 text-sm text-slate-800 transition"
                  >
                    <td className="p-4 font-bold text-slate-900">
                      {o.adSoyad}
                    </td>

                    {/* 1. VELİ BUTONU */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">
                        {o.veliAdSoyad} ({o.veliYakinlik || "Anne"})
                      </div>
                      <button
                        onClick={() =>
                          whatsappBireyselHatirlat(
                            o.veliAdSoyad,
                            o.adSoyad,
                            o.veliTelefon,
                            o.aylikUcret,
                          )
                        }
                        className="mt-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold py-1 px-3 rounded-lg text-xs transition inline-flex items-center gap-1"
                      >
                        📱 1. Veliye Gönder
                      </button>
                    </td>

                    {/* 2. VELİ BUTONU */}
                    <td className="p-4">
                      {o.ikinciVeliTelefon ? (
                        <>
                          <div className="font-semibold text-slate-900">
                            {o.ikinciVeliAdSoyad} (
                            {o.ikinciVeliYakinlik || "Baba"})
                          </div>
                          <button
                            onClick={() =>
                              whatsappBireyselHatirlat(
                                o.ikinciVeliAdSoyad,
                                o.adSoyad,
                                o.ikinciVeliTelefon,
                                o.aylikUcret,
                              )
                            }
                            className="mt-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold py-1 px-3 rounded-lg text-xs transition inline-flex items-center gap-1"
                          >
                            📱 2. Veliye Gönder
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">
                          2. Veli Yok
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-medium text-slate-600">
                      Her ayın {o.odemeGunu}. günü
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
