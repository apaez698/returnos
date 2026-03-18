import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddToWalletButtons } from "@/components/loyalty-card/add-to-wallet-buttons";

const fetchMock = vi.fn<typeof fetch>();

describe("AddToWalletButtons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window.URL, "createObjectURL").mockReturnValue("blob:wallet-pass");
    vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("renders only configured wallet buttons", () => {
    const { rerender } = render(
      <AddToWalletButtons
        cardToken="card_public_123"
        availablePlatforms={{ apple: true, google: false }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Agregar a Apple Wallet" }),
    ).toBeInTheDocument();

    rerender(
      <AddToWalletButtons
        cardToken="card_public_123"
        availablePlatforms={{ apple: false, google: true }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Agregar a Google Wallet" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Agregar a Apple Wallet" }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when no wallet platform is configured", () => {
    const { container } = render(
      <AddToWalletButtons
        cardToken="card_public_123"
        availablePlatforms={{ apple: false, google: false }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("starts Google Wallet flow and redirects when API succeeds", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          addToGoogleWalletUrl: "https://pay.google.com/gp/v/save/mock.jwt",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    const user = userEvent.setup();

    render(
      <AddToWalletButtons
        cardToken="card_public_123"
        availablePlatforms={{ apple: false, google: true }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Agregar a Google Wallet" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/wallet/google?card_token=card_public_123",
      );
      expect(
        screen.getByRole("button", {
          name: "Preparando enlace de Google Wallet",
        }),
      ).toBeDisabled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]?.[0]).toBe(
        "/api/wallet/google?card_token=card_public_123",
      );
    });
  });

  it("downloads Apple pass and surfaces API errors", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response("PKPASS_MOCK", {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.apple.pkpass",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: "Apple Wallet is unavailable." }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    const user = userEvent.setup();

    render(
      <AddToWalletButtons
        cardToken="card_public_123"
        availablePlatforms={{ apple: true, google: false }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Agregar a Apple Wallet" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/wallet/apple?card_token=card_public_123",
      );
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
        "blob:wallet-pass",
      );
    });

    await user.click(
      screen.getByRole("button", { name: "Agregar a Apple Wallet" }),
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Apple Wallet is unavailable.",
      );
    });
  });
});
