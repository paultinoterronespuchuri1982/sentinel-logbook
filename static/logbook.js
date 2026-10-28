/**
 * Logbook navigation, entry forms, voice dictation and reminders.
 *
 * Depends on LOGBOOKS (static/logbooks.js) and on the element IDs in
 * templates/index.html. The Deck logbook uses the watch form in app.js;
 * the other logbooks are rendered here from their definitions.
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
  function entriesKey(id) { return "logbook:" + id; }

  function loadEntries(id) {
    try { return JSON.parse(localStorage.getItem(entriesKey(id)) || "[]"); }
    catch (err) { return []; }
  }

  function saveEntries(id, list) {
    try { localStorage.setItem(entriesKey(id), JSON.stringify(list)); return true; }
    catch (err) { return false; }
  }

  function markDone(id, reminderId, ts) {
    try { localStorage.setItem("done:" + id + ":" + reminderId, String(ts)); } catch (err) { /* storage blocked */ }
  }

  function lastDone(id, reminderId) {
    const value = localStorage.getItem("done:" + id + ":" + reminderId);
    return value ? Number(value) : null;
  }

  // ----- Messages -----
  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = "status" + (kind ? " " + kind : "");
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

    titleEl.textContent = def.name;
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
    refEl.textContent = def.ref;

    checklistEl.innerHTML = "";
    def.checklist.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      checklistEl.appendChild(li);
    });

    typeSelect.innerHTML = "";
    def.types.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.id;
      option.textContent = t.label;
      typeSelect.appendChild(option);
    });

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
      label.textContent = field.label + (field.required ? " *" : "");
      wrap.appendChild(label);

      const row = document.createElement("div");
      row.className = "input-row";

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
      input.dataset.required = field.required ? "true" : "false";
      input.dataset.label = field.label;
      row.appendChild(input);

      // Voice button: dictates into this field.
      if (speechSupported()) {
        const mic = document.createElement("button");
        mic.type = "button";
        mic.className = "mic";
        mic.title = "Dictate";
        mic.setAttribute("aria-label", "Dictate " + field.label);
        mic.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        mic.addEventListener("click", () => dictate(input, mic));
        row.appendChild(mic);
      }

      wrap.appendChild(row);
      fieldsEl.appendChild(wrap);
    });
  }

  // ----- Voice dictation (browser speech recognition) -----
  function speechSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function dictate(target, button) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showMessage("Voice input needs Chrome, Edge or Safari.", "err");
      return;
    }

    const recognition = new SR();
    recognition.lang = languageSelect.value === "pt" ? "pt-BR" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    button.classList.add("is-listening");
    showMessage("Listening… speak now.", "");

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      target.value = target.value ? target.value + " " + text : text;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      showMessage("Captured. Check the text before saving.", "ok");
    };

    recognition.onerror = (event) => {
      showMessage("Voice error: " + event.error + ". Check microphone permission.", "err");
    };

    recognition.onend = () => button.classList.remove("is-listening");

    try { recognition.start(); }
    catch (err) { showMessage("Could not start voice input.", "err"); button.classList.remove("is-listening"); }
  }

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
      if (field.required && value === "") missing.push(field.label);
    });

    if (missing.length) {
      showMessage("Fill in: " + missing.join(", "), "err");
      return;
    }

    const ts = Date.now();
    const list = loadEntries(current);
    list.unshift({ ts: ts, type: type.id, label: type.label, values: values });

    if (!saveEntries(current, list)) {
      showMessage("This browser blocked storage, so the entry was not saved.", "err");
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

    showMessage("Entry saved on this device.", "ok");
    renderEntries();
    renderReminders();
  });

  // ----- Recent entries -----
  function renderEntries() {
    entriesEl.innerHTML = "";
    const list = loadEntries(current).slice(0, 10);

    if (!list.length) {
      const li = document.createElement("li");
      li.className = "muted";
      li.textContent = "No entries yet.";
      entriesEl.appendChild(li);
      return;
    }

    list.forEach((entry) => {
      const li = document.createElement("li");
      const head = document.createElement("strong");
      head.textContent = new Date(entry.ts).toLocaleString() + " · " + entry.label;
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
  function formatDate(ts) { return new Date(ts).toLocaleString(); }

  function renderReminders() {
    const def = LOGBOOKS[current];
    remindersEl.innerHTML = "";

    const heading = document.createElement("h3");
    heading.textContent = "Reminders";
    remindersEl.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "reminder-list";
    const now = Date.now();

    def.reminders.forEach((r) => {
      const li = document.createElement("li");
      const title = document.createElement("div");
      title.className = "reminder-title";
      title.textContent = r.label;
      li.appendChild(title);

      const status = document.createElement("div");
      status.className = "reminder-status";

      if (r.everyDays == null) {
        status.textContent = "Record when it happens.";
      } else {
        const last = lastDone(current, r.id);
        if (!last) {
          status.textContent = "Not recorded yet.";
          li.classList.add("due");
        } else {
          const next = last + r.everyDays * 86400000;
          if (now > next) {
            status.textContent = "Overdue. Last recorded " + formatDate(last) + ".";
            li.classList.add("due");
          } else {
            status.textContent = "Next by " + formatDate(next) + ".";
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

  // Start on the Deck logbook.
  select("deck");
})();
