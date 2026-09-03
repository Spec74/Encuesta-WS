/**
 * Sube una imagen directamente desde el navegador a Cloudinary usando un
 * "unsigned upload preset". No pasa por nuestro backend ni se guarda en el
 * disco de Render (que es efímero y se borra en cada redeploy).
 *
 * Requiere dos variables de entorno públicas (ver README, sección
 * "Fotos de candidatos y logos de partido"):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 */
export async function subirImagen(archivo: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "La subida de imágenes no está configurada. Define NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (ver README)."
    );
  }

  const formData = new FormData();
  formData.append("file", archivo);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "willasayki");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}));
    throw new Error(cuerpo?.error?.message || "No se pudo subir la imagen.");
  }

  const datos = await res.json();
  return datos.secure_url as string;
}
