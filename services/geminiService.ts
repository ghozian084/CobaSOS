import { GoogleGenAI, Type } from "@google/genai";
import { PosterMetadata, MetadataKey, LABELS } from "../types";

// Access environment variable using process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const extractMetadata = async (base64Image: string): Promise<PosterMetadata> => {
  const modelId = "gemini-2.5-flash"; // Using fast model for vision tasks

  const prompt = `
    Analisis gambar poster kompetisi ini secara detail. Ekstrak informasi berikut dalam format JSON.
    Jika informasi tidak tersedia secara eksplisit, gunakan "Tidak Diketahui" atau inferensi yang masuk akal dari konteks (tapi tandai jika ragu).
    
    Untuk 'registrationDeadlineIso' dan 'eventDateIso', cobalah konversi tanggal ke format YYYYMMDD (contoh: 20241231). Jika rentang tanggal, ambil tanggal mulai. Jika tidak ada tanggal, kosongkan string.
    
    Untuk 'broadcastMessage', buatlah narasi broadcast/caption yang SANGAT MENARIK, LENGKAP, dan PENUH EMOJI untuk disebar di WhatsApp/Line/Instagram.
    Struktur pesan broadcast:
    - Judul yang heboh (pakai emoji 🔥🏆)
    - Poin-poin benefit (pakai emoji ✅)
    - Tanggal penting (pakai emoji 📅)
    - Call to Action yang kuat (pakai emoji 🚀)
    Pastikan pesannya rapi dan enak dibaca.
    
    Untuk 'location', jika Status Lomba adalah 'Luring' atau 'Hybrid', sebutkan Kotanya. Jika 'Daring', tulis 'Daring'.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          competitionName: { type: Type.STRING, description: "Nama lengkap kompetisi" },
          category: { type: Type.STRING, description: "Bidang atau kategori lomba (Misal: IT, Desain, Bisnis)" },
          registrationDeadline: { type: Type.STRING, description: "Tanggal batas akhir pendaftaran (teks asli)" },
          registrationDeadlineIso: { type: Type.STRING, description: "Tanggal batas akhir format YYYYMMDD untuk kalender" },
          eventDate: { type: Type.STRING, description: "Tanggal pelaksanaan lomba (teks asli)" },
          eventDateIso: { type: Type.STRING, description: "Tanggal pelaksanaan format YYYYMMDD untuk kalender" },
          cost: { type: Type.STRING, description: "Biaya pendaftaran (GRATIS atau nominal)" },
          teamType: { type: Type.STRING, enum: ["Individu", "Kelompok", "Individu/Kelompok", "Tidak Diketahui"] },
          status: { type: Type.STRING, enum: ["Daring", "Luring", "Hybrid", "Tidak Diketahui"] },
          location: { type: Type.STRING, description: "Kota pelaksanaan atau 'Daring'" },
          broadcastMessage: { type: Type.STRING, description: "Pesan broadcast yang menarik, panjang, dan penuh emoji" },
          link: { type: Type.STRING, description: "Link pendaftaran, guidebook, atau social media" },
        },
        required: ["competitionName", "category", "status", "broadcastMessage"],
      },
    },
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("Gagal mengekstrak data dari AI.");
  }

  try {
    return JSON.parse(jsonText) as PosterMetadata;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Format respon AI tidak valid.");
  }
};

export const reanalyzeSingleField = async (base64Image: string, fieldKey: MetadataKey, currentData: PosterMetadata): Promise<string> => {
    const modelId = "gemini-2.5-flash";
    const fieldLabel = LABELS[fieldKey];
    
    const prompt = `
      Fokus HANYA pada bagian '${fieldLabel}' dari poster kompetisi ini.
      Nilai saat ini yang terdeteksi adalah: "${currentData[fieldKey]}".
      
      Tolong analisis ulang gambar dengan sangat teliti untuk menemukan '${fieldLabel}' yang benar.
      
      KHUSUS jika field ini adalah 'broadcastMessage':
      Buat pesan broadcast yang LEBIH MENARIK, LEBIH PANJANG, dan gunakan BANYAK EMOJI (🔥, 📅, 📍, 🏆, ✨, 🚀).
      Gunakan gaya bahasa copywriting yang mengajak orang untuk segera mendaftar.
      
      Kembalikan HANYA teks hasil perbaikan tanpa format JSON atau markdown tambahan.
      Jika nilai sudah benar atau tidak ditemukan info lain, kembalikan nilai yang sama.
    `;

    const response = await ai.models.generateContent({
        model: modelId,
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: prompt }
          ]
        }
    });

    return response.text?.trim() || "";
}