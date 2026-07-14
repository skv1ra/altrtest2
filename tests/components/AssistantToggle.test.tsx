import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssistantToggle } from "@/components/assistants/AssistantToggle";

describe("AssistantToggle", () => {
  it("exposes switch state and forwards user interaction", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<AssistantToggle active={false} onChange={onChange} label="Enable Altr Twin" />);

    const control = screen.getByRole("switch", { name: "Enable Altr Twin" });
    expect(control).toHaveAttribute("aria-checked", "false");

    await user.click(control);
    expect(onChange).toHaveBeenCalledTimes(1);

    rerender(<AssistantToggle active onChange={onChange} label="Enable Altr Twin" />);
    expect(control).toHaveAttribute("aria-checked", "true");
    expect(control).toHaveClass("toggle-active");
  });
});
