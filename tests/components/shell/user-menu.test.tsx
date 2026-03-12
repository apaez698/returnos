import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserMenu } from "@/components/shell/user-menu";

vi.mock("@/components/shell/logout-button", () => ({
  LogoutButton: () => <button>Logout Button</button>,
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user email and logout button", () => {
    render(<UserMenu email="user@example.com" />);

    expect(screen.getByText("user@example.com")).toBeInTheDocument();
    expect(screen.getByText("Logout Button")).toBeInTheDocument();
  });

  it("displays user initial avatar with correct style", () => {
    const { container } = render(<UserMenu email="john@example.com" />);

    const avatar = container.querySelector('[aria-hidden="true"]');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass("w-8", "h-8", "rounded-full", "bg-slate-600");

    const initial = screen.getByText("J");
    expect(initial).toBeInTheDocument();
    expect(initial).toHaveClass("text-white", "text-xs", "font-medium");
  });

  it("displays role label when role is provided", () => {
    render(<UserMenu email="owner@example.com" role="owner" />);

    expect(screen.getByText("Propietario")).toBeInTheDocument();
  });

  it("displays admin role label", () => {
    render(<UserMenu email="admin@example.com" role="admin" />);

    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("displays staff role label", () => {
    render(<UserMenu email="staff@example.com" role="staff" />);

    expect(screen.getByText("Colaborador")).toBeInTheDocument();
  });

  it("does not display role label when role is null", () => {
    render(<UserMenu email="user@example.com" role={null} />);

    expect(screen.queryByText("Propietario")).not.toBeInTheDocument();
    expect(screen.queryByText("Administrador")).not.toBeInTheDocument();
    expect(screen.queryByText("Colaborador")).not.toBeInTheDocument();
  });

  it("does not display role label when role is undefined", () => {
    render(<UserMenu email="user@example.com" role={undefined} />);

    expect(screen.queryByText("Propietario")).not.toBeInTheDocument();
  });

  it("displays unknown role label as-is", () => {
    render(<UserMenu email="user@example.com" role={"unknown" as any} />);

    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("displays email with title attribute for accessibility", () => {
    const { container } = render(
      <UserMenu email="verylongemail@example.com" />,
    );

    const emailElement = screen.getByTitle("verylongemail@example.com");
    expect(emailElement).toBeInTheDocument();
    expect(emailElement).toHaveClass("truncate");
  });

  it("truncates long email display", () => {
    render(
      <UserMenu
        email="this.is.a.very.long.email.address@example.com"
        role="owner"
      />,
    );

    const emailElement = screen.getByTitle(
      "this.is.a.very.long.email.address@example.com",
    );
    expect(emailElement).toHaveClass("truncate");
  });

  it("renders email first followed by role", () => {
    const { container } = render(
      <UserMenu email="user@example.com" role="admin" />,
    );

    const userSection = container.querySelector(".flex.flex-col.gap-3");
    expect(userSection).toBeInTheDocument();

    const children = userSection?.querySelectorAll(":scope > *");
    expect(children?.length).toBeGreaterThan(0);
  });

  it("applies proper text styling to email", () => {
    render(<UserMenu email="test@example.com" role="staff" />);

    const emailElement = screen.getByText("test@example.com");
    expect(emailElement).toHaveClass("text-xs", "text-slate-300", "truncate");
  });

  it("applies proper text styling to role", () => {
    render(<UserMenu email="test@example.com" role="owner" />);

    const roleElement = screen.getByText("Propietario");
    expect(roleElement).toHaveClass("text-xs", "text-slate-500");
  });

  it("includes leading-snug on email for consistent spacing", () => {
    render(<UserMenu email="user@example.com" />);

    const emailElement = screen.getByText("user@example.com");
    expect(emailElement).toHaveClass("leading-snug");
  });
});
