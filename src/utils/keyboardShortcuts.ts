export function shouldIgnoreTextEntryShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || Boolean(target.closest('input, textarea, select'));
}

export function shouldIgnoreInteractiveShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return shouldIgnoreTextEntryShortcutTarget(target) || Boolean(target.closest('button, a, [role="button"], [role="link"]'));
}
