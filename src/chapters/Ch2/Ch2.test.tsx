import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { surfaceFeatures } from "@/content";
import Ch2 from "@/chapters/Ch2/Ch2";

let reducedMotion = false;

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => reducedMotion,
}));

vi.mock("@/hooks/useViewportActivity", () => ({
  useViewportActivity: () => ({
    targetRef: { current: null },
    isNearViewport: false,
    isVisible: false,
  }),
}));

vi.mock("@/components/ScrollyChapter/ScrollyChapter", () => ({
  ScrollyChapter: ({
    steps,
    visual,
    visualBelow,
    ariaLabel,
    ariaLabelledBy,
  }: {
    steps: Array<{ id: string; content: React.ReactNode }>;
    visual?: React.ReactNode;
    visualBelow?: React.ReactNode;
    ariaLabel?: string;
    ariaLabelledBy?: string;
  }) => (
    <section role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
      {visual}
      {steps.map((step) => (
        <article key={step.id}>{step.content}</article>
      ))}
      {visualBelow}
    </section>
  ),
}));

describe("Ch2", () => {
  it("should render the intro figures after the text and name the surface-features group from the visible heading", () => {
    reducedMotion = false;
    render(<Ch2 />);

    const title = screen.getByRole("heading", {
      level: 3,
      name: "Surface features of the Moon",
    });
    expect(title).toBeInTheDocument();

    const scrollyGroup = screen.getByRole("group", {
      name: "Surface features of the Moon",
    });
    expect(
      within(scrollyGroup).getAllByRole("heading", { level: 4 }),
    ).toHaveLength(surfaceFeatures.length);

    const craterSection = screen.getByRole("region", { name: "Crater" });
    const craterParagraph = within(craterSection).getByText(
      /A crater is a bowl-shaped depression/,
    );
    const craterImage = within(craterSection).getByRole("img", {
      name: /terraced walls and peaks in its center/i,
    });
    expect(
      craterParagraph.compareDocumentPosition(craterImage) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);

    const basinSection = screen.getByRole("region", { name: "Basin" });
    const basinParagraph = within(basinSection).getByText(
      /Over time, these giant depressions are often filled/,
    );
    const basinImages = within(basinSection).getAllByRole("img");
    expect(basinImages).toHaveLength(2);
    expect(basinSection.querySelectorAll("img")).toHaveLength(4);
    expect(
      within(basinSection).getByRole("slider", {
        name: "Compare Hertzsprung basin original and topographic views",
      }),
    ).toBeInTheDocument();
    expect(
      within(basinSection).getByRole("slider", {
        name: "Compare Mare Orientale original and topographic views",
      }),
    ).toBeInTheDocument();
    expect(
      basinParagraph.compareDocumentPosition(basinImages[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });

  it("should let the basin comparison container toggle both images with O and T", async () => {
    const user = userEvent.setup();

    reducedMotion = false;
    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const sliders = within(comparisonGroup).getAllByRole("slider");

    expect(sliders[0]).toHaveValue("50");
    expect(sliders[1]).toHaveValue("50");

    comparisonGroup.focus();
    await user.keyboard("t");

    expect(sliders[0]).toHaveValue("0");
    expect(sliders[1]).toHaveValue("0");

    await user.keyboard("o");

    expect(sliders[0]).toHaveValue("100");
    expect(sliders[1]).toHaveValue("100");
  });

  it("should let each basin slider move independently with the keyboard", async () => {
    const user = userEvent.setup();

    reducedMotion = false;
    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const sliders = within(comparisonGroup).getAllByRole("slider");

    sliders[0].focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");

    expect(sliders[0]).toHaveValue("52");
    expect(sliders[1]).toHaveValue("50");

    sliders[1].focus();
    await user.keyboard("{PageDown}");

    expect(sliders[0]).toHaveValue("52");
    expect(sliders[1]).toHaveValue("40");
  });

  it("should preserve the same heading hierarchy in the reduced-motion fallback", () => {
    reducedMotion = true;
    render(<Ch2 />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Surface features of the Moon",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(
      surfaceFeatures.length,
    );
  });

  it("should expose the active moon feature label as a polite live region", () => {
    reducedMotion = false;
    render(<Ch2 />);

    const visualGroup = screen.getByRole("group", {
      name: "Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.",
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const annotationLiveRegion = Array.from(liveRegions).find(
      (region) => !region.classList.contains("sr-only"),
    );
    const rotationLiveRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains("sr-only"),
    );

    expect(liveRegions).toHaveLength(2);
    expect(annotationLiveRegion).not.toBeNull();
    expect(rotationLiveRegion).not.toBeNull();
    if (!annotationLiveRegion || !rotationLiveRegion) {
      throw new Error("Expected both Ch2 live regions to render.");
    }
    expect(annotationLiveRegion).toHaveAttribute("aria-atomic", "true");
    expect(annotationLiveRegion).not.toHaveAttribute("aria-hidden");
    expect(rotationLiveRegion).toHaveAttribute("aria-atomic", "true");
    expect(rotationLiveRegion.textContent).toBe("");
  });
});
