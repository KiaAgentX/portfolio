export function isMiniApp(): boolean {
  return Boolean(window.Telegram?.WebApp?.initData);
}
