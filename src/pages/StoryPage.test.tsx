import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CHAPTERS } from "@/data/chapters";
import StoryPage from "./StoryPage";

vi.mock("@/chapters", () => ({
  Ch1: () => <div>Ch1 content</div>,
  Ch2: () => <div>Ch2 content</div>,
  Ch3: () => <div>Ch3 content</div>,
  Ch4: () => <div>Ch4 content</div>,
  Ch5: () => <div>Ch5 content</div>,
  Ch6: () => <div>Ch6 content</div>,
  Ch7: () => <div>Ch7 content</div>,
}));

const { useChapterFragmentSync } = vi.hoisted(() => ({
  useChapterFragmentSync: vi.fn(),
}));
vi.mock("@/hooks/useChapterFragmentSync", () => ({
  useChapterFragmentSync,
}));

describe("StoryPage", () => {
  beforeEach(() => {
    window.location.hash = "";
    useChapterFragmentSync.mockClear();
    HTMLElement.prototype.scrollIntoView = vi.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("should update the chapter picker when the hash changes and when selecting from the dropdown", () => {
    window.location.hash = "#chapter-3";
    render(<StoryPage />);

    expect(
      screen.getByRole("button", {
        name: `open chapter list, current chapter ${CHAPTERS[2].index}: ${CHAPTERS[2].title}`,
      }),
    ).toBeInTheDocument();

    window.location.hash = "#chapter-5";
    fireEvent(window, new Event("hashchange"));

    expect(
      screen.getByRole("button", {
        name: `open chapter list, current chapter ${CHAPTERS[4].index}: ${CHAPTERS[4].title}`,
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /open chapter list, current chapter/i,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: `${CHAPTERS[5].index}. ${CHAPTERS[5].title}`,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: `open chapter list, current chapter ${CHAPTERS[5].index}: ${CHAPTERS[5].title}`,
      }),
    ).toBeInTheDocument();
  });

  it("should let the skip link target the focusable main landmark", () => {
    const { container } = render(<StoryPage />);

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    const main = screen.getByRole("main");

    expect(main).toHaveAttribute("id", "main");
    expect(main).toHaveAttribute("tabindex", "-1");
    expect(skipLink).toHaveAttribute("href", "#main");
    expect(container.querySelector("#main")).toBe(main);
  });

  it("should render all chapter regions, postcards, and the interlude", () => {
    const { container } = render(<StoryPage />);

    for (const chapter of CHAPTERS) {
      expect(
        screen.getByRole("region", {
          name: chapter.title,
        }),
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole("img", {
        name: /moon illustration with/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(3);
  });
});
