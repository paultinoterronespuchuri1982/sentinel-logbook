/**
 * Front-end logic for the Deck watch record and the compliance report.
 *
 * Responsibilities:
 *   - Load sample logs into the form (POST /api/sample-logs).
 *   - Collect the form into a ReportRequest and submit it
 *     (POST /api/generate-report).
 *   - Render the returned report sections, in the current language.
 *   - Show progress for the required fields.
 *
 * Text is translated with tr() from static/i18n.js. The report language
 * follows the language selector.
 */

// References to page elements, looked up once at load time.
const form = document.getElementById("logForm");              // Watch record form
const statusEl = document.getElementById("status");           // Status message line
const reportEl = document.getElementById("report");           // Report output area
const generateBtn = document.getElementById("generateBtn");   // Submit button
const loadSampleBtn = document.getElementById("loadSample");  // "Load sample" button
const languageSelect = document.getElementById("language");   // Language selector (UI and report)
const progressBar = document.getElementById("progressBar");   // Progress bar fill
const progressText = document.getElementById("progressText"); // Progress percentage

// The last report returned by the API, kept so it can be shown in the new language.
let lastReport = null;
let lastMeta = null;

/**
 * Show a status message below the form.
 *
 * @param {string} message - Text to display.
 * @param {"ok"|"err"} [kind] - Optional style: "ok" for success, "err" for errors.
 */
function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? " " + kind : "");
}

/**
 * Fill the form fields with a sample log.
 * Missing values are replaced with empty strings. Equipment status is
 * shown as pretty-printed JSON and maintenance tasks as one per line.
 *
 * @param {object} sample - Object returned by POST /api/sample-logs.
 */
function fillForm(sample) {
  // Each field uses "|| ''" so missing values do not become "undefined".
  document.getElementById("vessel_name").value = sample.vessel_name || "";
  document.getElementById("date").value = sample.date || "";
  document.getElementById("watch_start").value = sample.watch_start || "";
  document.getElementById("watch_end").value = sample.watch_end || "";
  document.getElementById("chief_officer").value = sample.chief_officer || "";
  // The field is numeric: keep only the number from samples such as "2450 tons".
  const fuel = parseFloat(sample.fuel_oil_quantity);
  document.getElementById("fuel_oil_quantity").value = isNaN(fuel) ? "" : fuel;
  document.getElementById("operational_summary").value = sample.operational_summary || "";
  // The equipment object is shown as indented JSON so it can be edited.
  document.getElementById("equipment_status").value = sample.equipment_status
    ? JSON.stringify(sample.equipment_status, null, 2)
    : "";
  // The list is joined with newlines, one task per line, to match the textarea.
  document.getElementById("maintenance_performed").value = (sample.maintenance_performed || []).join("\n");
  document.getElementById("incidents").value = sample.incidents || "";
  document.getElementById("weather_conditions").value = sample.weather_conditions || "";
  document.getElementById("remarks").value = sample.remarks || "";
}

// "Load sample" button: fetch sample data and fill the form with it.
loadSampleBtn.addEventListener("click", async () => {
  try {
    setStatus(tr("Loading sample logs…"));
    // Request the sample data from the server (no body is needed).
    const res = await fetch("/api/sample-logs", { method: "POST" });
    if (!res.ok) throw new Error(tr("Failed to load sample logs"));
    const sample = await res.json();
    fillForm(sample);
    updateProgress();
    setStatus(tr("Sample logs loaded."), "ok");
  } catch (err) {
    setStatus(err.message, "err");
  }
});

/**
 * Parse the equipment status textarea as JSON.
 * An empty field is treated as an empty object.
 *
 * @param {string} raw - Text from the equipment status textarea.
 * @returns {object} The parsed equipment status.
 * @throws {Error} If the text is not valid JSON.
 */
function parseEquipmentStatus(raw) {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(tr("Equipment Status must be valid JSON"));
  }
}

/**
 * Render the report sections into the report container.
 * Sections with empty values are skipped. Array values (such as the
 * compliance checklist) become check lists; other values become paragraphs.
 *
 * @param {object} report - The `report` object from the API response.
 */
function renderReport(report) {
  reportEl.innerHTML = "";

  const sections = [
    ["Executive summary", report.executive_summary],
    ["Equipment status", report.equipment_status],
    ["Incident analysis", report.incident_analysis],
    ["Maintenance review", report.maintenance_review],
    ["Compliance checklist", report.compliance_checklist],
    ["Recommendations", report.recommendations],
    ["Sign-off", report.sign_off_template],
  ];

  // Build the DOM with createElement and textContent, not innerHTML. The
  // report text comes from the model, so it is inserted as plain text to
  // prevent HTML or script injection.
  for (const [title, content] of sections) {
    if (content === undefined || content === null || content === "") continue;

    const card = document.createElement("article");
    card.className = "report-card";

    const heading = document.createElement("h3");
    heading.textContent = tr(title);
    card.appendChild(heading);

    if (Array.isArray(content)) {
      // Checklist items are shown as rows with an empty check box. The user
      // ticks them off during review; the model does not mark them as done.
      const list = document.createElement("ul");
      list.className = "checklist";
      for (const item of content) {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      }
      card.appendChild(list);
    } else {
      const p = document.createElement("p");
      p.textContent = content;
      card.appendChild(p);
    }

    reportEl.appendChild(card);
  }
}

/** Show the report again after a language change, without a new request. */
function refreshReport() {
  if (!lastReport) return;
  renderReport(lastReport);
  if (lastMeta) {
    const when = new Date(lastMeta.generated_at).toLocaleString(currentLang === "pt" ? "pt-BR" : "en-US");
    setStatus(tr("Report generated for ") + lastMeta.vessel_name + tr(" at ") + when, "ok");
  }
}

/**
 * Submit handler for the watch record.
 * Builds the request body from the form fields, calls the API, and
 * renders the report or shows the error. The button is disabled while
 * the request is in flight.
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // The form uses novalidate for custom styling, so run the browser's
  // required-field check here and show its messages.
  if (!form.reportValidity()) return;

  reportEl.innerHTML = "";

  // Validate the equipment JSON before sending anything. On error, show the
  // message and stop without calling the API.
  let equipment_status;
  try {
    equipment_status = parseEquipmentStatus(document.getElementById("equipment_status").value);
  } catch (err) {
    setStatus(err.message, "err");
    return;
  }

  // Request body matching the ReportRequest model in main.py.
  // Field names must match the OperationalLog model exactly.
  const payload = {
    logs: {
      date: document.getElementById("date").value,
      vessel_name: document.getElementById("vessel_name").value,
      watch_start: document.getElementById("watch_start").value,
      watch_end: document.getElementById("watch_end").value,
      chief_officer: document.getElementById("chief_officer").value,
      operational_summary: document.getElementById("operational_summary").value,
      equipment_status,
      incidents: document.getElementById("incidents").value,
      // One task per line becomes a list. Blank lines and spaces are removed.
      maintenance_performed: document
        .getElementById("maintenance_performed")
        .value.split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      fuel_oil_quantity: document.getElementById("fuel_oil_quantity").value,
      weather_conditions: document.getElementById("weather_conditions").value,
      remarks: document.getElementById("remarks").value,
    },
    language: languageSelect.value,
  };

  // Disable the button while the request runs to prevent duplicate submissions.
  generateBtn.disabled = true;
  setStatus(tr("Generating compliance report…"));

  try {
    // POST the JSON body. On error, the server sends { "detail": "..." }.
    const res = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Read the body even on error, because FastAPI sends error details as JSON.
    const data = await res.json();
    // A non-2xx status is an error. Use the server's message when it has one.
    if (!res.ok) throw new Error(data.detail || tr("Failed to generate report"));

    // Keep the report so it can be shown again in the other language.
    lastReport = data.report;
    lastMeta = { vessel_name: data.vessel_name, generated_at: data.generated_at };
    renderReport(data.report);
    refreshReport();
  } catch (err) {
    // Network failures and server errors both end here.
    setStatus(err.message, "err");
  } finally {
    // Runs on success and on error, so the button is always re-enabled.
    generateBtn.disabled = false;
  }
});

/* ---------- Progress meter ---------- */

/**
 * Update the progress bar from the required fields. A required field counts
 * as complete when it has a non-empty value.
 */
function updateProgress() {
  const required = form.querySelectorAll("[required]");
  const filled = Array.from(required).filter((el) => el.value.trim() !== "").length;
  const percent = required.length ? Math.round((filled / required.length) * 100) : 0;
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "%";
}

// Recalculate while the user types.
form.addEventListener("input", updateProgress);
updateProgress();

// Re-translate the report when the language changes.
document.addEventListener("langchange", refreshReport);
