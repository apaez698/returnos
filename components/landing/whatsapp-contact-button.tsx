const WHATSAPP_LINK =
  "https://wa.me/<YOUR_NUMBER>?text=Hola%2C%20%C2%BFme%20explicas%20la%20demo%20de%20ReturnOS%20en%202%20minutos%3F";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 11.8C20 16.2 16.4 19.8 12 19.8C10.7 19.8 9.4 19.5 8.3 18.9L4.8 19.8L5.7 16.4C5 15.1 4.6 13.5 4.6 11.8C4.6 7.4 8.2 3.8 12.6 3.8C17 3.8 20 7.4 20 11.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 9.1C9.5 8.8 9.8 8.8 10 9C10.3 9.2 11 10 11.1 10.2C11.2 10.4 11.2 10.6 11.1 10.8C11 11 10.8 11.1 10.7 11.2C10.6 11.3 10.5 11.4 10.6 11.6C10.7 11.9 11 12.4 11.5 12.8C12 13.3 12.5 13.6 12.8 13.7C13 13.8 13.1 13.7 13.2 13.6C13.3 13.5 13.4 13.3 13.5 13.2C13.7 13 13.9 13 14.1 13.1C14.3 13.2 15.2 13.8 15.5 14C15.7 14.2 15.7 14.5 15.6 14.8C15.4 15.2 15.1 15.4 14.7 15.6C14.4 15.7 14 15.8 13.5 15.7C12.9 15.6 12.2 15.4 11.4 14.9C10.6 14.4 9.8 13.8 9.2 13C8.7 12.3 8.4 11.6 8.3 10.9C8.2 10.2 8.5 9.6 9.2 9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WhatsAppContactButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir chat de WhatsApp"
      className="fixed bottom-4 right-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#16A34A]/35 transition-all hover:-translate-y-0.5 hover:bg-[#15803D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16A34A] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-5 w-5" />
      <span>Escríbenos por WhatsApp</span>
    </a>
  );
}
