const script = `(() => {
  try {
    const storageKey = "theme";
    const legacyStorageKey = "tema";
    const root = document.documentElement;
    const stored = localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey);
    const theme = stored === "light" || stored === "dark" ? stored : "dark";

    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
    localStorage.setItem(storageKey, theme);

    if (localStorage.getItem(legacyStorageKey) !== null) {
      localStorage.removeItem(legacyStorageKey);
    }
  } catch (error) {
    /* ignore */
  }
})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
