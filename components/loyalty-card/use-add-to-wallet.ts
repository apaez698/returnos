"use client";

import { useCallback, useMemo, useState } from "react";

type WalletPlatform = "apple" | "google";

interface WalletApiError {
  error?: string;
}

interface UseAddToWalletInput {
  cardToken: string;
}

interface UseAddToWalletResult {
  loadingPlatform: WalletPlatform | null;
  error: string | null;
  addAppleWallet: () => Promise<void>;
  addGoogleWallet: () => Promise<void>;
}

const DEFAULT_ERROR_MESSAGE =
  "We could not complete this wallet action right now. Please try again.";

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as WalletApiError;
    if (payload.error && payload.error.trim().length > 0) {
      return payload.error;
    }
  } catch {
    // If JSON parsing fails we fall back to a generic error message.
  }

  return DEFAULT_ERROR_MESSAGE;
}

function createApplePassDownload(blob: Blob, cardToken: string): void {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = `${cardToken}.pkpass`;
  anchor.rel = "noopener";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(objectUrl);
}

export function redirectToUrl(url: string): void {
  window.location.assign(url);
}

export function useAddToWallet({
  cardToken,
}: UseAddToWalletInput): UseAddToWalletResult {
  const [loadingPlatform, setLoadingPlatform] = useState<WalletPlatform | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const encodedToken = useMemo(
    () => encodeURIComponent(cardToken),
    [cardToken],
  );

  const addAppleWallet = useCallback(async () => {
    if (loadingPlatform) {
      return;
    }

    setLoadingPlatform("apple");
    setError(null);

    try {
      const response = await fetch(
        `/api/wallet/apple?card_token=${encodedToken}`,
      );

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const passBlob = await response.blob();

      if (passBlob.size === 0) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }

      createApplePassDownload(passBlob, cardToken);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : DEFAULT_ERROR_MESSAGE,
      );
    } finally {
      setLoadingPlatform(null);
    }
  }, [cardToken, encodedToken, loadingPlatform]);

  const addGoogleWallet = useCallback(async () => {
    if (loadingPlatform) {
      return;
    }

    setLoadingPlatform("google");
    setError(null);

    try {
      const response = await fetch(
        `/api/wallet/google?card_token=${encodedToken}`,
      );

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const payload = (await response.json()) as {
        addToGoogleWalletUrl?: string;
      };

      if (!payload.addToGoogleWalletUrl) {
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }

      redirectToUrl(payload.addToGoogleWalletUrl);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : DEFAULT_ERROR_MESSAGE,
      );
      setLoadingPlatform(null);
    }
  }, [encodedToken, loadingPlatform]);

  return {
    loadingPlatform,
    error,
    addAppleWallet,
    addGoogleWallet,
  };
}
