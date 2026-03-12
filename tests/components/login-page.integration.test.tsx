import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LoginPage from "@/app/login/page";

const mockSignInWithOtp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
    },
  }),
}));

describe("LoginPage integration", () => {
  beforeEach(() => {
    mockSignInWithOtp.mockReset();
  });

  it("renders email input and submit button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText("Correo electronico")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar enlace" }),
    ).toBeInTheDocument();
  });

  it("shows validation error and skips auth call for invalid email", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("Correo electronico"),
      "invalid-email",
    );
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Ingresa un correo valido.",
    );
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it("shows loading state and then success for a valid submit", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((value: { error: null }) => void) | null = null;

    mockSignInWithOtp.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("Correo electronico"),
      "  owner@Bakery.com  ",
    );
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: "owner@bakery.com",
      options: {
        emailRedirectTo:
          "http://localhost:3000/auth/callback?next=%2Fdashboard",
      },
    });

    if (resolveRequest) {
      resolveRequest({ error: null });
    }

    expect(
      await screen.findByText(
        "Revisa tu correo para abrir el enlace de acceso.",
      ),
    ).toBeInTheDocument();
  });

  it("shows provider error message when auth fails", async () => {
    const user = userEvent.setup();
    mockSignInWithOtp.mockResolvedValueOnce({
      error: new Error("Auth unavailable"),
    });

    render(<LoginPage />);

    await user.type(
      screen.getByLabelText("Correo electronico"),
      "owner@bakery.com",
    );
    await user.click(screen.getByRole("button", { name: "Enviar enlace" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Auth unavailable");
    });
  });
});
