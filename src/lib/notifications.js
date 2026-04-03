// src/lib/notifications.js

export const kavaHataBildir = async (modulAdi, hataDetayi) => {
    const telegramWebhookURL = "http://localhost:5678/webhook/limparPacotes";

    const mesaj = `⚠️ Kava Hatası!
Modül: ${modulAdi}
Hata: ${hataDetayi}
Zaman: ${new Date().toLocaleString('tr-TR')}`;

    try {
        await fetch(telegramWebhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hata: mesaj })
        });
    } catch (e) {
        console.error("Telegram bildirimi gönderilemedi:", e);
    }
};