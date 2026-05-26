import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Chapter } from "./Chapter";

describe("Chapter", () => {
  it("should expose a labeled region using the chapter heading", () => {
    render(
      <Chapter
        id="chapter-3"
        question="How did the Moon form?"
        title="A violent beginning"
      >
        <p>Body copy</p>
      </Chapter>,
    );

    const chapter = screen.getByRole("region", { name: "A violent beginning" });
    const heading = within(chapter).getByRole("heading", {
      level: 2,
      name: "A violent beginning",
    });

    expect(chapter.getAttribute("id")).toBe("chapter-3");
    expect(chapter.getAttribute("aria-labelledby")).toBe("chapter-3-heading");
    expect(heading.getAttribute("id")).toBe("chapter-3-heading");
    expect(
      within(chapter).getByText("How did the Moon form?").textContent,
    ).toBe("How did the Moon form?");
  });

  it("should render body content after the chapter header", () => {
    render(
      <Chapter
        id="chapter-5"
        question="What did the samples show?"
        title="Reading the rocks"
      >
        <p>The oldest highlands are rich in anorthosite.</p>
        <button type="button">Compare samples</button>
      </Chapter>,
    );

    const chapter = screen.getByRole("region", { name: "Reading the rocks" });
    const children = Array.from(chapter.children);
    const body = children[1];

    expect(children[0]?.tagName).toBe("HEADER");
    expect(body?.tagName).toBe("DIV");
    expect(
      body?.contains(
        screen.getByText("The oldest highlands are rich in anorthosite."),
      ),
    ).toBe(true);
    expect(
      body?.contains(
        within(chapter).getByRole("button", { name: "Compare samples" }),
      ),
    ).toBe(true);
  });
});
