import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Ch1 from "./index";

describe("Ch1", () => {
  it("should place the giant-impact diagram between the opening prose and the remaining explanation", () => {
    render(<Ch1 />);

    const heroImage = screen.getByRole("img", {
      name: /artist's concept shows a celestial body/i,
    });
    const diagram = screen.getByRole("figure", {
      name: "The giant-impact hypothesis in four stages.",
    });
    const fourthParagraph = screen.getByText(
      /The giant-impact hypothesis remains the favored model because it explains anomalies/i,
    );

    expect(heroImage).toBeInTheDocument();
    expect(diagram).toBeInTheDocument();
    expect(fourthParagraph).toBeInTheDocument();

    expect(
      heroImage.compareDocumentPosition(diagram) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(
      diagram.compareDocumentPosition(fourthParagraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });

  it("should render four accessible giant-impact stage illustrations with captions", () => {
    render(<Ch1 />);

    const diagram = screen.getByRole("figure", {
      name: "The giant-impact hypothesis in four stages.",
    });
    const stageSvgs = within(diagram).getAllByRole("img");

    expect(stageSvgs).toHaveLength(4);
    expect(
      within(diagram).getByRole("img", {
        name: "Approach stage of the giant-impact hypothesis.",
      }),
    ).toBeInTheDocument();
    expect(
      within(diagram).getByRole("img", {
        name: "Impact stage of the giant-impact hypothesis.",
      }),
    ).toBeInTheDocument();
    expect(
      within(diagram).getByRole("img", {
        name: "Debris-ring stage of the giant-impact hypothesis.",
      }),
    ).toBeInTheDocument();
    expect(
      within(diagram).getByRole("img", {
        name: "Coalescence stage of the giant-impact hypothesis.",
      }),
    ).toBeInTheDocument();

    expect(within(diagram).getByText("Approach")).toBeInTheDocument();
    expect(within(diagram).getByText("Impact")).toBeInTheDocument();
    expect(within(diagram).getByText("Debris ring")).toBeInTheDocument();
    expect(within(diagram).getByText("Coalesce")).toBeInTheDocument();
    expect(
      within(diagram).queryByText(/A Mars-sized body, Theia, approaches/i),
    ).not.toBeInTheDocument();
  });
});
