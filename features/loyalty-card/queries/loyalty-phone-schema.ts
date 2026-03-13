import { z } from "zod";
import { normalizePhone } from "./normalize-phone";

const MIN_PHONE_DIGITS = 8;
const MAX_PHONE_DIGITS = 15;

export const loyaltyPhoneSchema = z
  .string()
  .transform((value) => normalizePhone(value))
  .refine((value) => value.length > 0, {
    message: "Ingresa tu numero de telefono para continuar.",
  })
  .refine(
    (value) => {
      const digitCount = value.replace(/\D/g, "").length;
      return digitCount >= MIN_PHONE_DIGITS && digitCount <= MAX_PHONE_DIGITS;
    },
    {
      message: "Ingresa un numero valido de 8 a 15 digitos.",
    },
  );
