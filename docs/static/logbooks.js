/**
 * Logbook definitions.
 *
 * Each logbook lists:
 *   - ref:        the rule or publication it follows (verify against the
 *                 official text and the flag state before relying on it).
 *   - types:      the kinds of entry the logbook accepts, with their fields.
 *   - reminders:  what should be recorded, and how often (everyDays), or
 *                 null when the entry is event-driven (no fixed period).
 *   - checklist:  the items a complete record should contain.
 *
 * Field types: "text", "textarea", "time", "date", "number".
 * Only the Deck logbook uses the watch form in index.html; the others are
 * rendered from these definitions by logbook.js.
 */

const LOGBOOKS = {
  deck: {
    name: "Deck Logbook",
    ref: "Navigation records: SOLAS chapter V, regulation 28, and IMO resolution A.916(22). Check the flag state requirements.",
    usesWatchForm: true,
    types: [],
    reminders: [
      { id: "watch-end", label: "Sign the deck log at the end of each watch", typeId: null, everyDays: 1 },
    ],
    checklist: [
      "Position, course, speed and draught at each watch change",
      "Weather, visibility and sea state",
      "Navigation events, alterations of course and pilot boarding",
      "Weekly review of navigation equipment test records",
      "Signature of the officer on watch",
    ],
  },

  engine: {
    name: "Engine Logbook",
    ref: "Engine parameters and NOx records: MARPOL Annex VI and the NOx Technical Code. Fuel changeover records are also required by Annex VI.",
    types: [
      {
        id: "engine-parameters",
        label: "Engine parameters",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "engine", label: "Engine", type: "text", required: true },
          { id: "load", label: "Load (%)", type: "number", required: true },
          { id: "rpm", label: "RPM", type: "number" },
          { id: "running-hours", label: "Running hours", type: "number" },
          { id: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
      {
        id: "fuel-changeover",
        label: "Fuel oil changeover",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "from-fuel", label: "From fuel", type: "text", required: true },
          { id: "to-fuel", label: "To fuel", type: "text", required: true },
          { id: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
    ],
    reminders: [
      { id: "engine-hours", label: "Record engine parameters once per day", typeId: "engine-parameters", everyDays: 1 },
      { id: "fuel-changeover", label: "Record each fuel oil changeover", typeId: "fuel-changeover", everyDays: null },
    ],
    checklist: [
      "Engine parameters for each engine in use",
      "Running hours",
      "Fuel oil changeovers with time and position",
      "Remarks on alarms or faults",
    ],
  },

  radio: {
    name: "Radio / GMDSS Logbook",
    ref: "Radio communications and GMDSS records: SOLAS chapter IV. Check the flag state requirements for the test frequency.",
    types: [
      {
        id: "radio-test",
        label: "Equipment test",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "equipment", label: "Equipment tested", type: "text", required: true },
          { id: "result", label: "Result", type: "text", required: true },
          { id: "operator", label: "Operator", type: "text", required: true },
        ],
      },
      {
        id: "radio-message",
        label: "Communication",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "station", label: "Station or contact", type: "text", required: true },
          { id: "channel", label: "Channel or frequency", type: "text" },
          { id: "summary", label: "Summary", type: "textarea", required: true },
        ],
      },
      {
        id: "distress",
        label: "Distress alert",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "type", label: "Alert type", type: "text", required: true },
          { id: "action", label: "Action taken", type: "textarea", required: true },
        ],
      },
    ],
    reminders: [
      { id: "gmdss-daily-test", label: "Daily GMDSS equipment test", typeId: "radio-test", everyDays: 1 },
      { id: "epirb-monthly", label: "Monthly EPIRB and battery check", typeId: "radio-test", everyDays: 30 },
    ],
    checklist: [
      "Daily equipment test",
      "Distress and urgency communications",
      "Equipment faults and repairs",
      "Operator name for each entry",
    ],
  },

  garbage: {
    name: "Garbage Record Book",
    ref: "Garbage record book: MARPOL Annex V, regulation 10. Each discharge, incineration or loss must be recorded.",
    types: [
      {
        id: "garbage-operation",
        label: "Garbage operation",
        fields: [
          { id: "date", label: "Date", type: "date", required: true },
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "operation", label: "Operation (discharge, incineration, loss, reception)", type: "text", required: true },
          { id: "category", label: "Category (plastics, food, etc.)", type: "text", required: true },
          { id: "volume", label: "Estimated volume (m³)", type: "number", required: true },
          { id: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
    ],
    reminders: [
      { id: "garbage-event", label: "Record each discharge, incineration or loss when it happens", typeId: "garbage-operation", everyDays: null },
    ],
    checklist: [
      "Date, time and position of each operation",
      "Garbage category and estimated volume",
      "Receipts from reception facilities",
      "Officer signature",
    ],
  },

  oil: {
    name: "Oil Record Book Part I",
    ref: "Machinery space operations: MARPOL Annex I, regulation 36. Entries follow the operation codes in the book.",
    types: [
      {
        id: "oil-sludge",
        label: "Sludge (weekly record)",
        fields: [
          { id: "date", label: "Date", type: "date", required: true },
          { id: "tank", label: "Sludge tank", type: "text", required: true },
          { id: "retained", label: "Retained on board (m³)", type: "number", required: true },
          { id: "transfer", label: "Transfer or disposal", type: "text", required: true },
        ],
      },
      {
        id: "oil-bilge",
        label: "Bilge water discharge",
        fields: [
          { id: "start", label: "Start (time and position)", type: "text", required: true },
          { id: "stop", label: "Stop (time and position)", type: "text", required: true },
          { id: "method", label: "Method (15 ppm equipment, reception, holding tank)", type: "text", required: true },
          { id: "volume", label: "Quantity (m³)", type: "number", required: true },
        ],
      },
      {
        id: "oil-bunkering",
        label: "Bunkering",
        fields: [
          { id: "place", label: "Place and time", type: "text", required: true },
          { id: "product", label: "Fuel or lubricating oil type", type: "text", required: true },
          { id: "quantity", label: "Quantity added (tonnes)", type: "number", required: true },
          { id: "tank", label: "Tank and total content", type: "text", required: true },
        ],
      },
      {
        id: "oil-accident",
        label: "Filter failure or accidental discharge",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "event", label: "Event (filter failure or discharge)", type: "text", required: true },
          { id: "remarks", label: "Circumstances and remarks", type: "textarea", required: true },
        ],
      },
    ],
    reminders: [
      { id: "oil-sludge-weekly", label: "Weekly sludge record (required even on short voyages)", typeId: "oil-sludge", everyDays: 7 },
      { id: "oil-bilge", label: "Record each bilge water discharge", typeId: "oil-bilge", everyDays: null },
      { id: "oil-bunkering", label: "Record each bunkering operation", typeId: "oil-bunkering", everyDays: null },
    ],
    checklist: [
      "Ballasting or cleaning of fuel oil tanks",
      "Discharge of dirty ballast or cleaning water",
      "Weekly sludge record, retained and transferred",
      "Bilge discharges, manual or automatic",
      "Filter failure, accidental discharges",
      "Bunkering of fuel and lubricating oil",
      "Officer signature for each operation, master signature for each page",
    ],
  },

  ballast: {
    name: "Ballast Water Record Book",
    ref: "Ballast Water Management Convention, Appendix II (minimum record content). Check the flag state guidance.",
    types: [
      {
        id: "ballast-operation",
        label: "Ballast operation",
        fields: [
          { id: "date", label: "Date", type: "date", required: true },
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "operation", label: "Operation (ballasting, circulation, discharge, sediment disposal)", type: "text", required: true },
          { id: "tank", label: "Tank", type: "text", required: true },
          { id: "volume", label: "Volume (m³)", type: "number", required: true },
          { id: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
      {
        id: "ballast-unplanned",
        label: "Unplanned or exceptional discharge",
        fields: [
          { id: "time", label: "Time", type: "time", required: true },
          { id: "position", label: "Position", type: "text", required: true },
          { id: "volume", label: "Volume (m³)", type: "number", required: true },
          { id: "reason", label: "Reason", type: "textarea", required: true },
        ],
      },
    ],
    reminders: [
      { id: "ballast-every-op", label: "Record each ballast operation when it happens", typeId: "ballast-operation", everyDays: null },
      { id: "ballast-unplanned", label: "Record any unplanned discharge immediately", typeId: "ballast-unplanned", everyDays: null },
    ],
    checklist: [
      "Each ballasting, circulation, treatment and discharge",
      "Date, time and position",
      "Tank and volume",
      "Sediment disposal",
      "Unplanned or exceptional discharges",
    ],
  },

  cargo: {
    name: "Cargo Record Book",
    ref: "Cargo operations for chemical carriers: MARPOL Annex II, regulation 15. Applies to ships carrying noxious liquid substances.",
    types: [
      {
        id: "cargo-operation",
        label: "Cargo operation",
        fields: [
          { id: "date", label: "Date", type: "date", required: true },
          { id: "time", label: "Time", type: "time", required: true },
          { id: "operation", label: "Operation (loading, unloading, transfer, cleaning)", type: "text", required: true },
          { id: "product", label: "Product", type: "text", required: true },
          { id: "tank", label: "Tank", type: "text", required: true },
          { id: "quantity", label: "Quantity", type: "number", required: true },
          { id: "remarks", label: "Remarks", type: "textarea" },
        ],
      },
    ],
    reminders: [
      { id: "cargo-every-op", label: "Record each cargo operation when it happens", typeId: "cargo-operation", everyDays: null },
    ],
    checklist: [
      "Loading, unloading and transfer operations",
      "Tank cleaning and residues",
      "Product, quantity and tank for each operation",
      "Officer signature",
    ],
  },

  operational: {
    name: "Operational Logbook",
    ref: "Internal operational record set by the company or the safety management system. It does not replace the statutory books.",
    types: [
      {
        id: "daily-summary",
        label: "Daily summary",
        fields: [
          { id: "date", label: "Date", type: "date", required: true },
          { id: "summary", label: "Operations summary", type: "textarea", required: true },
          { id: "issues", label: "Issues or pending items", type: "textarea" },
        ],
      },
    ],
    reminders: [
      { id: "daily-summary", label: "Daily operational summary", typeId: "daily-summary", everyDays: 1 },
    ],
    checklist: [
      "Daily operations summary",
      "Pending issues",
      "Port calls and voyage notes",
    ],
  },
};
