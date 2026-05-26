export function getPrimaryModifierLabel() {
  if (typeof navigator === 'undefined') {
    return 'Ctrl';
  }

  const safeNavigator = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };

  const platform = safeNavigator.userAgentData?.platform ?? navigator.platform ?? navigator.userAgent;
  return /Mac|iPhone|iPad|iPod/i.test(platform) ? 'Cmd' : 'Ctrl';
}
