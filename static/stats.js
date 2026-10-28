/**
 * Statistics panel: charts built from the records saved on this device.
 *
 * - Summary cards: total records, records this week, reminders on time,
 *   watch hours in the last 14 days.
 * - Records per week, by logbook (stacked bars, last 8 weeks).
 * - Reminders by logbook: on time, overdue or not recorded.
 * - Watch hours per day from the Deck watch records (last 14 days).
 *
 * Reads localStorage keys "logbook:<id>" and "done:<id>:<reminderId>".
 * Uses Chart.js (loaded in templates/index.html). All text is translated with tr().
 * Depends on LOGBOOKS (static/logbooks.js) and currentLang (static/i18n.js).
 */

(function () {
  // The statistics icon in the left sidebar is the only way to open this panel.
  const btn = document.getElementById("sidebarStats");
  const section = document.getElementById("statsSection");
  const roadmapSection = document.getElementById("roadmapSection");
  const watchSection = document.getElementById("watchSection");
  const logbookSection = document.getElementById("logbookSection");
  const progressWrap = document.getElementById("progressWrap");
  const themeSelect = document.getElementById("themeSelect");
  const sidebarItems = document.querySelectorAll(".logbook-list li[data-logbook]");

  const DAY = 86400000;
  const WEEKS = 8;
  const DAYS = 14;
  const COLORS = ["#2f7d8c", "#5b6ee1", "#2e9d6b", "#d9a441", "#9b59b6", "#e67e22", "#16a085", "#c0392b"];
  const ON_TIME = "#2e9d6b";
  const OVERDUE = "#d9534f";
  const NOT_RECORDED = "#8a8f98";

  let charts = [];

  // ----- Reading the data -----

  function loadEntries(id) {
    try { return JSON.parse(localStorage.getItem(Vessel.key("logbook:" + id)) || "[]"); }
    catch (err) { return []; }
  }

  function lastDone(id, reminderId) {
    const value = localStorage.getItem(Vessel.key("done:" + id + ":" + reminderId));
    return value ? Number(value) : null;
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  function dateKey(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  // Monday of the week that contains the given date (local time).
  function mondayOf(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  // Minutes between "HH:MM" values, crossing midnight if needed.
  function watchMinutes(start, end) {
    const s = /^(\d{1,2}):(\d{2})$/.exec(start || "");
    const e = /^(\d{1,2}):(\d{2})$/.exec(end || "");
    if (!s || !e) return 0;
    const diff = (Number(e[1]) * 60 + Number(e[2])) - (Number(s[1]) * 60 + Number(s[2]));
    return diff < 0 ? diff + 1440 : diff;
  }

  function locale() { return currentLocale(); }

  function shortDate(d) {
    return d.toLocaleDateString(locale(), { day: "2-digit", month: "2-digit" });
  }

  function compute() {
    const now = Date.now();
    const thisMonday = mondayOf(now);

    // Last WEEKS weeks, oldest first.
    const weeks = [];
    for (let i = WEEKS - 1; i >= 0; i--) {
      const d = new Date(thisMonday);
      d.setDate(d.getDate() - 7 * i);
      weeks.push(d);
    }
    const weekKeys = weeks.map(dateKey);

    // Last DAYS days, oldest first.
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const dayKeys = days.map(dateKey);

    const ids = Object.keys(LOGBOOKS);
    const perLogbook = {};
    let total = 0;
    let thisWeek = 0;
    let lastWeek = 0;
    const hoursByDay = {};
    const fuelByDay = {};
    dayKeys.forEach((k) => { hoursByDay[k] = 0; fuelByDay[k] = 0; });

    ids.forEach((id) => {
      const entries = loadEntries(id);
      const weekCounts = weekKeys.map(() => 0);
      entries.forEach((entry) => {
        total++;
        const weekKey = dateKey(mondayOf(entry.ts));
        const idx = weekKeys.indexOf(weekKey);
        if (idx >= 0) weekCounts[idx]++;
        if (weekKey === weekKeys[weekKeys.length - 1]) thisWeek++;
        if (weekKey === weekKeys[weekKeys.length - 2]) lastWeek++;

        if (id === "deck" && entry.values && entry.values.date && hoursByDay[entry.values.date] !== undefined) {
          hoursByDay[entry.values.date] += watchMinutes(entry.values.watch_start, entry.values.watch_end) / 60;
          // Older records may hold text such as "2450 tons"; parseFloat reads the number.
          const fuel = parseFloat(entry.values.fuel_oil_quantity);
          if (!isNaN(fuel)) fuelByDay[entry.values.date] += fuel;
        }
      });
      perLogbook[id] = { weeks: weekCounts, total: entries.length };
    });

    // Reminders: on time, overdue or not recorded.
    const reminderRows = [];
    // Reminders that need attention now: overdue or never recorded.
    const attention = [];
    let onTime = 0;
    let overdue = 0;
    let notRecorded = 0;
    ids.forEach((id) => {
      const def = LOGBOOKS[id];
      const row = { id: id, onTime: 0, overdue: 0, notRecorded: 0 };
      def.reminders.forEach((r) => {
        if (r.everyDays == null) return;
        const last = lastDone(id, r.id);
        if (!last) {
          row.notRecorded++; notRecorded++;
          attention.push({ id: id, label: r.label, overdue: false });
        } else if (now <= last + r.everyDays * DAY) {
          row.onTime++; onTime++;
        } else {
          row.overdue++; overdue++;
          attention.push({ id: id, label: r.label, overdue: true });
        }
      });
      if (row.onTime + row.overdue + row.notRecorded > 0) reminderRows.push(row);
    });

    const reminderTotal = onTime + overdue + notRecorded;
    const hoursTotal = Object.values(hoursByDay).reduce((a, b) => a + b, 0);

    return {
      weeks, weekKeys, days, dayKeys, perLogbook, total, thisWeek, lastWeek,
      reminderRows, attention, onTime, overdue, notRecorded, reminderTotal,
      hoursByDay, hoursTotal, fuelByDay,
    };
  }

  // ----- Drawing -----

  function destroyCharts() {
    charts.forEach((c) => c.destroy());
    charts = [];
  }

  function textColor() {
    return getComputedStyle(section).color || "#888";
  }

  function chartOptions(stacked) {
    const color = textColor();
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: stacked, ticks: { color: color } },
        y: { stacked: stacked, beginAtZero: true, ticks: { color: color, precision: 0 } },
      },
      plugins: { legend: { labels: { color: color } } },
    };
  }

  function addCard(grid, value, label) {
    const card = document.createElement("div");
    card.className = "field";
    const strong = document.createElement("strong");
    strong.textContent = value;
    const caption = document.createElement("div");
    caption.className = "muted";
    caption.textContent = label;
    card.appendChild(strong);
    card.appendChild(caption);
    grid.appendChild(card);
  }

  function addChartBox(title) {
    const heading = document.createElement("h3");
    heading.textContent = title;
    section.appendChild(heading);
    const box = document.createElement("div");
    box.style.position = "relative";
    box.style.height = "260px";
    const canvas = document.createElement("canvas");
    // Screen readers announce the chart title; the values are also in the summary cards.
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", title);
    box.appendChild(canvas);
    section.appendChild(box);
    return canvas;
  }

  function render() {
    destroyCharts();
    section.innerHTML = "";

    const head = document.createElement("div");
    head.className = "card-head";
    const titleWrap = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = tr("Statistics");
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = tr("Statistics from the records saved on this device.");
    titleWrap.appendChild(title);
    titleWrap.appendChild(hint);
    head.appendChild(titleWrap);
    section.appendChild(head);

    if (typeof Chart === "undefined") {
      const msg = document.createElement("p");
      msg.className = "status err";
      msg.textContent = tr("The chart library did not load. Check your internet connection.");
      section.appendChild(msg);
      return;
    }

    const data = compute();

    if (data.total === 0 && data.reminderTotal === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = tr("No data yet. Save a record to see statistics.");
      section.appendChild(empty);
      return;
    }

    // Items that need attention come first: the officer sees them before the charts.
    const attentionTitle = document.createElement("h3");
    attentionTitle.textContent = tr("Needs attention");
    section.appendChild(attentionTitle);
    if (!data.attention.length) {
      const ok = document.createElement("p");
      ok.className = "muted";
      ok.textContent = tr("Nothing needs attention.");
      section.appendChild(ok);
    } else {
      const list = document.createElement("ul");
      list.className = "entries";
      data.attention.forEach((item) => {
        const li = document.createElement("li");
        // The status is written as text as well as a symbol, so color is not the only signal.
        const status = document.createElement("strong");
        status.textContent = (item.overdue ? "! " + tr("Overdue") : "○ " + tr("Not recorded")) + ": ";
        li.appendChild(status);
        li.appendChild(document.createTextNode(tr(LOGBOOKS[item.id].name) + " · " + tr(item.label)));
        list.appendChild(li);
      });
      section.appendChild(list);
    }

    // Summary cards: the headline figure first, then the trend.
    const grid = document.createElement("div");
    grid.className = "fields-grid";
    addCard(grid, String(data.total), tr("Total records"));
    const diff = data.thisWeek - data.lastWeek;
    const trend = diff > 0 ? "▲ +" + diff : diff < 0 ? "▼ " + diff : "= 0";
    addCard(grid, String(data.thisWeek), tr("Records this week") + " · " + trend + " " + tr("vs last week"));
    const pct = data.reminderTotal ? Math.round((data.onTime / data.reminderTotal) * 100) : 0;
    addCard(grid, pct + "%", tr("Reminders on time"));
    addCard(grid, data.hoursTotal.toFixed(1), tr("Watch hours, last 14 days"));
    section.appendChild(grid);

    // Records per week, by logbook.
    const weekIds = Object.keys(data.perLogbook).filter((id) => data.perLogbook[id].total > 0);
    const weekCanvas = addChartBox(tr("Records per week"));
    charts.push(new Chart(weekCanvas, {
      type: "bar",
      data: {
        labels: data.weeks.map(shortDate),
        datasets: weekIds.map((id, i) => ({
          label: tr(LOGBOOKS[id].name),
          data: data.perLogbook[id].weeks,
          backgroundColor: COLORS[i % COLORS.length],
          stack: "records",
        })),
      },
      options: chartOptions(true),
    }));

    // Reminders by logbook.
    const remCanvas = addChartBox(tr("Reminders by logbook"));
    charts.push(new Chart(remCanvas, {
      type: "bar",
      data: {
        labels: data.reminderRows.map((r) => tr(LOGBOOKS[r.id].name)),
        datasets: [
          { label: tr("On time"), data: data.reminderRows.map((r) => r.onTime), backgroundColor: ON_TIME, stack: "rem" },
          { label: tr("Overdue"), data: data.reminderRows.map((r) => r.overdue), backgroundColor: OVERDUE, stack: "rem" },
          { label: tr("Not recorded"), data: data.reminderRows.map((r) => r.notRecorded), backgroundColor: NOT_RECORDED, stack: "rem" },
        ],
      },
      options: chartOptions(true),
    }));

    // Watch hours per day.
    const hoursCanvas = addChartBox(tr("Watch hours per day"));
    charts.push(new Chart(hoursCanvas, {
      type: "bar",
      data: {
        labels: data.days.map(shortDate),
        datasets: [{
          label: tr("Watch hours"),
          data: data.dayKeys.map((k) => Math.round(data.hoursByDay[k] * 10) / 10),
          backgroundColor: COLORS[1],
        }],
      },
      options: chartOptions(false),
    }));

    // Fuel oil per day (tons), only when fuel was recorded.
    if (Object.values(data.fuelByDay).some((v) => v > 0)) {
      const fuelCanvas = addChartBox(tr("Fuel oil per day (tons)"));
      charts.push(new Chart(fuelCanvas, {
        type: "line",
        data: {
          labels: data.days.map(shortDate),
          datasets: [{
            label: tr("Fuel oil quantity (tons)"),
            data: data.dayKeys.map((k) => Math.round(data.fuelByDay[k] * 10) / 10),
            borderColor: COLORS[0],
            backgroundColor: COLORS[0],
            tension: 0.2,
          }],
        },
        options: chartOptions(false),
      }));
    }
  }

  // ----- Opening and closing -----

  // The sidebar icon of the open view is highlighted: statistics or logbooks.
  function setSidebar(statsOn) {
    const sidebarStats = document.getElementById("sidebarStats");
    const sidebarLogbooks = document.getElementById("sidebarLogbooks");
    if (sidebarStats) sidebarStats.classList.toggle("is-active", statsOn);
    if (sidebarLogbooks) sidebarLogbooks.classList.toggle("is-active", !statsOn);
  }

  function open() {
    setSidebar(true);
    roadmapSection.hidden = true;
    watchSection.hidden = true;
    logbookSection.hidden = true;
    progressWrap.hidden = true;
    section.hidden = false;
    btn.setAttribute("aria-pressed", "true");
    render();
  }

  // Closing from the button restores the logbook that was open.
  function close() {
    destroyCharts();
    setSidebar(false);
    section.hidden = true;
    btn.setAttribute("aria-pressed", "false");
    const active = document.querySelector(".logbook-list li.is-active");
    if (active) active.click();
  }

  btn.addEventListener("click", () => {
    if (section.hidden) open();
    else close();
  });

  // Choosing a logbook in the sidebar leaves the statistics. logbook.js runs first.
  sidebarItems.forEach((li) => {
    li.addEventListener("click", () => {
      destroyCharts();
      setSidebar(false);
      section.hidden = true;
      btn.setAttribute("aria-pressed", "false");
    });
  });

  // Redraw when the theme or the language changes, so chart colors and labels match.
  themeSelect.addEventListener("change", () => { if (!section.hidden) render(); });
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
