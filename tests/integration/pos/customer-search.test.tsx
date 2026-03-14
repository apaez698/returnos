import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomerSearch } from "@/components/pos/customer-search";
import { PosCustomer } from "@/lib/pos/types";

// Mock data
const mockCustomers: PosCustomer[] = [
  {
    id: "cust-1",
    name: "Juan García",
    phone: "555-0101",
    points: 150,
    last_visit_at: "2025-03-10",
  },
  {
    id: "cust-2",
    name: "María López",
    phone: "555-0102",
    points: 280,
    last_visit_at: "2025-03-08",
  },
  {
    id: "cust-3",
    name: "Carlos Rodríguez",
    phone: "555-0103",
    points: 45,
    last_visit_at: null,
  },
];

describe("CustomerSearch Integration Tests", () => {
  it("renders the search input field", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={[]}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const searchInput = screen.getByRole("searchbox", {
      name: /buscar cliente/i,
    });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute("id", "customer_search");
    expect(searchInput).toHaveAttribute("placeholder", "Nombre o teléfono");
    expect(searchInput).toHaveAttribute("autocomplete", "off");
  });

  it("renders search results from mocked data", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query="Juan"
        customers={mockCustomers}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    // Verify all customers are displayed
    expect(screen.getByText("Juan García")).toBeInTheDocument();
    expect(screen.getByText("María López")).toBeInTheDocument();
    expect(screen.getByText("Carlos Rodríguez")).toBeInTheDocument();

    // Verify phone numbers are displayed
    expect(screen.getByText("555-0101")).toBeInTheDocument();
    expect(screen.getByText("555-0102")).toBeInTheDocument();
    expect(screen.getByText("555-0103")).toBeInTheDocument();

    // Verify points are displayed
    expect(screen.getByText("150 pts")).toBeInTheDocument();
    expect(screen.getByText("280 pts")).toBeInTheDocument();
    expect(screen.getByText("45 pts")).toBeInTheDocument();
  });

  it("triggers onSelectCustomer callback when a result is clicked", async () => {
    const user = userEvent.setup();
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={mockCustomers}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const juanButton = screen.getByRole("button", { name: /juan garcía/i });
    await user.click(juanButton);

    expect(handleSelectCustomer).toHaveBeenCalledOnce();
    expect(handleSelectCustomer).toHaveBeenCalledWith(mockCustomers[0]);
  });

  it("updates query when user types in search input", async () => {
    const user = userEvent.setup();
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={[]}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const searchInput = screen.getByRole("searchbox");
    await user.type(searchInput, "Juan");

    // userEvent.type triggers onChange for each character individually
    expect(handleQueryChange).toHaveBeenNthCalledWith(1, "J");
    expect(handleQueryChange).toHaveBeenNthCalledWith(2, "u");
    expect(handleQueryChange).toHaveBeenNthCalledWith(3, "a");
    expect(handleQueryChange).toHaveBeenNthCalledWith(4, "n");
    expect(handleQueryChange).toHaveBeenCalledTimes(4);
  });

  it("highlights selected customer button and shows their info", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={mockCustomers}
        selectedCustomer={mockCustomers[0]}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const selectedButton = screen.getByRole("button", { name: /juan garcía/i });
    expect(selectedButton).toHaveClass("bg-indigo-50");
    expect(within(selectedButton).getByText("Juan García")).toBeInTheDocument();
    expect(within(selectedButton).getByText("555-0101")).toBeInTheDocument();
    expect(within(selectedButton).getByText("150 pts")).toBeInTheDocument();
  });

  it("highlights the selected customer in the results list", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={mockCustomers}
        selectedCustomer={mockCustomers[0]}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const juanButton = screen.getByRole("button", { name: /juan garcía/i });
    expect(juanButton).toHaveClass("bg-indigo-50");
  });

  it("displays loading state when isLoading is true", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query="Juan"
        customers={[]}
        selectedCustomer={null}
        isLoading={true}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    expect(screen.getByText("Buscando clientes...")).toBeInTheDocument();
  });

  it("displays 'no results' message when hasSearched is true and no customers match", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query="XYZ"
        customers={[]}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    expect(
      screen.getByText("No encontramos un cliente para esta busqueda."),
    ).toBeInTheDocument();
    expect(screen.getByText(/sin coincidencias para/i)).toBeInTheDocument();
  });

  it("shows primary create button and triggers callback on not-found state", async () => {
    const user = userEvent.setup();
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();
    const handleCreateCustomer = vi.fn();

    render(
      <CustomerSearch
        query="Pedro"
        customers={[]}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
        onCreateCustomer={handleCreateCustomer}
      />,
    );

    const createButton = screen.getByRole("button", {
      name: /crear cliente nuevo/i,
    });
    expect(createButton.className).toContain("min-h-[52px]");

    await user.click(createButton);
    expect(handleCreateCustomer).toHaveBeenCalledOnce();
  });

  it("displays default empty message when hasSearched is false and no customers available", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={[]}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    expect(
      screen.getByText("No hay clientes disponibles para mostrar."),
    ).toBeInTheDocument();
  });

  it("does not highlight any button when no customer is selected", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query=""
        customers={mockCustomers}
        selectedCustomer={null}
        isLoading={false}
        hasSearched={false}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => expect(btn).not.toHaveClass("bg-indigo-50"));
  });

  it("displays update loading message when isLoading is true with existing results", () => {
    const handleQueryChange = vi.fn();
    const handleSelectCustomer = vi.fn();

    render(
      <CustomerSearch
        query="Juan"
        customers={mockCustomers}
        selectedCustomer={null}
        isLoading={true}
        hasSearched={true}
        onQueryChange={handleQueryChange}
        onSelectCustomer={handleSelectCustomer}
      />,
    );

    expect(screen.getByText("Actualizando resultados...")).toBeInTheDocument();
    // Customers should still be visible
    expect(screen.getByText("Juan García")).toBeInTheDocument();
  });

  describe("Submit mode", () => {
    it("renders submit button when searchMode is 'submit'", () => {
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();
      const handleSubmitSearch = vi.fn();

      render(
        <CustomerSearch
          query=""
          customers={[]}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={false}
          searchMode="submit"
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
          onSubmitSearch={handleSubmitSearch}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /buscar/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("does not render submit button when searchMode is 'live' (default)", () => {
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();

      render(
        <CustomerSearch
          query=""
          customers={[]}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={false}
          searchMode="live"
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      const searchButtons = screen.queryAllByRole("button", {
        name: /buscar/i,
      });
      expect(searchButtons).toHaveLength(0);
    });

    it("triggers onSubmitSearch callback when submit button is clicked", async () => {
      const user = userEvent.setup();
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();
      const handleSubmitSearch = vi.fn();

      render(
        <CustomerSearch
          query="María"
          customers={[]}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={false}
          searchMode="submit"
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
          onSubmitSearch={handleSubmitSearch}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /buscar/i });
      await user.click(submitButton);

      expect(handleSubmitSearch).toHaveBeenCalledOnce();
    });
  });

  describe("Multiple customer interactions", () => {
    it("allows switching between multiple customer selections", async () => {
      const user = userEvent.setup();
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();

      const { rerender } = render(
        <CustomerSearch
          query=""
          customers={mockCustomers}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={true}
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      // Select first customer
      await user.click(screen.getByRole("button", { name: /juan garcía/i }));
      expect(handleSelectCustomer).toHaveBeenCalledWith(mockCustomers[0]);

      // Rerender with first customer selected
      rerender(
        <CustomerSearch
          query=""
          customers={mockCustomers}
          selectedCustomer={mockCustomers[0]}
          isLoading={false}
          hasSearched={true}
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      // Verify first customer is highlighted
      expect(screen.getByRole("button", { name: /juan garcía/i })).toHaveClass(
        "bg-indigo-50",
      );

      // Select second customer
      await user.click(screen.getByRole("button", { name: /maría lópez/i }));
      expect(handleSelectCustomer).toHaveBeenCalledWith(mockCustomers[1]);
    });

    it("renders all customer details correctly", () => {
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();

      render(
        <CustomerSearch
          query=""
          customers={mockCustomers}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={true}
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      mockCustomers.forEach((customer) => {
        expect(screen.getByText(customer.name)).toBeInTheDocument();
        expect(screen.getByText(customer.phone)).toBeInTheDocument();
        expect(screen.getByText(`${customer.points} pts`)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("search input has proper label association", () => {
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();

      render(
        <CustomerSearch
          query=""
          customers={[]}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={false}
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      const label = screen.getByText("Buscar cliente") as HTMLLabelElement;
      const input = screen.getByRole("searchbox") as HTMLInputElement;

      expect(label.htmlFor).toBe("customer_search");
      expect(input.id).toBe(label.htmlFor);
    });

    it("customer buttons are keyboard accessible", async () => {
      const user = userEvent.setup();
      const handleQueryChange = vi.fn();
      const handleSelectCustomer = vi.fn();

      render(
        <CustomerSearch
          query=""
          customers={mockCustomers}
          selectedCustomer={null}
          isLoading={false}
          hasSearched={true}
          onQueryChange={handleQueryChange}
          onSelectCustomer={handleSelectCustomer}
        />,
      );

      const juanButton = screen.getByRole("button", { name: /juan garcía/i });
      juanButton.focus();
      expect(juanButton).toHaveFocus();

      // Simulate Enter key press
      fireEvent.keyDown(juanButton, { key: "Enter", code: "Enter" });
      expect(juanButton).toHaveFocus();
    });
  });
});
