/**
 * Voice assistant: one microphone for the form that is on screen.
 *
 * - Reads each empty field aloud, listens to the answer, writes it into the
 *   field and reads the value back. The user confirms ("sí"), rejects ("está
 *   mal", "no") so the field is cleared and asked again, or says a corrected value.
 * - Commands: stop / parar / terminar, next / siguiente / próximo, repeat / repetir.
 * - Dates, times and numbers can be said in words or digits (Spanish,
 *   Portuguese and English). Example: "veintiocho de octubre de dos mil veintiséis".
 * - Voice language is chosen with the selector in the top bar.
 * - Uses the browser's speech recognition and speech synthesis (Chrome, Edge
 *   or Safari). Sound goes to the device's current output, so a Bluetooth
 *   headset is used automatically.
 *
 * Texts are in static/voice-strings.js. Depends on Vessel-free storage only
 * through the form fields; it does not store anything itself.
 */

(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const TTS = window.speechSynthesis;

  const btn = document.getElementById("voiceBtn");
  const langSelect = document.getElementById("voiceLang");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const watchMessage = document.getElementById("watchMessage");
  const lbMessage = document.getElementById("lbMessage");

  const LANG_KEY = "voiceLang";
  const DEFAULT_LANG = "es-ES";
  const MAX_SILENT = 3;

  // Words are compared without accents and in lower case (see fold()).
  const STOP_WORDS = ["stop", "parar", "pare", "terminar", "terminei", "termine", "finalizar", "fin", "finish", "detener"];
  const SKIP_WORDS = ["next", "skip", "siguiente", "proximo", "pular", "pule", "saltar", "pasar", "seguinte"];
  const REPEAT_WORDS = ["repeat", "repetir", "repita", "repite", "repete", "de nuevo", "otra vez", "vuelva a decir"];
  const NO_WORDS = ["no", "nao", "mal", "equivocado", "equivocada", "incorrecto", "incorrecta", "incorreto", "errado", "errada", "error", "wrong"];
  const YES_WORDS = ["si", "yes", "sim", "correcto", "correcta", "correto", "bien", "ok", "okay", "acepto", "aceptar", "confirmo", "confirmar", "vale", "certo", "isso", "exato", "right"];

  const FILLER = ["de", "of", "do", "da", "del", "the"];
  const CONNECTORS = ["y", "e", "and"];
  const DECIMAL_WORDS = ["punto", "coma", "virgula", "ponto", "point", "dot"];

  // Nautical (ICAO) alphabet in Spanish, Portuguese and English, without accents.
  // "alfa bravo charlie" spells "ABC". Used to spell names and codes letter by letter.
  const NATO = {
    alfa: "A", alpha: "A", bravo: "B", charlie: "C", delta: "D", eco: "E", echo: "E",
    foxtrot: "F", golf: "G", hotel: "H", india: "I", juliett: "J", juliet: "J", juliete: "J",
    kilo: "K", lima: "L", mike: "M", november: "N", oscar: "O", papa: "P", quebec: "Q",
    romeo: "R", sierra: "S", tango: "T", uniforme: "U", uniform: "U", victor: "V",
    whisky: "W", whiskey: "W", "x-ray": "X", yankee: "Y", zulu: "Z",
  };

  const MONTHS = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8,
    septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
    janeiro: 1, fevereiro: 2, marco: 3, maio: 5, junho: 6, julho: 7, setembro: 9,
    outubro: 10, novembro: 11, dezembro: 12,
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
    may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8, september: 9,
    sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11, december: 12, dec: 12,
  };

  // Number words in Spanish, Portuguese and English, without accents.
  const NUM = (function () {
    const n = {};
    const add = (words, value) => words.forEach((w) => { n[w] = value; });
    add(["cero", "zero"], 0);
    add(["un", "uno", "una", "um", "uma", "one"], 1);
    add(["dos", "dois", "two"], 2);
    add(["tres", "three"], 3);
    add(["cuatro", "quatro", "four"], 4);
    add(["cinco", "five"], 5);
    add(["seis", "six"], 6);
    add(["siete", "sete", "seven"], 7);
    add(["ocho", "oito", "eight"], 8);
    add(["nueve", "nove", "nine"], 9);
    add(["diez", "dez", "ten"], 10);
    add(["once", "onze", "eleven"], 11);
    add(["doce", "doze", "twelve"], 12);
    add(["trece", "treze", "thirteen"], 13);
    add(["catorce", "catorze", "fourteen"], 14);
    add(["quince", "quinze", "fifteen"], 15);
    add(["dieciseis", "dezesseis", "sixteen"], 16);
    add(["diecisiete", "dezessete", "seventeen"], 17);
    add(["dieciocho", "dezoito", "eighteen"], 18);
    add(["diecinueve", "dezenove", "nineteen"], 19);
    add(["veinte", "vinte", "twenty"], 20);
    add(["treinta", "trinta", "thirty"], 30);
    add(["cuarenta", "quarenta", "forty"], 40);
    add(["cincuenta", "cinquenta", "fifty"], 50);
    add(["sesenta", "sessenta", "sixty"], 60);
    add(["setenta", "seventy"], 70);
    add(["ochenta", "oitenta", "eighty"], 80);
    add(["noventa", "ninety"], 90);
    // "veintiocho", "veintidos" ... (Spanish compounds of 21 to 29)
    [["uno", 1], ["dos", 2], ["tres", 3], ["seis", 6], ["siete", 7], ["ocho", 8], ["nueve", 9]]
      .forEach(([w, v]) => { n["veinti" + w] = 20 + v; });
    add(["media", "meia"], 30);
    return n;
  })();

  // Lower case, no accents, single spaces. "sí" becomes "si", "não" becomes "nao".
  function fold(text) {
    return String(text).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  }

  function containsWord(text, list) {
    const padded = " " + fold(text) + " ";
    return list.some((w) => padded.includes(" " + fold(w) + " "));
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  // Value of a list of words or digits: "dos mil veintiseis" -> 2026, "veintiocho" -> 28.
  function wordsValue(tokens) {
    let value = 0;
    let chunk = 0;
    let any = false;
    tokens.forEach((t) => {
      if (/^\d+$/.test(t)) { chunk += Number(t); any = true; }
      else if (t === "mil" || t === "thousand") { chunk = (chunk || 1) * 1000; value += chunk; chunk = 0; any = true; }
      else if (NUM[t] !== undefined) { chunk += NUM[t]; any = true; }
    });
    return any ? value + chunk : null;
  }

  function toHM(h, m) {
    if (h === null || m === null || h > 23 || m > 59) return null;
    return pad(h) + ":" + pad(m);
  }

  function parseTime(text) {
    const f = fold(text)
      .replace(/(\d)h(\d)/g, "$1 $2")
      .replace(/:/g, " ")
      .replace(/\b(horas?|hours?|hour|h|am|pm)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (/\d/.test(f)) {
      const n = f.match(/\d+/g);
      return toHM(Number(n[0]), n[1] !== undefined ? Number(n[1]) : 0);
    }

    // "ocho y treinta" -> 8:30. A connector separates hour and minutes.
    const tokens = f.split(" ").filter(Boolean);
    const groups = [[]];
    tokens.forEach((t) => {
      if (CONNECTORS.includes(t)) groups.push([]);
      else groups[groups.length - 1].push(t);
    });
    const values = groups.filter((g) => g.length).map((g) => wordsValue(g)).filter((v) => v !== null);

    if (values.length >= 2) return toHM(values[0], values[1]);
    if (values.length === 1) {
      // "ocho treinta" with no connector: split two words into hour and minutes.
      if (tokens.length === 2 && values[0] > 23) return toHM(wordsValue([tokens[0]]), wordsValue([tokens[1]]));
      return toHM(values[0], 0);
    }
    return null;
  }

  function makeDate(d, m, y) {
    if (!(d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2000 && y <= 2100)) return null;
    return y + "-" + pad(m) + "-" + pad(d);
  }

  function todayKey() {
    const now = new Date();
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  function parseDate(text) {
    const f = fold(text).replace(/,/g, " ").replace(/\s+/g, " ").trim();
    if (["hoy", "hoje", "today"].includes(f)) return todayKey();

    // Digits: 28/10/2026, 28-10-2026, 28 10 2026
    const digits = f.match(/(\d{1,2})\D+(\d{1,2})\D+(\d{4}|\d{2})(?!\d)/);
    if (digits) {
      const y = Number(digits[3]);
      return makeDate(Number(digits[1]), Number(digits[2]), y < 100 ? y + 2000 : y);
    }

    // Words: "veintiocho de octubre de dos mil veintiseis"
    const tokens = f.split(" ").filter((t) => t && !FILLER.includes(t));
    const mi = tokens.findIndex((t) => MONTHS[t] !== undefined);
    if (mi < 0) return null;
    const month = MONTHS[tokens[mi]];
    let dayTokens = tokens.slice(0, mi);
    let yearTokens = tokens.slice(mi + 1);
    // English order: "October 28 2026"
    if (!dayTokens.length && yearTokens.length) {
      dayTokens = yearTokens.slice(0, 1);
      yearTokens = yearTokens.slice(1);
    }
    const day = wordsValue(dayTokens);
    const year = yearTokens.length ? wordsValue(yearTokens) : new Date().getFullYear();
    if (day === null || year === null) return null;
    return makeDate(day, month, year < 100 ? year + 2000 : year);
  }

  function parseNumber(text) {
    const f = fold(text).replace(",", ".");
    const d = f.match(/-?\d+(?:\.\d+)?/);
    if (d) return d[0];

    // "dos punto cinco" -> 2.5
    const tokens = f.split(" ").filter(Boolean);
    const at = tokens.findIndex((t) => DECIMAL_WORDS.includes(t));
    if (at >= 0) {
      const whole = wordsValue(tokens.slice(0, at));
      const decimals = tokens.slice(at + 1).map((t) => wordsValue([t]));
      if (whole === null || decimals.some((v) => v === null) || !decimals.length) return null;
      return whole + "." + decimals.join("");
    }

    const v = wordsValue(tokens);
    return v === null ? null : String(v);
  }

  // Letters spelled with the nautical alphabet: "alfa bravo" -> "AB". Null if fewer than two words.
  function spelledValue(text) {
    const tokens = fold(text).replace(/x ray/g, "x-ray").split(" ").filter(Boolean);
    const letters = tokens.filter((t) => NATO[t] !== undefined);
    if (letters.length < 2) return null;
    return letters.map((t) => NATO[t]).join("");
  }

  // Returns the value for the field, or null if the answer does not fit it.
  function valueFor(input, answer) {
    if (input.type === "time") return parseTime(answer);
    if (input.type === "date") return parseDate(answer);
    if (input.type === "number") return parseNumber(answer);
    return spelledValue(answer) || answer;
  }

  // Command for an answer to a question: stop, next, repeat, or null.
  function commandOf(answer) {
    const a = fold(answer);
    if (STOP_WORDS.includes(a)) return "stop";
    if (SKIP_WORDS.includes(a)) return "next";
    if (REPEAT_WORDS.includes(a)) return "repeat";
    return null;
  }

  // Reply to a read-back value: yes, no, stop, next, or a new value ("value").
  function classify(reply) {
    if (containsWord(reply, NO_WORDS)) return "no";
    if (containsWord(reply, YES_WORDS)) return "yes";
    const c = commandOf(reply);
    if (c === "repeat") return "no";
    if (c) return c;
    return "value";
  }

  // ----- Language -----

  function voiceLang() {
    const v = langSelect ? langSelect.value : DEFAULT_LANG;
    return VOICE_STRINGS[v] ? v : DEFAULT_LANG;
  }

  function T() { return VOICE_STRINGS[voiceLang()]; }

  function fill(template, label, value) {
    return template.replace("{label}", label).replace("{value}", value);
  }

  // The field name spoken aloud, in the voice language.
  function fieldName(field) {
    if (voiceLang() === "es-ES" && FIELD_NAMES_ES[field.input.id]) return FIELD_NAMES_ES[field.input.id];
    return field.label;
  }

  function hintFor(input) {
    const t = T();
    if (input.type === "time") return t.hintTime;
    if (input.type === "date") return t.hintDate;
    return "";
  }

  // ----- Form access -----

  // The section currently shown: the Deck watch form or another logbook.
  function activeSection() {
    return watchSection.hidden ? logbookSection : watchSection;
  }

  function show(text, kind) {
    const el = activeSection() === watchSection ? watchMessage : lbMessage;
    el.textContent = text;
    el.className = "status" + (kind ? " " + kind : "");
  }

  // Fields of the visible form, in screen order, with their labels.
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

  // Write a value into a field and notify the page, so the progress meter and the draft update.
  function setValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ----- Speaking and listening -----

  function say(text) {
    return new Promise((resolve) => {
      if (!TTS) return resolve();
      TTS.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLang();
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
      r.lang = voiceLang();
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

  let recognition = null;

  // ----- The conversation -----

  async function run() {
    const todo = collectFields().filter((f) => !f.input.value.trim());
    if (!todo.length) {
      show(T().allFilled, "ok");
      await say(T().allFilled);
      return finish();
    }

    show(T().listening);
    await say(T().start);

    let i = 0;
    let silent = 0;
    // A value heard and read back, waiting for confirmation.
    let candidate = null;

    while (running && i < todo.length) {
      const field = todo[i];

      if (candidate === null) {
        field.input.focus();
        await say(fieldName(field) + ". " + hintFor(field.input));
        if (!running) break;

        const answer = await listen();
        if (!running) break;

        if (!answer) {
          silent++;
          if (silent >= MAX_SILENT) { await say(T().stopping); break; }
          await say(T().notHeard);
          continue;
        }
        silent = 0;
        show(T().heard + answer);

        const command = commandOf(answer);
        if (command === "stop") break;
        if (command === "next") { i++; continue; }
        if (command === "repeat") continue;

        const value = valueFor(field.input, answer);
        if (value === null) { await say(T().notUnderstood); continue; }
        candidate = value;
      }

      // Write the value, then ask for confirmation.
      setValue(field.input, candidate);
      show(fill(T().filled, fieldName(field), candidate), "ok");
      await say(fill(T().confirm, fieldName(field), candidate));
      if (!running) break;

      const reply = await listen();
      if (!running) break;
      if (reply) show(T().heard + reply);

      // No answer is taken as confirmation.
      const kind = reply ? classify(reply) : "yes";
      if (kind === "yes") { candidate = null; i++; continue; }
      if (kind === "stop") break;
      if (kind === "next") { candidate = null; i++; continue; }
      if (kind === "no") {
        // Rejected: clear the field so it can be spoken or typed again.
        candidate = null;
        setValue(field.input, "");
        field.input.focus();
        await say(T().rewrite);
        continue;
      }

      // A corrected value: read it back again before moving on.
      const corrected = valueFor(field.input, reply);
      if (corrected !== null) { candidate = corrected; continue; }

      candidate = null;
      setValue(field.input, "");
      field.input.focus();
      await say(T().notUnderstood);
    }

    finish();
  }

  function stopEverything() {
    running = false;
    if (recognition) { try { recognition.abort(); } catch (err) { /* already stopped */ } }
    if (TTS) TTS.cancel();
    setButton(false);
  }

  function finish() {
    stopEverything();
    show(T().finished);
  }

  let running = false;

  function start() {
    if (!SR || !TTS) {
      show(T().needs, "err");
      return;
    }
    running = true;
    setButton(true);
    run();
  }

  function stop() {
    stopEverything();
    show(T().stopped);
  }

  function setButton(on) {
    btn.classList.toggle("is-listening", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? tr("Stop assistant") : tr("Voice assistant");
  }

  btn.addEventListener("click", () => (running ? stop() : start()));

  if (langSelect) {
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (err) { /* storage blocked */ }
    if (saved && VOICE_STRINGS[saved]) langSelect.value = saved;
    langSelect.addEventListener("change", () => {
      try { localStorage.setItem(LANG_KEY, langSelect.value); } catch (err) { /* storage blocked */ }
    });
  }

  if (!SR || !TTS) {
    btn.disabled = true;
    btn.title = T().needs;
  }

  // Re-translate the button label when the interface language changes.
  document.addEventListener("langchange", () => setButton(running));
  setButton(false);
})();
