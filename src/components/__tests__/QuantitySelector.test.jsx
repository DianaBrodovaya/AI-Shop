import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuantitySelector from "../QuantitySelector.jsx";

describe("QuantitySelector", () => {
  it("renders with initial value 1", () => {
    render(<QuantitySelector />);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("disables minus button at value 1", () => {
    render(<QuantitySelector />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].disabled).toBe(true);
  });

  it("shows limit message at max value", () => {
    render(<QuantitySelector max={2} />);
    const plusButton = screen.getAllByRole("button")[1];
    fireEvent.click(plusButton);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("hides limit message after decreasing from max", () => {
    render(<QuantitySelector max={2} />);
    const [minusButton, plusButton] = screen.getAllByRole("button");
    fireEvent.click(plusButton);
    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(minusButton);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("does not go below 1 when clicking minus", () => {
    render(<QuantitySelector />);
    const minusButton = screen.getAllByRole("button")[0];
    fireEvent.click(minusButton);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("disables both buttons when max is 1", () => {
    render(<QuantitySelector max={1} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it("handles rapid clicks without exceeding max", () => {
    render(<QuantitySelector max={3} />);
    const plusButton = screen.getAllByRole("button")[1];
    for (let i = 0; i < 10; i++) {
      fireEvent.click(plusButton);
    }
    expect(screen.getByText("3")).toBeTruthy();
  });
});
