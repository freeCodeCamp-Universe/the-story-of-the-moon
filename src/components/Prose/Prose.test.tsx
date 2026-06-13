import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Prose } from './Prose';

describe('Prose', () => {
  it('should render its children', () => {
    render(
      <Prose>
        <p>Reading copy.</p>
      </Prose>
    );

    expect(screen.getByText('Reading copy.')).toBeInTheDocument();
  });

  it('should render a div by default', () => {
    const { container } = render(<Prose>copy</Prose>);

    expect(container.firstElementChild?.tagName).toBe('DIV');
  });

  it('should render the element named by the `as` prop', () => {
    render(
      <Prose as="section" aria-label="story">
        copy
      </Prose>
    );

    expect(screen.getByRole('region', { name: 'story' }).tagName).toBe('SECTION');
  });

  it('should forward arbitrary attributes to the rendered element', () => {
    const { container } = render(
      <Prose id="intro" data-testid="prose">
        copy
      </Prose>
    );

    const el = container.firstElementChild as HTMLElement;
    expect(el.id).toBe('intro');
    expect(el).toHaveAttribute('data-testid', 'prose');
  });

  it('should append a caller-supplied className alongside its own classes', () => {
    const { container } = render(<Prose className="extra">copy</Prose>);

    expect(container.firstElementChild).toHaveClass('extra');
  });

  it('should apply distinct classes for each width tier', () => {
    const { container: text } = render(<Prose width="text">copy</Prose>);
    const { container: wide } = render(<Prose width="wide">copy</Prose>);
    const { container: frame } = render(<Prose width="frame">copy</Prose>);
    const { container: full } = render(<Prose width="full">copy</Prose>);

    const classOf = (c: HTMLElement) => (c.firstElementChild as HTMLElement).className;
    expect(classOf(wide)).not.toBe(classOf(text));
    expect(classOf(frame)).not.toBe(classOf(text));
    expect(classOf(frame)).not.toBe(classOf(wide));
    expect(classOf(full)).not.toBe(classOf(text));
    expect(classOf(full)).not.toBe(classOf(frame));
  });

  it('should add a flush class only when flush is set', () => {
    const { container: normal } = render(<Prose>copy</Prose>);
    const { container: flush } = render(<Prose flush>copy</Prose>);

    const classOf = (c: HTMLElement) => (c.firstElementChild as HTMLElement).className;
    expect(classOf(flush)).not.toBe(classOf(normal));
  });
});
