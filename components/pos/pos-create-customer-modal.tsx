"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  initialPosCreateCustomerActionState,
  PosCreateCustomerActionState,
  PosCustomer,
} from "@/lib/pos/types";
import {
  touchInput,
  touchModalPrimary,
  touchModalSecondary,
} from "@/lib/ui/touch-targets";

interface PosCreateCustomerModalProps {
  initialName?: string;
  initialPhone?: string;
  onClose: () => void;
  onCreated: (customer: PosCustomer) => void;
  action: (
    previousState: PosCreateCustomerActionState,
    formData: FormData,
  ) => Promise<PosCreateCustomerActionState>;
}

export function PosCreateCustomerModal({
  initialName = "",
  initialPhone = "",
  onClose,
  onCreated,
  action,
}: PosCreateCustomerModalProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialPosCreateCustomerActionState,
  );
  const [isMounted, setIsMounted] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMounted]);

  useEffect(() => {
    if (state.status === "success" && state.customer) {
      onCreated(state.customer);
    }
  }, [onCreated, state]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, onClose]);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pos-create-customer-title"
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <section className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl md:p-6">
        <h2
          id="pos-create-customer-title"
          className="text-lg font-semibold text-slate-900 md:text-xl"
        >
          Crear cliente
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Registra al cliente y continua con la compra sin salir de caja.
        </p>

        <form action={formAction} noValidate className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="pos_create_customer_name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nombre
            </label>
            <input
              id="pos_create_customer_name"
              name="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={touchInput}
            />
            {state.fieldErrors?.name ? (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.name}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="pos_create_customer_phone"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Telefono
            </label>
            <input
              id="pos_create_customer_phone"
              name="phone"
              type="tel"
              required
              placeholder="+521234567890"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={touchInput}
            />
            {state.fieldErrors?.phone ? (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.phone}
              </p>
            ) : null}
          </div>

          {state.message && state.status === "error" ? (
            <p className="text-sm text-rose-700">{state.message}</p>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-2">
            <button
              type="submit"
              disabled={pending}
              className={touchModalPrimary}
            >
              {pending ? "Guardando..." : "Guardar y seleccionar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className={touchModalSecondary}
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
