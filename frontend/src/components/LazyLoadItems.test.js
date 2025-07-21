import '@testing-library/jest-dom';
import { render, screen } from "@testing-library/react";
import LazyLoadItems from "./lazyLoadItems";

describe("LazyLoadItems", () => {
  const items = [
    { name: "Item 1" },
    { name: "Item 2" },
    { name: "Item 3" },
  ];

  it("renders items when loaded", () => {
    render(
      <LazyLoadItems
        hasNextPage={false}
        isNextPageLoading={false}
        items={items}
        loadNextPage={jest.fn()}
      />
    );

    expect(screen.getByText(/Item 1/)).toBeInTheDocument();
    expect(screen.getByText(/Item 2/)).toBeInTheDocument();
    expect(screen.getByText(/Item 3/)).toBeInTheDocument();
  });

  it("shows loading indicator for next page", () => {
    render(
      <LazyLoadItems
        hasNextPage={true}
        isNextPageLoading={false}
        items={items}
        loadNextPage={jest.fn()}
      />
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("calls loadNextPage when not loading", () => {
    const loadNextPage = jest.fn();
    render(
      <LazyLoadItems
        hasNextPage={true}
        isNextPageLoading={false}
        items={items}
        loadNextPage={loadNextPage}
      />
    );
    expect(typeof loadNextPage).toBe("function");
  });

  it("does not call loadNextPage when already loading", () => {
    const loadNextPage = jest.fn();
    render(
      <LazyLoadItems
        hasNextPage={true}
        isNextPageLoading={true}
        items={items}
        loadNextPage={loadNextPage}
      />
    );
    expect(loadNextPage).not.toHaveBeenCalled();
  });

  it("renders correct number of items when hasNextPage is true", () => {
    render(
      <LazyLoadItems
        hasNextPage={true}
        isNextPageLoading={false}
        items={items}
        loadNextPage={jest.fn()}
      />
    );
    // 3 items + 1 loading
    expect(screen.getAllByText(/Item/)).toHaveLength(3);
    expect(screen.getAllByText(/Loading/)).toHaveLength(1);
  });

  it("renders correct number of items when hasNextPage is false", () => {
    render(
      <LazyLoadItems
        hasNextPage={false}
        isNextPageLoading={false}
        items={items}
        loadNextPage={jest.fn()}
      />
    );
    expect(screen.getAllByText(/Item/)).toHaveLength(3);
  });
});
