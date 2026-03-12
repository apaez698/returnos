import { Resend } from "resend";

interface SendInvitationEmailInput {
  toEmail: string;
  invitedByEmail: string;
  businessName: string;
  role: "admin" | "staff";
  token: string;
}

interface SendInvitationEmailResult {
  success: boolean;
  error: string | null;
}

function getBaseAppUrl(): string {
  const appUrl = process.env.APP_URL;

  if (appUrl) {
    return appUrl.replace(/\/$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;

  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  throw new Error("Missing env var: APP_URL (or VERCEL_URL)");
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("Missing env var: RESEND_API_KEY");
  }

  if (!fromEmail) {
    throw new Error("Missing env var: RESEND_FROM_EMAIL");
  }

  return { apiKey, fromEmail };
}

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<SendInvitationEmailResult> {
  try {
    const { apiKey, fromEmail } = getResendConfig();
    const appUrl = getBaseAppUrl();
    const acceptUrl = `${appUrl}/accept-invitation?token=${encodeURIComponent(input.token)}`;
    const roleLabel = input.role === "admin" ? "Admin" : "Staff";

    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [input.toEmail],
      subject: `Invitacion a ${input.businessName} en ReturnOS`,
      text: [
        `Hola,`,
        ``,
        `${input.invitedByEmail} te invito a colaborar en ${input.businessName} con rol ${roleLabel}.`,
        ``,
        `Acepta la invitacion en: ${acceptUrl}`,
        ``,
        `Si no esperabas este correo, puedes ignorarlo.`,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
          <h2 style="margin-bottom: 12px;">Te invitaron a ReturnOS</h2>
          <p style="line-height: 1.5;">
            <strong>${input.invitedByEmail}</strong> te invito a colaborar en
            <strong>${input.businessName}</strong> con rol
            <strong>${roleLabel}</strong>.
          </p>
          <p style="margin: 24px 0;">
            <a
              href="${acceptUrl}"
              style="display: inline-block; background: #059669; color: white; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;"
            >
              Aceptar invitacion
            </a>
          </p>
          <p style="font-size: 12px; color: #475569; line-height: 1.5;">
            Si el boton no funciona, copia y pega este enlace en tu navegador:<br />
            <span>${acceptUrl}</span>
          </p>
        </div>
      `,
    });

    if (error) {
      return {
        success: false,
        error: "No se pudo enviar el correo de invitacion.",
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de invitacion.",
    };
  }
}
