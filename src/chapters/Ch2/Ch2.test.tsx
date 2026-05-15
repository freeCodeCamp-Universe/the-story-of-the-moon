import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { surfaceFeatures } from "@/content";
import Ch2 from "@/chapters/Ch2";

let reducedMotion = false;

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => reducedMotion,
}));

vi.mock("@/components/ScrollyChapter", () => ({
  default: ({
    steps,
    ariaLabel,
    ariaLabelledBy,
  }: {
    steps: Array<{ id: string; content: React.ReactNode }>;
    ariaLabel?: string;
    ariaLabelledBy?: string;
  }) => (
    <section role="group" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy}>
      {steps.map((step) => (
        <article key={step.id}>{step.content}</article>
      ))}
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
    expect(
      basinParagraph.compareDocumentPosition(basinImages[0]) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
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
});
