// Зургийн файлыг canvas-аар жижигрүүлж шахаад data URL болгоно.
// localStorage-д багтаахаар хэмжээ/чанарыг хязгаарлана.

const MAX_PX = 320; // хөрөг тул дунд талбай хангалттай
const QUALITY = 0.82;
const MAX_BYTES = 15 * 1024 * 1024; // 15MB-аас том файлыг татгалзана

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Файл уншиж чадсангүй"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Зураг ачаалж чадсангүй"));
    img.src = src;
  });
}

function fit(w: number, h: number, max: number): { w: number; h: number } {
  if (w <= max && h <= max) return { w, h };
  const scale = Math.min(max / w, max / h);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
}

/**
 * Зургийн файлыг шахсан JPEG data URL болгоно.
 * Алдаатай бол ойлгомжтой мессежтэй Error шиднэ.
 */
export async function fileToCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Зураг файл сонгоно уу (JPG, PNG, …)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Файл хэт том байна (15MB-аас бага байх ёстой)");
  }

  const original = await readAsDataUrl(file);
  const img = await loadImage(original);
  const { w, h } = fit(img.naturalWidth, img.naturalHeight, MAX_PX);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original; // canvas дэмжихгүй бол эх хувийг буцаана

  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", QUALITY);
}
