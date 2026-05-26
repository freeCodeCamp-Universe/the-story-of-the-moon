import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { surfaceFeatures } from "@/content";
import Ch2 from "@/chapters/Ch2/Ch2";

let reducedMotion = false;
let viewportState = {
  isNearViewport: false,
  isVisible: false,
};

const sceneHandle = {
  dispose: vi.fn(),
  getCameraLatLon: vi.fn(),
  pause: vi.fn(),
  projectFeature: vi.fn(() => ({
    x: 120,
    y: 80,
    visible: true,
  })),
  resume: vi.fn(),
  rotateBy: vi.fn(),
  setCameraTarget: vi.fn(),
};

const createMoonScene = vi.fn(() => sceneHandle);

vi.mock("@/hooks/useReducedMotion", () => ({
  useReducedMotion: () => reducedMotion,
}));

vi.mock("@/hooks/useViewportActivity", () => ({
  useViewportActivity: () => ({
    targetRef: { current: null },
    ...viewportState,
  }),
}));

vi.mock("@/three/moonScene", () => ({
  createMoonScene,
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
  beforeEach(() => {
    reducedMotion = false;
    viewportState = {
      isNearViewport: false,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render the intro figures after the text and name the surface-features group from the visible heading", () => {
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

  it("should let the basin comparison group toggle both images when the group itself has focus", async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const basinStatus = within(comparisonGroup).getByText(/^Hertzsprung:/);
    const sliders = within(comparisonGroup).getAllByRole("slider");

    expect(comparisonGroup).toHaveAttribute("aria-keyshortcuts", "O T");
    expect(sliders[0]).toHaveValue("50");
    expect(sliders[1]).toHaveValue("50");
    expect(basinStatus).toHaveTextContent(
      "Hertzsprung: 50% original, 50% topographic. Mare Orientale: 50% original, 50% topographic.",
    );

    comparisonGroup.focus();
    await user.keyboard("t");

    expect(sliders[0]).toHaveValue("0");
    expect(sliders[1]).toHaveValue("0");
    expect(basinStatus).toHaveTextContent(
      "Hertzsprung: Full topographic view. Mare Orientale: Full topographic view.",
    );

    await user.keyboard("o");

    expect(sliders[0]).toHaveValue("100");
    expect(sliders[1]).toHaveValue("100");
    expect(basinStatus).toHaveTextContent(
      "Hertzsprung: Full original view. Mare Orientale: Full original view.",
    );
  });

  it("should let O and T update only the focused basin comparison slider", async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const basinStatus = within(comparisonGroup).getByText(/^Hertzsprung:/);
    const sliders = within(comparisonGroup).getAllByRole("slider");

    sliders[0].focus();
    await user.keyboard("t");

    expect(sliders[0]).toHaveValue("0");
    expect(sliders[1]).toHaveValue("50");
    expect(basinStatus).toHaveTextContent(
      "Hertzsprung: Full topographic view. Mare Orientale: 50% original, 50% topographic.",
    );

    sliders[1].focus();
    await user.keyboard("o");

    expect(sliders[0]).toHaveValue("0");
    expect(sliders[1]).toHaveValue("100");
    expect(basinStatus).toHaveTextContent(
      "Hertzsprung: Full topographic view. Mare Orientale: Full original view.",
    );
  });

  it("should let each basin slider move independently with the keyboard", async () => {
    const user = userEvent.setup();

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

  it("should preserve Home and End keyboard controls on each basin slider", async () => {
    const user = userEvent.setup();

    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const sliders = within(comparisonGroup).getAllByRole("slider");

    sliders[0].focus();
    await user.keyboard("{End}");

    expect(sliders[0]).toHaveValue("100");
    expect(sliders[1]).toHaveValue("50");

    sliders[1].focus();
    await user.keyboard("{Home}");

    expect(sliders[0]).toHaveValue("100");
    expect(sliders[1]).toHaveValue("0");
  });

  it("should ignore modified O and T basin shortcuts", () => {
    render(<Ch2 />);

    const comparisonGroup = screen.getByRole("group", {
      name: "Basin image comparisons",
    });
    const sliders = within(comparisonGroup).getAllByRole("slider");

    fireEvent.keyDown(sliders[0], { key: "t", altKey: true });
    fireEvent.keyDown(sliders[1], { key: "o", ctrlKey: true });
    fireEvent.keyDown(sliders[1], { key: "t", metaKey: true });

    expect(sliders[0]).toHaveValue("50");
    expect(sliders[1]).toHaveValue("50");
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

  it("should announce a single debounced coordinate update after keyboard rotation", async () => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: 12.3, lon: -45.6 });

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    sceneHandle.setCameraTarget.mockClear();

    const visualGroup = screen.getByRole("group", {
      name: "Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.",
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const rotationRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains("sr-only"),
    );

    if (!rotationRegion) {
      throw new Error("Expected a hidden rotation live region.");
    }

    vi.useFakeTimers();
    fireEvent.keyDown(visualGroup, { key: "ArrowRight" });
    act(() => {
      vi.advanceTimersByTime(400);
    });
    fireEvent.keyDown(visualGroup, { key: "ArrowRight" });

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(rotationRegion.textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(sceneHandle.rotateBy).toHaveBeenCalledTimes(2);
    expect(sceneHandle.getCameraLatLon).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toContain("Viewing 12.3°N 45.6°W");

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(sceneHandle.setCameraTarget).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toBe("");
  });

  it("should announce a debounced coordinate update after pointer drag release", async () => {
    viewportState = {
      isNearViewport: true,
      isVisible: false,
    };
    sceneHandle.getCameraLatLon.mockReturnValue({ lat: -8.4, lon: 22.1 });

    render(<Ch2 />);

    await waitFor(() => {
      expect(createMoonScene).toHaveBeenCalledTimes(1);
    });
    sceneHandle.setCameraTarget.mockClear();

    const visualGroup = screen.getByRole("group", {
      name: "Interactive view of the Moon; use arrow keys to rotate, and after you stop the view re-centers on the active feature.",
    });
    const liveRegions = visualGroup.querySelectorAll('[aria-live="polite"]');
    const rotationRegion = Array.from(liveRegions).find((region) =>
      region.classList.contains("sr-only"),
    );
    const canvas = visualGroup.querySelector("canvas");

    if (!rotationRegion || !canvas) {
      throw new Error("Expected the Ch2 visual canvas and hidden live region.");
    }

    vi.useFakeTimers();
    fireEvent.pointerDown(canvas);
    fireEvent.pointerUp(canvas);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(sceneHandle.getCameraLatLon).toHaveBeenCalledTimes(1);
    expect(rotationRegion.textContent).toContain("Viewing 8.4°S 22.1°E");
  });
});
