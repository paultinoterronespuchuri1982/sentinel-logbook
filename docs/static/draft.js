/**
 * Watch record: draft autosave, saving, and voice buttons.
 *
 * - The form is saved as a draft on this device while you type, so a
 *   refresh or a closed tab does not lose the work.
 * - "Save record" stores a dated copy in the Deck logbook on this device.
 * Voice input is handled by the single "Voice assistant" button
 * (static/voice-assistant.js).
 *
 * Depends on tr() (static/i18n.js).
 */

(function () {
  const form = document.getElementById("logForm");
  const saveBtn = document.getElementById("saveWatch");
  const messageEl = document.getElementById("watchMessage");

  // Keys are per vessel (static/vessel.js).
  const DRAFT_KEY = Vessel.key("draft:deck");
  const ENTRIES_KEY = Vessel.key("logbook:deck");

  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = "status" + (kind ? " " + kind : "");
  }

  /** Read every named field of the form into a plain object. */
  function readForm() {
    const values = {};
    form.querySelectorAll("input[name], textarea[name]").forEach((el) => {
      values[el.name] = el.value;
    });
    return values;
  }

  /** Put saved values back into the form. */
  function writeForm(values) {
    Object.keys(values).forEach((name) => {
      const el = form.querySelector('[name="' + name + '"]');
      if (el) el.value = values[name];
    });
    // Let app.js update the progress meter.
    form.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function saveDraft() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(readForm())); } catch (err) { /* storage blocked */ }
  }

  // Autosave, shortly after the last change.
  let timer = null;
  form.addEventListener("input", (e) => {
    // The form itself fires a synthetic input event after a restore; skip it.
    if (e.target === form) return;
    clearTimeout(timer);
    timer = setTimeout(saveDraft, 400);
  });

  // Restore the draft when the page opens.
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      writeForm(JSON.parse(raw));
      showMessage(tr("Draft restored."), "ok");
    }
  } catch (err) { /* ignore a damaged draft */ }

  // A new draft starts with the selected vessel's name.
  const vesselField = document.getElementById("vessel_name");
  if (vesselField && !vesselField.value) vesselField.value = Vessel.name();

  // Save the record as a dated entry.
  saveBtn.addEventListener("click", () => {
    if (!form.reportValidity()) return;

    const ts = Date.now();
    const values = readForm();
    let list = [];
    try { list = JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]"); } catch (err) { list = []; }
    list.unshift({ ts: ts, type: "watch", values: values });

    try {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(list));
      localStorage.setItem(Vessel.key("done:deck:watch-end"), String(ts));
    } catch (err) {
      showMessage(tr("This browser blocked storage, so the entry was not saved."), "err");
      return;
    }

    saveDraft();
    showMessage(tr("Record saved on this device."), "ok");
    document.dispatchEvent(new Event("entrysaved"));
  });

})();
