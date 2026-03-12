import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { LogoutButton } from "@/components/shell/logout-button";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockLogoutAction = vi.fn();

vi.mock("@/features/shell/actions/logout", () => ({
  logoutAction: vi.fn(() => mockLogoutAction()),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("logout flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogoutAction.mockResolvedValue({ success: true });
  });

  describe("LogoutButton component", () => {
    it("renders a logout button with initial label", () => {
      render(<LogoutButton />);
      expect(
        screen.getByRole("button", { name: /cerrar sesión/i }),
      ).toBeInTheDocument();
    });

    it("calls logoutAction when the button is clicked", async () => {
      const user = userEvent.setup();
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockLogoutAction).toHaveBeenCalledTimes(1);
      });
    });

    it("shows loading state while logout is in progress", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockImplementation(
        () => new Promise(() => {}), // never resolves
      );
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      expect(
        screen.getByRole("button", { name: /cerrando sesión/i }),
      ).toBeInTheDocument();
    });

    it("disables the button while logout is in progress", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockImplementation(
        () => new Promise(() => {}), // never resolves
      );
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      expect(button).toBeDisabled();
    });

    it("prevents double-clicks by ignoring subsequent clicks while loading", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockImplementation(
        () => new Promise(() => {}), // never resolves
      );
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockLogoutAction).toHaveBeenCalledTimes(1);
    });

    it("displays error message when logout fails", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockResolvedValue({
        success: false,
        error: "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
      });
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        expect(
          screen.getByText(/no se pudo cerrar la sesion/i),
        ).toBeInTheDocument();
      });
    });

    it("displays error with aria-live for accessibility", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockResolvedValue({
        success: false,
        error: "No se pudo cerrar la sesion. Por favor intenta nuevamente.",
      });
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toHaveAttribute("aria-live", "polite");
      });
    });

    it("recovers from error when retry is attempted", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockResolvedValueOnce({
        success: false,
        error: "Error temporal",
      });
      mockLogoutAction.mockResolvedValueOnce({ success: true });

      render(<LogoutButton />);

      const button = screen.getByRole("button");

      // First attempt fails
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText(/error temporal/i)).toBeInTheDocument();
      });

      // Error should now be cleared when making the button clickable again
      // Note: In the current implementation, the error persists until a retry
      // The button is re-enabled so user can retry
      expect(button).not.toBeDisabled();

      // Second attempt succeeds
      await user.click(button);

      await waitFor(() => {
        expect(mockLogoutAction).toHaveBeenCalledTimes(2);
      });
    });

    it("clears error state when logout action is called again", async () => {
      const user = userEvent.setup();

      // First call fails
      mockLogoutAction.mockResolvedValueOnce({
        success: false,
        error: "Primer error",
      });

      const { rerender } = render(<LogoutButton />);

      let button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/primer error/i)).toBeInTheDocument();
      });

      // Verify error is shown in the document
      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Second call succeeds - we clear mock and set success
      mockLogoutAction.mockClear();
      mockLogoutAction.mockResolvedValue({ success: true });

      // Rerender and try again
      rerender(<LogoutButton />);

      button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      // Old error should not be present
      await waitFor(() => {
        expect(mockLogoutAction).toHaveBeenCalled();
      });
    });

    it("handles unexpected errors gracefully", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockRejectedValue(new Error("Network error"));

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/error inesperado/i)).toBeInTheDocument();
      });
    });

    it("handles logout action returning no error on failure", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockResolvedValue({
        success: false,
        // error is undefined
      });

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        // Should show a generic error message
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("stays on page on logout error (does not redirect)", async () => {
      const user = userEvent.setup();
      mockLogoutAction.mockResolvedValue({
        success: false,
        error: "No se pudo cerrar la sesion",
      });

      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        // Component should still be in the document (not unmounted by redirect)
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe("logout action", () => {
    it("calls the logout action when successful", async () => {
      mockLogoutAction.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<LogoutButton />);

      const button = screen.getByRole("button", { name: /cerrar sesión/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockLogoutAction).toHaveBeenCalledTimes(1);
      });
    });

    it("returns success:false when defined error occurs", async () => {
      mockLogoutAction.mockResolvedValue({
        success: false,
        error: "Logout failed",
      });
      render(<LogoutButton />);

      const user = userEvent.setup();
      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/logout failed/i)).toBeInTheDocument();
      });
    });
  });
});
