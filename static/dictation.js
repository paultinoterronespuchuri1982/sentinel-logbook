/**
 * Voice dictation for text fields.
 *
 * - Continuous: keeps listening until the microphone button is pressed again.
 * - Live text: words appear while you speak (interim results).
 * - Mixed input: you can type in the same field; typed text is kept and
 *   dictated text is added after it.
 * - Any field inside the watch form (#logForm) gets a microphone button.
 *
 * Uses the browser's speech recognition (Chrome, Edge or Safari).
 */

const Dictation = (function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const controllers = new WeakMap();

  const MIC_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function supported() { return !!SR; }

  function langCode() {
    const select = document.getElementById("language");
    return select && select.value === "pt" ? "pt-BR" : "en-US";
  }

  /** Join two pieces of text with one space between them. */
  function join(a, b) {
    if (!a) return b || "";
    if (!b) return a;
    return a.replace(/\s+$/, "") + " " + b.replace(/^\s+/, "");
  }

  function controllerFor(input, button, notify) {
    if (controllers.has(input)) return controllers.get(input);

    let recognition = null;
    let active = false;
    let committed = "";   // text in the field before this dictation session
    let finalText = "";   // confirmed dictated text in this session

    // Text typed by the person becomes the new base for dictation.
    input.addEventListener("input", (e) => {
      if (e.isTrusted) {
        committed = input.value;
        finalText = "";
      }
    });

    function render(interim) {
      input.value = join(join(committed, finalText), interim || "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function setListening(on) {
      button.classList.toggle("is-listening", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    }

    function begin() {
      recognition = new SR();
      recognition.lang = langCode();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) finalText = join(finalText, text);
          else interim = text;
        }
        render(interim);
      };

      recognition.onerror = (event) => {
        // "no-speech" is normal silence; keep listening.
        if (event.error === "no-speech") return;
        active = false;
        setListening(false);
        if (notify) {
          const message = event.error === "not-allowed" || event.error === "service-not-allowed"
            ? tr("Microphone permission denied. Allow Chrome to use the microphone in System Settings.")
            : tr("Voice error: ") + event.error;
          notify(message, "err");
        }
      };

      recognition.onend = () => {
        // The browser stops after some silence. Restart while the user still wants dictation.
        committed = input.value;
        finalText = "";
        if (active) {
          try { recognition.start(); }
          catch (err) { active = false; setListening(false); }
        } else {
          setListening(false);
        }
      };

      try {
        recognition.start();
      } catch (err) {
        active = false;
        setListening(false);
        if (notify) notify(tr("Could not start voice input."), "err");
      }
    }

    function start() {
      if (!SR) {
        if (notify) notify(tr("Voice input needs Chrome, Edge or Safari."), "err");
        return;
      }
      active = true;
      committed = input.value;
      finalText = "";
      setListening(true);
      if (notify) notify(tr("Listening… speak now."), "");
      begin();
    }

    function stop() {
      active = false;
      if (recognition) {
        try { recognition.stop(); } catch (err) { /* already stopped */ }
      }
      setListening(false);
      committed = input.value;
      finalText = "";
      if (notify) notify(tr("Recording stopped."), "");
    }

    const controller = {
      toggle() { active ? stop() : start(); },
    };
    controllers.set(input, controller);
    return controller;
  }

  /**
   * Start or stop dictation for a field. The microphone button is updated
   * to show the listening state.
   */
  function toggleFor(input, button, notify) {
    controllerFor(input, button, notify).toggle();
  }

  /** Add a microphone button to every text field in the watch form. */
  function addToWatchForm(notify) {
    const form = document.getElementById("logForm");
    if (!form || !supported()) return;

    form.querySelectorAll("input:not([type=date]):not([type=time]), textarea").forEach((input) => {
      if (input.closest(".input-row")) return;

      const row = document.createElement("div");
      row.className = "input-row";
      input.parentNode.insertBefore(row, input);
      row.appendChild(input);

      const mic = document.createElement("button");
      mic.type = "button";
      mic.className = "mic";
      mic.title = tr("Dictate");
      mic.setAttribute("aria-label", tr("Dictate") + " " + input.id);
      mic.setAttribute("aria-pressed", "false");
      mic.innerHTML = MIC_SVG;
      mic.addEventListener("click", () => toggleFor(input, mic, notify));
      row.appendChild(mic);
    });
  }

  return { supported, toggleFor, addToWatchForm };
})();
