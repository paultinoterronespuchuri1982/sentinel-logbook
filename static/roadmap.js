/**
 * Roadmap panel: shows what is available, what is a draft, what is planned,
 * and what is outside this software, so anyone using it can see what is
 * not implemented yet.
 *
 * All text is translated with tr() (static/i18n.js), so it follows the
 * language selector. Built with createElement and textContent only.
 *
 * Depends on the element IDs in templates/index.html: roadmapBtn,
 * roadmapSection, watchSection, logbookSection, progressWrap.
 */

(function () {
  const btn = document.getElementById("roadmapBtn");
  const section = document.getElementById("roadmapSection");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const progressWrap = document.getElementById("progressWrap");
  const sidebarItems = document.querySelectorAll(".logbook-list li[data-logbook]");

  // Status labels. Each is a key in PT (static/i18n.js).
  const STATUS = {
    available: "Available",
    draft: "Draft",
    planned: "Planned",
    outside: "Outside this software",
  };

  // Each item: status and English text (the key in static/i18n.js).
  // Optional note: another key in static/i18n.js.
  const ITEMS = [
    { status: "available", text: "Deck watch record and compliance report draft" },
    { status: "available", text: "Entries saved on this device, with reminders for due records" },
    { status: "available", text: "Voice dictation in Chrome, Edge or Safari" },
    { status: "available", text: "Optional local speech recognition (faster-whisper) on the server" },
    { status: "available", text: "English and Portuguese; day, dusk, night and red themes" },
    { status: "available", text: "Voice assistant with one microphone: it reads each empty field aloud and writes your answer",
      note: "Works with a Bluetooth headset connected to the device. Uses the browser's speech tools, so it needs Chrome, Edge or Safari." },
    { status: "available", text: "Statistics: records per week, reminders on time and watch hours, as charts from this device's records" },
    { status: "draft", text: "Field lists for 8 logbooks. Only the Oil Record Book has been checked against its source." },
    { status: "planned", text: "Free speech: say several fields in one sentence and the system fills them" },
    { status: "planned", text: "Assistant speech with a language model (paid service or local model)" },
    { status: "available", text: "Fuel consumption per day chart (fuel field is numeric, in tons)" },
    { status: "planned", text: "Emissions estimate from fuel (not an official CII or EU-MRV calculation)" },
    { status: "planned", text: "Weekly and periodic inspection reminders, asked aloud by the assistant" },
    { status: "planned", text: "Shared database and backups, usable from several devices" },
    { status: "planned", text: "Permanent history of changes, verifiable timestamps and electronic signature (ISO 21745)" },
    { status: "planned", text: "Login with roles: officer, master and inspector" },
    { status: "planned", text: "Automated tests and a container for deployment" },
    { status: "planned", text: "Offline work with synchronization" },
    { status: "planned", text: "Accessibility review (WCAG) and measurement of voice accuracy with marine terms" },
    { status: "outside", text: "Approval for official use by the flag state or a classification society. Only that authority can grant it." },
  ];

  function render() {
    section.innerHTML = "";

    const head = document.createElement("div");
    head.className = "card-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = tr("Roadmap: what is available and what is planned");
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = tr("This list is updated with each release. Nothing here is an approval by any maritime authority.");
    titleWrap.appendChild(title);
    titleWrap.appendChild(hint);
    head.appendChild(titleWrap);
    section.appendChild(head);

    const list = document.createElement("ul");
    list.className = "entries";
    ITEMS.forEach((item) => {
      const li = document.createElement("li");

      const label = document.createElement("strong");
      label.textContent = "[" + tr(STATUS[item.status]) + "] ";
      li.appendChild(label);

      li.appendChild(document.createTextNode(tr(item.text)));

      if (item.note) {
        const note = document.createElement("div");
        note.className = "muted";
        note.textContent = tr(item.note);
        li.appendChild(note);
      }
      list.appendChild(li);
    });
    section.appendChild(list);
  }

  function open() {
    render();
    section.hidden = false;
    const stats = document.getElementById("statsSection");
    if (stats) stats.hidden = true;
    watchSection.hidden = true;
    logbookSection.hidden = true;
    progressWrap.hidden = true;
    btn.setAttribute("aria-pressed", "true");
  }

  // Closing the roadmap from the button restores the logbook that was open.
  function close() {
    section.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    const active = document.querySelector(".logbook-list li.is-active");
    if (active) active.click();
  }

  btn.addEventListener("click", () => {
    if (section.hidden) open();
    else close();
  });

  // Choosing a logbook in the sidebar leaves the roadmap. logbook.js runs
  // first, so its section visibility is already set.
  sidebarItems.forEach((li) => {
    li.addEventListener("click", () => {
      section.hidden = true;
      btn.setAttribute("aria-pressed", "false");
    });
  });

  // logbook.js redraws on a language change and may show its sections again,
  // so hide them again while the roadmap is open.
  document.addEventListener("langchange", () => {
    if (!section.hidden) {
      watchSection.hidden = true;
      logbookSection.hidden = true;
      progressWrap.hidden = true;
      render();
    }
  });

  btn.setAttribute("aria-pressed", "false");
})();
