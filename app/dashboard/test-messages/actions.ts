"use server";

import { getCurrentBusinessContext } from "@/lib/auth/get-current-business-context";
import { sendTwilioWhatsAppMessage } from "@/features/whatsapp/service/send-twilio-whatsapp-message";
import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";
import { createServerAuthClient } from "@/lib/supabase/server";
import {
  sendTestMessageSchema,
  SendTestMessageState,
  initialSendTestMessageState,
} from "./schema";

const MAX_MEDIA_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function uploadMediaFile(
  file: File,
  businessId: string,
): Promise<{ ok: true; mediaUrl: string } | { ok: false; message: string }> {
  if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    return {
      ok: false,
      message: "La imagen no puede superar 5MB.",
    };
  }

  if (!ALLOWED_MEDIA_TYPES.has(file.type)) {
    return {
      ok: false,
      message: "Solo se permiten imágenes JPG, PNG, WEBP o GIF.",
    };
  }

  const bucketName =
    process.env.SUPABASE_WHATSAPP_MEDIA_BUCKET?.trim() || "whatsapp-media";
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : undefined;
  const filePath = `${businessId}/${Date.now()}-${crypto.randomUUID()}${extension ? `.${extension}` : ""}`;

  const supabase = await createServerAuthClient();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      message: `No se pudo subir la imagen: ${uploadError.message}`,
    };
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    return {
      ok: false,
      message: "No se pudo obtener la URL pública de la imagen.",
    };
  }

  return {
    ok: true,
    mediaUrl: publicUrlData.publicUrl,
  };
}

/**
 * Action para enviar un mensaje de prueba
 * Solo disponible para usuarios con rol admin u owner
 */
export async function sendTestMessageAction(
  previousState: SendTestMessageState = initialSendTestMessageState,
  formData: FormData,
): Promise<SendTestMessageState> {
  void previousState;

  // Verificar que el usuario sea admin u owner
  const context = await getCurrentBusinessContext();

  if (!context) {
    return {
      status: "error",
      message: "No tienes acceso a esta función.",
    };
  }

  if (context.role !== "admin" && context.role !== "owner") {
    return {
      status: "error",
      message: "Solo los administradores pueden enviar mensajes de prueba.",
    };
  }

  // Validar formulario
  const parsed = sendTestMessageSchema.safeParse({
    phone_number: String(formData.get("phone_number") ?? ""),
    message: String(formData.get("message") ?? ""),
    media_url: String(formData.get("media_url") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "Revisa los datos del formulario.",
      fieldErrors: {
        phone_number: fieldErrors.phone_number?.[0],
        message: fieldErrors.message?.[0],
        media: fieldErrors.media_url?.[0],
      },
    };
  }

  const { phone_number, message, media_url } = parsed.data;
  const mediaFile = formData.get("media_file");

  // Normalizar teléfono
  const normalizedPhone = normalizeWhatsAppPhone(phone_number, {
    defaultCountryCode: "1",
  });

  if (!normalizedPhone) {
    return {
      status: "error",
      message: "El formato del número de teléfono no es válido.",
      fieldErrors: {
        phone_number: "Formato de teléfono inválido",
      },
    };
  }

  let resolvedMediaUrl = media_url || undefined;

  if (!resolvedMediaUrl && mediaFile instanceof File && mediaFile.size > 0) {
    const uploadResult = await uploadMediaFile(mediaFile, context.businessId);

    if (!uploadResult.ok) {
      return {
        status: "error",
        message: "No se pudo procesar el archivo de imagen.",
        fieldErrors: {
          media: uploadResult.message,
        },
      };
    }

    resolvedMediaUrl = uploadResult.mediaUrl;
  }

  // Enviar mensaje
  try {
    const result = await sendTwilioWhatsAppMessage({
      to: normalizedPhone,
      text: message,
      ...(resolvedMediaUrl && { mediaUrl: resolvedMediaUrl }),
    });

    if (result.ok) {
      return {
        status: "success",
        message: "✅ Mensaje enviado exitosamente",
        data: {
          messageSid: result.data.sid,
          status: result.data.status,
          to: result.data.to,
          mediaUrl: resolvedMediaUrl,
        },
      };
    } else {
      return {
        status: "error",
        message: `❌ Error: ${result.error.message}`,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      status: "error",
      message: `Error al enviar el mensaje: ${errorMessage}`,
    };
  }
}
