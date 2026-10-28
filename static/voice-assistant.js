/**
 * Voice assistant: one microphone for the form that is on screen.
 *
 * - Reads each empty field aloud (the field name), listens to the answer,
 *   writes it into the field and moves to the next one.
 * - Say "next" / "siguiente" to skip a field, "repeat" / "repetir" to hear
 *   the question again, "stop" / "parar" to finish early.
 * - Time fields accept "08:00", "8 30" or "8h30". Date fields accept
 *   "28/10/2026" or "today" / "hoje".
 * - Uses the browser's speech recognition and speech synthesis (Chrome, Edge
 *   or Safari). Sound goes to the device's current output, so a connected
 *   Bluetooth headset is used automatically.
 *
 * Works on the visible form: the watch form (Deck) or the entry form of
 * another logbook. All text is translated with tr() (static/i18n.js).
 */

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const TTS = window.speechSynthesis;

  const btn = document.getElementById("voiceBtn");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const watchMessage = document.getElementById("watchMessage");
  const lbMessage = document.getElementById("lbMessage");

  // Spoken commands, in English and Portuguese/Spanish.
  const SKIP_WORDS = ["next", "skip", "siguiente", "próximo", "proximo", "pular", "pule"];
  const REPEAT_WORDS = ["repeat", "repetir", "repita", "repete", "corrija", "corrige", "corregir", "corrigir"];
  const YES_WORDS = ["yes", "sí", "si", "sim", "correcto", "correto", "ok", "okay", "confirm", "confirmo", "confirmar"];
  const NO_WORDS = ["no", "não", "nao", "errado", "incorreto", "wrong"];
  const STOP_WORDS = ["stop", "parar", "pare", "terminar", "finish", "fim"];
  const MAX_SILENT = 3;

  let running = false;
  let recognition = null;

  const locale = () => (currentLang === "pt" ? "pt-BR" : "en-US");

  // The section currently shown: the Deck watch form or another logbook.
  function activeSection() {
    return watchSection.hidden ? logbookSection : watchSection;
  }

  function show(text, kind) {
    const el = activeSection() === watchSection ? watchMessage : lbMessage;
    el.textContent = text;
    el.className = "status" + (kind ? " " + kind : "");
  }

  // Fields of the visible form, in screen order, with their spoken names.
  function collectFields() {
    const section = activeSection();
    const fields = [];
    section.querySelectorAll("input, textarea").forEach((input) => {
      if (!input.id || input.id === "equipment_status") return; // JSON field: type it
      if (input.type === "hidden" || input.disabled) return;
      const labelEl = section.querySelector('label[for="' + input.id + '"]');
      const label = labelEl ? labelEl.textContent.replace(/\s*\*\s*$/, "").trim() : input.id;
      fields.push({ input: input, label: label });
    });
    return fields;
  }

  // ----- Speaking and listening -----

  function say(text) {
    return new Promise((resolve) => {
      if (!TTS) return resolve();
      TTS.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale();
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      TTS.speak(utterance);
    });
  }

  // Listen for one spoken answer. Resolves with the text, or null if nothing was heard.
  function listen() {
    return new Promise((resolve) => {
      let finished = false;
      const done = (value) => { if (!finished) { finished = true; resolve(value); } };

      const r = new SR();
      r.lang = locale();
      r.continuous = false;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (event) => done(event.results[0][0].transcript.trim());
      r.onerror = () => done(null);
      r.onend = () => done(null);
      recognition = r;
      try { r.start(); } catch (err) { done(null); }
    });
  }

  // ----- Understanding the answer -----

  function normalize(text) {
    return text.toLowerCase().replace(/[.!?,;]/g, "").trim();
  }

  function commandOf(answer) {
    const a = normalize(answer);
    if (STOP_WORDS.includes(a)) return "stop";
    if (SKIP_WORDS.includes(a)) return "next";
    if (REPEAT_WORDS.includes(a)) return "repeat";
    return null;
  }

  function isWord(text, list) {
    return list.includes(normalize(text));
  }

  // Returns the value for the field, or null if the answer does not fit it.
  function valueFor(input, answer) {
    if (input.type === "time") return parseTime(answer);
    if (input.type === "date") return parseDate(answer);
    if (input.type === "number") return parseNumber(answer);
    return answer;
  }

  // Keeps decimals ("2450.5", "2450,5"). normalize() would remove the dot, so it is not used here.
  function parseNumber(text) {
    const m = text.toLowerCase().replace(",", ".").match(/-?\d+(?:\.\d+)?/);
    return m ? m[0] : null;
  }

  function parseTime(text) {
    const m = normalize(text).match(/(\d{1,2})\s*(?:[:h]|horas?|hours?)?\s*(\d{2})?/);
    if (!m) return null;
    const hours = Number(m[1]);
    const minutes = m[2] ? Number(m[2]) : 0;
    if (hours > 23 || minutes > 59) return null;
    return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
  }

  function parseDate(text) {
    const a = normalize(text);
    if (a === "today" || a === "hoje" || a === "hoy") {
      const now = new Date();
      return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    }
    const m = a.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4})/);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return m[3] + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
  }

  function hintFor(input) {
    if (input.type === "time") return tr("Say the time, for example 8 30.");
    if (input.type === "date") return tr("Say the date, for example 28/10/2026.");
    return "";
  }

  // ----- The conversation -----

  async function run() {
    const todo = collectFields().filter((f) => !f.input.value.trim());
    if (!todo.length) {
      const msg = tr("All fields are filled. Check them and save.");
      show(msg, "ok");
      await say(msg);
      return finish();
    }

    show(tr("Assistant listening. Say stop to finish."));
    await say(tr("Let's fill the record. Say stop to finish, next to skip a field."));

    let i = 0;
    let silent = 0;
    while (running && i < todo.length) {
      const field = todo[i];
      await say(field.label + ". " + hintFor(field.input));
      if (!running) break;

      const answer = await listen();
      if (!running) break;

      if (!answer) {
        silent++;
        if (silent >= MAX_SILENT) {
          await say(tr("I did not hear anything. Stopping."));
          break;
        }
        await say(tr("I did not hear you. Please say it again."));
        continue;
      }
      silent = 0;
      // Show what was understood, so a wrong recognition is visible at once.
      show(tr("Heard: ") + answer);

      const command = commandOf(answer);
      if (command === "stop") break;
      if (command === "next") { i++; continue; }
      if (command === "repeat") continue;

      const value = valueFor(field.input, answer);
      if (value === null) {
        await say(tr("I did not understand. Say it again."));
        continue;
      }

      // Fill the field, then read it back and ask for confirmation before moving on.
      setValue(field.input, value);
      show(tr("Filled: ") + field.label + " = " + value, "ok");
      await say(field.label + ": " + value + ". " + tr("Say yes to confirm, or say the correct value."));
      if (!running) break;

      const reply = await listen();
      if (!running) break;
      if (reply) show(tr("Heard: ") + reply);

      if (!reply || isWord(reply, YES_WORDS)) { i++; continue; }

      if (isWord(reply, NO_WORDS)) {
        setValue(field.input, "");
        continue; // ask the same field again
      }

      // A spoken value replaces the one read back.
      const corrected = valueFor(field.input, reply);
      if (corrected !== null) {
        setValue(field.input, corrected);
        show(tr("Filled: ") + field.label + " = " + corrected, "ok");
        i++;
        continue;
      }

      setValue(field.input, "");
      await say(tr("I did not understand. Say it again."));
    }

    finish();
  }

  // Write a value into a field and notify the page, so the progress meter and the draft update.
  function setValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function stopEverything() {
    running = false;
    if (recognition) { try { recognition.abort(); } catch (err) { /* already stopped */ } }
    if (TTS) TTS.cancel();
    setButton(false);
  }

  function finish() {
    stopEverything();
    show(tr("Assistant finished. Check the fields before saving."));
  }

  function start() {
    if (!SR || !TTS) {
      show(tr("The voice assistant needs Chrome, Edge or Safari."), "err");
      return;
    }
    running = true;
    setButton(true);
    run();
  }

  function stop() {
    stopEverything();
    show(tr("Assistant stopped."));
  }

  function setButton(on) {
    btn.classList.toggle("is-listening", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? tr("Stop assistant") : tr("Voice assistant");
  }

  btn.addEventListener("click", () => (running ? stop() : start()));

  if (!SR || !TTS) {
    btn.disabled = true;
    btn.title = tr("Needs Chrome, Edge or Safari.");
  }

  // Re-translate the button label when the language changes.
  document.addEventListener("langchange", () => setButton(running));
  setButton(false);
})();
