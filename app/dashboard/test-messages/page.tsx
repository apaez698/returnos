import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SendTestMessageForm } from "@/components/test-messages/send-test-message-form";
import { getCurrentBusinessContext } from "@/lib/auth/get-current-business-context";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Enviar Mensaje de Prueba",
};

export default async function TestMessagesPage() {
  // Verificar que el usuario tenga acceso
  const context = await getCurrentBusinessContext();

  if (!context) {
    redirect("/login");
  }

  // Solo admin u owner pueden acceder
  if (context.role !== "admin" && context.role !== "owner") {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout pageTitle="Enviar Mensaje de Prueba">
      <div className="space-y-6">
        {/* Header */}
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Prueba de Mensajes WhatsApp
          </h1>
          <p className="text-sm text-slate-600 sm:text-base">
            Envía un mensaje de prueba a través de WhatsApp para verificar que
            tu integración con Twilio está correctamente configurada.
          </p>
        </section>

        {/* Info Box */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-amber-800">
                Solo administradores
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Esta función está disponible únicamente para usuarios con rol de
                administrador u owner. Rol actual:{" "}
                <strong>{context.role}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <SendTestMessageForm />
        </section>

        {/* Instrucciones */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Cómo usar esta herramienta
          </h2>
          <ol className="space-y-3 list-decimal list-inside text-sm text-slate-700">
            <li>
              <strong>Ingresa un número de WhatsApp</strong> en formato
              internacional (ej: +593963247907)
            </li>
            <li>
              <strong>Escribe el mensaje</strong> que deseas enviar como prueba
            </li>
            <li>
              <strong>Haz clic en "Enviar Mensaje de Prueba"</strong> para
              enviarlo
            </li>
            <li>
              <strong>Verifica el resultado</strong> en la sección de arriba
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Qué números puedo usar?
              </h3>
              <p className="mt-1 text-slate-700">
                En sandbox de Twilio, solo puedes enviar a: <br />
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                  +593963247907
                </code>{" "}
                y{" "}
                <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                  +593987444724
                </code>
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Cómo envío a otros números?
              </h3>
              <p className="mt-1 text-slate-700">
                Debes solicitar acceso a producción en{" "}
                <a
                  href="https://console.twilio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  console.twilio.com
                </a>{" "}
                (toma 1-2 días)
              </p>
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                ¿Dónde veo los logs?
              </h3>
              <p className="mt-1 text-slate-700">
                En{" "}
                <a
                  href="https://console.twilio.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  console.twilio.com
                </a>{" "}
                → Logs → Message Logs
              </p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
