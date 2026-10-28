/**
 * Appearance: theme (day, night, red night, follow system) and accent color.
 *
 * The choice is set as attributes on <html>:
 *   data-theme="day" | "night" | "red"
 *   data-accent="teal" | "indigo" | "emerald" | "amber" | "rose"
 *
 * "Red night" keeps a fixed red accent, because red light preserves
 * night vision on the bridge. The accent choice is disabled in that mode.
 */

(function () {
  const root = document.documentElement;
  const themeSelect = document.getElementById("themeSelect");
  const accentSelect = document.getElementById("accentSelect");
  const systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function read(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (err) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* storage blocked */ }
  }

  /** Map the saved theme to a real theme ("system" follows the OS). */
  function resolveTheme(choice) {
    if (choice === "system") return systemDark && systemDark.matches ? "night" : "day";
    return choice;
  }

  function apply() {
    const choice = themeSelect.value;
    const theme = resolveTheme(choice);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-accent", accentSelect.value);
    accentSelect.disabled = theme === "red";
    write("theme", choice);
    write("accent", accentSelect.value);
  }

  // Restore saved choices.
  themeSelect.value = read("theme", "system");
  accentSelect.value = read("accent", "teal");
  apply();

  themeSelect.addEventListener("change", apply);
  accentSelect.addEventListener("change", apply);

  // When following the system, switch if the OS setting changes.
  if (systemDark && systemDark.addEventListener) {
    systemDark.addEventListener("change", () => {
      if (themeSelect.value === "system") apply();
    });
  }
})();
