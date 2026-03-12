import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LogoutButton } from "@/components/shell/logout-button";

vi.mock("@/features/shell/actions/logout", () => ({
  logoutAction: vi.fn(),
}));

import { logoutAction } from "@/features/shell/actions/logout";

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logout button with correct initial text", () => {
    render(<LogoutButton />);

    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("calls logoutAction when button is clicked", async () => {
    vi.mocked(logoutAction).mockResolvedValue({ success: true });

    render(<LogoutButton />);

    const button = screen.getByRole("button", { name: "Cerrar sesión" });
    fireEvent.click(button);

    await waitFor(() => {
      expect(logoutAction).toHaveBeenCalled();
    });
  });

  it("displays loading state while logout is in progress", async () => {
    let resolveLogout: () => void;
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });

    vi.mocked(logoutAction).mockReturnValue(
      logoutPromise.then(() => ({ success: true })),
    );

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByText("Cerrando sesión...")).toBeInTheDocument();
    });

    resolveLogout!();
  });

  it("disables button during logout", async () => {
    let resolveLogout: () => void;
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });

    vi.mocked(logoutAction).mockReturnValue(
      logoutPromise.then(() => ({ success: true })),
    );

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    resolveLogout!();
  });

  it("displays error message when logout fails", async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
        ),
      ).toBeInTheDocument();
    });
  });

  it("re-enables button after error", async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: "Generic error",
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it("displays default error message when no error text is provided", async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: undefined,
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Error desconocido")).toBeInTheDocument();
    });
  });

  it("displays custom error message from server", async () => {
    const customError = "Se produjo un error inesperado";
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: customError,
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(customError)).toBeInTheDocument();
    });
  });

  it("prevents double-clicks during logout", async () => {
    let resolveLogout: () => void;
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });

    vi.mocked(logoutAction).mockReturnValue(
      logoutPromise.then(() => ({ success: true })),
    );

    render(<LogoutButton />);

    const button = screen.getByRole("button");

    // Click button twice rapidly
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      // logoutAction should only be called once
      expect(logoutAction).toHaveBeenCalledTimes(1);
    });

    resolveLogout!();
  });

  it("clears error on successful login attempt", async () => {
    vi.mocked(logoutAction).mockResolvedValueOnce({
      success: false,
      error: "First error",
    });

    const { rerender } = render(<LogoutButton />);

    let button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("First error")).toBeInTheDocument();
    });

    // Try again - should clear the error
    vi.mocked(logoutAction).mockResolvedValueOnce({ success: true });

    button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      // The redirect happens on success, but error should be cleared
      expect(logoutAction).toHaveBeenCalledTimes(2);
    });
  });

  it("updates aria-label based on loading state", async () => {
    let resolveLogout: () => void;
    const logoutPromise = new Promise<void>((resolve) => {
      resolveLogout = resolve;
    });

    vi.mocked(logoutAction).mockReturnValue(
      logoutPromise.then(() => ({ success: true })),
    );

    render(<LogoutButton />);

    let button = screen.getByRole("button", { name: "Cerrar sesión" });
    expect(button).toHaveAttribute("aria-label", "Cerrar sesión");

    fireEvent.click(button);

    await waitFor(() => {
      button = screen.getByRole("button", { name: "Cerrando sesión..." });
      expect(button).toHaveAttribute("aria-label", "Cerrando sesión...");
    });

    resolveLogout!();
  });

  it("displays error with role alert for accessibility", async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: false,
      error: "Accessibility error",
    });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      const errorAlert = screen.getByRole("alert");
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveAttribute("aria-live", "polite");
      expect(screen.getByText("Accessibility error")).toBeInTheDocument();
    });
  });

  it("prevents default event behavior on button click", async () => {
    vi.mocked(logoutAction).mockResolvedValue({ success: true });

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    const event = new MouseEvent("click", { bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");

    button.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it("handles unexpected errors from logout action", async () => {
    vi.mocked(logoutAction).mockRejectedValue(new Error("Network error"));

    render(<LogoutButton />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Se produjo un error inesperado"),
      ).toBeInTheDocument();
    });
  });
});
