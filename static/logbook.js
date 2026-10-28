/**
 * Logbook navigation, entry forms, voice dictation and reminders.
 *
 * Depends on LOGBOOKS (static/logbooks.js), tr() (static/i18n.js) and the
 * element IDs in templates/index.html. The Deck logbook uses the watch form
 * in app.js; the other logbooks are rendered here from their definitions.
 *
 * Data is stored in the browser (localStorage) on this device only.
 */

(function () {
  // ----- Page elements -----
  const sidebarItems = document.querySelectorAll(".logbook-list li[data-logbook]");
  const titleEl = document.getElementById("logbookTitle");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const progressWrap = document.getElementById("progressWrap");
  const refEl = document.getElementById("lbRef");
  const checklistEl = document.getElementById("lbChecklist");
  const typeSelect = document.getElementById("lbType");
  const fieldsEl = document.getElementById("lbFields");
  const saveBtn = document.getElementById("lbSave");
  const messageEl = document.getElementById("lbMessage");
  const entriesEl = document.getElementById("lbEntries");
  const remindersEl = document.getElementById("reminders");
  const languageSelect = document.getElementById("language");
  const statusEl = document.getElementById("status");

  let current = "deck";

  // ----- Storage helpers (per device) -----
  function entriesKey(id) { return Vessel.key("logbook:" + id); }

  function loadEntries(id) {
    try { return JSON.parse(localStorage.getItem(entriesKey(id)) || "[]"); }
    catch (err) { return []; }
  }

  function saveEntries(id, list) {
    try { localStorage.setItem(entriesKey(id), JSON.stringify(list)); return true; }
    catch (err) { return false; }
  }

  function markDone(id, reminderId, ts) {
    try { localStorage.setItem(Vessel.key("done:" + id + ":" + reminderId), String(ts)); } catch (err) { /* storage blocked */ }
  }

  function lastDone(id, reminderId) {
    const value = localStorage.getItem(Vessel.key("done:" + id + ":" + reminderId));
    return value ? Number(value) : null;
  }

  // ----- Messages -----
  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = "status" + (kind ? " " + kind : "");
  }

  function formatDate(ts) {
    return new Date(ts).toLocaleString(currentLang === "pt" ? "pt-BR" : "en-US");
  }

  // ----- Sidebar and switching -----
  function select(id) {
    const def = LOGBOOKS[id];
    if (!def) return;
    current = id;

    sidebarItems.forEach((li) => {
      const on = li.dataset.logbook === id;
      li.classList.toggle("is-active", on);
      li.setAttribute("aria-current", on ? "true" : "false");
    });

    titleEl.textContent = tr(def.name);
    watchSection.hidden = !def.usesWatchForm;
    logbookSection.hidden = !!def.usesWatchForm;
    progressWrap.hidden = !def.usesWatchForm;

    if (!def.usesWatchForm) renderLogbook(def);
    messageEl.textContent = "";
    messageEl.className = "status";
    renderReminders();
  }

  sidebarItems.forEach((li) => {
    li.setAttribute("tabindex", "0");
    li.setAttribute("role", "button");
    li.addEventListener("click", () => select(li.dataset.logbook));
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(li.dataset.logbook);
      }
    });
  });

  // ----- Rendering a logbook -----
  function renderLogbook(def) {
    refEl.textContent = tr(def.ref);

    checklistEl.innerHTML = "";
    def.checklist.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = tr(item);
      checklistEl.appendChild(li);
    });

    const previous = typeSelect.value;
    typeSelect.innerHTML = "";
    def.types.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = tr(t.label);
      typeSelect.appendChild(option);
    });
    if (def.types.some((t) => t.id === previous)) typeSelect.value = previous;

    renderFields();
    renderEntries();
  }

  function currentType() {
    const def = LOGBOOKS[current];
    return def.types.find((t) => t.id === typeSelect.value) || def.types[0];
  }

  function renderFields() {
    const type = currentType();
    fieldsEl.innerHTML = "";
    if (!type) return;

    type.fields.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "field";

      const label = document.createElement("label");
      label.htmlFor = "lb-" + field.id;
      label.textContent = tr(field.label) + (field.required ? " *" : "");
      wrap.appendChild(label);

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 2;
      } else {
        input = document.createElement("input");
        input.type = field.type === "number" ? "number" : field.type;
        if (field.type === "number") input.step = "any";
      }
      input.id = "lb-" + field.id;
      input.name = field.id;
      wrap.appendChild(input);
      fieldsEl.appendChild(wrap);
    });
  }

  // Voice input for these fields: the single "Voice assistant" button (voice-assistant.js).

  // ----- Saving an entry -----
  saveBtn.addEventListener("click", () => {
    const def = LOGBOOKS[current];
    const type = currentType();
    if (!type) return;

    const values = {};
    const missing = [];
    type.fields.forEach((field) => {
      const input = document.getElementById("lb-" + field.id);
      const value = input ? input.value.trim() : "";
      values[field.id] = value;
      if (field.required && value === "") missing.push(tr(field.label));
    });

    if (missing.length) {
      showMessage(tr("Fill in: ") + missing.join(", "), "err");
      return;
    }

    const ts = Date.now();
    const list = loadEntries(current);
    // Stored with the type id, not the label, so the record does not depend on the language.
    list.unshift({ ts: ts, type: type.id, values: values });

    if (!saveEntries(current, list)) {
      showMessage(tr("This browser blocked storage, so the entry was not saved."), "err");
      return;
    }

    // Any reminder linked to this entry type counts as done now.
    def.reminders.forEach((r) => {
      if (r.typeId === type.id) markDone(current, r.id, ts);
    });

    type.fields.forEach((field) => {
      const input = document.getElementById("lb-" + field.id);
      if (input) input.value = "";
    });

    showMessage(tr("Entry saved on this device."), "ok");
    renderEntries();
    renderReminders();
  });

  // ----- Recent entries -----
  function renderEntries() {
    entriesEl.innerHTML = "";
    const def = LOGBOOKS[current];
    const list = loadEntries(current).slice(0, 10);

    if (!list.length) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = tr("No entries yet.");
      entriesEl.appendChild(li);
      return;
    }

    list.forEach((entry) => {
      const type = def.types.find((t) => t.id === entry.type);
      const li = document.createElement("li");
      const head = document.createElement("strong");
      head.textContent = formatDate(entry.ts) + " · " + (type ? tr(type.label) : entry.type);
      li.appendChild(head);

      const summary = Object.values(entry.values).filter(Boolean).join(" | ");
      const body = document.createElement("div");
      body.className = "muted";
      body.textContent = summary.length > 140 ? summary.slice(0, 137) + "…" : summary;
      li.appendChild(body);
      entriesEl.appendChild(li);
    });
  }

  // ----- Reminders: what is due and when -----
  function renderReminders() {
    const def = LOGBOOKS[current];
    remindersEl.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = tr("Reminders");
    remindersEl.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "reminder-list";
    const now = Date.now();

    def.reminders.forEach((r) => {
      const li = document.createElement("li");
      const title = document.createElement("div");
      title.className = "reminder-title";
      title.textContent = tr(r.label);
      li.appendChild(title);

      const status = document.createElement("div");
      status.className = "reminder-status";

      if (r.everyDays == null) {
        status.textContent = tr("Record when it happens.");
      } else {
        const last = lastDone(current, r.id);
        if (!last) {
          status.textContent = tr("Not recorded yet.");
          li.classList.add("due");
        } else {
          const next = last + r.everyDays * 86400000;
          if (now > next) {
            status.textContent = tr("Overdue. Last recorded ") + formatDate(last) + ".";
            li.classList.add("due");
          } else {
            status.textContent = tr("Next by ") + formatDate(next) + ".";
            li.classList.add("ok");
          }
        }
      }

      li.appendChild(status);
      list.appendChild(li);
    });

    remindersEl.appendChild(list);
  }

  // Deck: a watch record that produces a report counts as signing the deck log.
  const observer = new MutationObserver(() => {
    if (current === "deck" && statusEl.classList.contains("ok")) {
      markDone("deck", "watch-end", Date.now());
      renderReminders();
    }
  });
  observer.observe(statusEl, { attributes: true, attributeFilter: ["class"] });

  // Re-draw the current logbook when the language changes.
  document.addEventListener("langchange", () => {
    const keepType = typeSelect.value;
    select(current);
    if (keepType && LOGBOOKS[current].types.some((t) => t.id === keepType)) typeSelect.value = keepType;
    renderFields();
  });

  // A watch record saved from the Deck form updates the reminders.
  document.addEventListener("entrysaved", renderReminders);

  // Start on the Deck logbook.
  select("deck");
})();
