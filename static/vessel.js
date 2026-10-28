/**
 * Vessel selector: five vessels, Bravante 1 to Bravante 5.
 *
 * Each vessel has its own records, drafts and reminder marks on this device.
 * Storage keys start with the vessel id, for example "v1/logbook:deck".
 * Changing vessel reloads the page, so every part reads the new vessel's data.
 * Records saved before vessels existed are moved to Bravante 1 once.
 *
 * Loaded before logbook.js, draft.js and stats.js, which call Vessel.key().
 */

const Vessel = (function () {
  const LIST = [1, 2, 3, 4, 5].map((n) => ({ id: "v" + n, name: "Bravante " + n }));
  const STORE = "vessel";
  const MIGRATED = "vessel:migrated";

  const SHIP_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 15h18l-2.5 4.5h-13z M6 15V9h12v6 M9 9V5h6v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

  function currentId() {
    let id = null;
    try { id = localStorage.getItem(STORE); } catch (err) { /* storage blocked */ }
    return LIST.some((v) => v.id === id) ? id : "v1";
  }

  function current() {
    return LIST.find((v) => v.id === currentId());
  }

  // Key for this vessel, for example key("logbook:deck") -> "v1/logbook:deck".
  function key(k) {
    return currentId() + "/" + k;
  }

  function select(id) {
    try { localStorage.setItem(STORE, id); } catch (err) { return; }
    // Reload so the form, the drafts and the statistics read the new vessel.
    location.reload();
  }

  // One-time move of records saved before vessels existed, into Bravante 1.
  function migrate() {
    try {
      if (localStorage.getItem(MIGRATED)) return;
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (/^(logbook|done|draft):/.test(k)) keys.push(k);
      }
      keys.forEach((k) => {
        localStorage.setItem("v1/" + k, localStorage.getItem(k));
        localStorage.removeItem(k);
      });
      localStorage.setItem(MIGRATED, "1");
    } catch (err) { /* storage blocked */ }
  }

  // Build the picker in the sidebar and show the vessel name in the title bar.
  function wire() {
    const crumb = document.getElementById("vesselCrumb");
    if (crumb) crumb.textContent = current().name;

    const picker = document.getElementById("vesselPicker");
    if (!picker) return;
    picker.innerHTML = "";
    LIST.forEach((v, index) => {
      const active = v.id === currentId();
      const b = document.createElement("button");
      b.type = "button";
      b.className = "icon-btn" + (active ? " is-active" : "");
      b.title = v.name;
      b.setAttribute("aria-label", v.name);
      b.setAttribute("aria-pressed", active ? "true" : "false");
      // SHIP_SVG is a constant in this file; the number is inserted as text.
      b.innerHTML = SHIP_SVG;
      const num = document.createElement("span");
      num.textContent = String(index + 1);
      b.appendChild(num);
      b.addEventListener("click", () => { if (!active) select(v.id); });
      picker.appendChild(b);
    });
  }

  migrate();
  wire();

  return {
    key: key,
    id: currentId,
    name: () => current().name,
    list: LIST,
  };
})();
