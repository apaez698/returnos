# Login Manual Validation Checklist

## Preconditions

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are configured.
- Dev server is running with `npm run dev`.

## Functional Checks

1. Open `/login` and confirm email input + submit button are visible.
2. Submit empty form and confirm error `El correo es obligatorio.` appears.
3. Submit invalid email (for example `owner-at-bakery.com`) and confirm error `Ingresa un correo valido.` appears.
4. Submit valid email and confirm button changes to `Enviando...` while request is in-flight.
5. After a successful auth response, confirm success message `Revisa tu correo para abrir el enlace de acceso.` appears.
6. Trigger an auth failure (invalid key or mocked network error) and confirm an error message is shown.
7. Verify in Supabase Auth logs that a magic link email was requested for the submitted address.

## UX Checks

1. Verify submit button is disabled while loading.
2. Verify changing the email field clears prior success/error messages.
3. Check on mobile width (375px) that form remains readable and usable without horizontal scrolling.
