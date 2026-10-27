/* ================================================================
   Synthetic demo data — every ID, supplier, site and value below is
   fictional. Nothing here is Pentair data.
   ================================================================ */

export const AS_OF = "2026-10-27";

export const BANNER = "Illustrative data only — values and suppliers are synthetic.";

/* The four data signals the hypothesis proposes to connect. */
export const SIGNALS = {
  spend: ["Spend", "What is paid today, by supplier and site"],
  bom: ["BOM usage", "How many units the products will need"],
  supplier: ["Supplier performance", "Quality, delivery and qualification history"],
  price: ["External price signal", "Benchmarks or quotes from outside the current contract"],
};

/* Field-check results used on the "Why this is comparable?" panel. */
export const RESULT = {
  match: ["Match", "neutral", "✓"],
  normalized: ["Normalized", "neutral", "⇄"],
  inferred: ["Inferred", "amber", "≈"],
  missing: ["Missing", "amber", "?"],
  mismatch: ["Mismatch", "red", "✕"],
};

/* Transparent confidence rule — no black-box score. */
export const CONFIDENCE_RULE = [
  ["High", "Every field matches or was normalized. Nothing missing or inferred."],
  ["Medium", "No mismatches. One or two fields missing or inferred."],
  ["Low", "Any mismatch, or more than two fields missing or inferred."],
];

export function countResults(fields = []) {
  const c = { match: 0, normalized: 0, inferred: 0, missing: 0, mismatch: 0 };
  fields.forEach((f) => { c[f.r] += 1; });
  return c;
}

export function confidenceOf(fields = []) {
  if (!fields.length) return "Not assessed";
  const c = countResults(fields);
  if (c.mismatch > 0 || c.missing + c.inferred > 2) return "Low";
  if (c.missing + c.inferred > 0) return "Medium";
  return "High";
}

/* Running total through a list of normalization steps. */
export function landed(steps, override) {
  let run = 0;
  steps.forEach((s) => {
    const v = s.whatIf && override != null ? override : s.value;
    if (v == null) return;
    if (s.op === "+") run += v;
    else run = v;
  });
  return Math.round(run * 100) / 100;
}

export const OPPS = [
  {
    id: "H-204",
    type: "Price variance",
    component: "Pump housing",
    spec: "Cast aluminium A356-T6 · machined · drawing rev C",
    category: "Castings",
    site: "Plant A",
    volume: 8000,
    volumeNote: "12-month BOM usage not covered by a fixed-price contract",
    current: 69.05,
    compare: 65.55,
    compareKind: "Comparable benchmark",
    risk: "Low",
    status: "Benchmark only",
    caveat: "Benchmark signal only; not a supplier offer.",
    signals: ["spend", "bom", "supplier", "price"],
    cur: {
      who: "Supplier S-17",
      tag: "Approved source",
      source: "Contract price",
      dateLabel: "Effective",
      date: "2026-07-01",
      steps: [
        { label: "Unit price, FOB origin", value: 66.4, kind: "known" },
        { label: "Inbound freight · 6-month lane average", value: 1.85, kind: "known", op: "+" },
        { label: "Duty & handling", value: 0.8, kind: "known", op: "+" },
      ],
    },
    cmp: {
      who: "Illustrative external benchmark",
      tag: "Benchmark · not a supplier offer",
      source: "Cast aluminium housings, 2–5 kg class",
      dateLabel: "Dated",
      date: "2026-09-15",
      steps: [
        { label: "Benchmark price, EXW (ex works)", text: "€58.20", kind: "known" },
        { label: "Convert EUR → USD at 1.08 (illustrative rate, same date)", value: 62.86, kind: "converted", op: "→" },
        { label: "Freight to Plant A · standard lane rate", value: 1.89, kind: "assumed", op: "+", whatIf: true },
        { label: "Duty & handling · same as current lane", value: 0.8, kind: "assumed", op: "+" },
      ],
    },
    whatIf: { label: "Assumed benchmark freight to Plant A", min: 0, max: 6, step: 0.01 },
    fields: [
      { f: "Material / grade", cur: "A356-T6", cmp: "A356-T6", r: "match" },
      { f: "Part geometry", cur: "Drawing rev C · 3.2 kg", cmp: "Part family: 2–5 kg housings", r: "inferred", note: "Matched by part family, not by drawing." },
      { f: "Unit of measure", cur: "Each", cmp: "Each", r: "match" },
      { f: "Currency", cur: "USD", cmp: "EUR → USD at 1.08", r: "normalized" },
      { f: "Price basis", cur: "FOB origin + actual freight", cmp: "EXW + assumed freight", r: "normalized", note: "Benchmark freight is an assumption — test it in the what-if below." },
      { f: "Effective date", cur: "01 Jul 2026", cmp: "15 Sep 2026", r: "match", note: "76 days apart · inside the 90-day window." },
      { f: "Volume tier", cur: "8,000 / yr", cmp: "5,000–10,000 tier", r: "match" },
      { f: "Machining & finish scope", cur: "Machined + powder coat", cmp: "Not stated", r: "missing", note: "If the benchmark excludes coating, the gap narrows." },
    ],
    knowledge: {
      known: ["Current contract price and effective date", "12-month BOM usage of 8,000 units", "Actual freight on the current lane"],
      inferred: ["Benchmark geometry matched by part family, not by drawing"],
      missing: ["Whether the benchmark includes machining and powder coat", "Benchmark payment terms"],
      assumed: ["Benchmark freight at a standard lane rate of $1.89 / unit", "EUR → USD at 1.08", "Duty & handling unchanged"],
    },
    rationale: "After normalizing currency, price basis and freight, the current contract price sits $3.50 / unit (5.1%) above a comparable external benchmark.",
    risks: ["Benchmark scope may exclude coating or machining", "Freight assumption — the gap closes if freight exceeds $5.39 / unit", "Benchmark is a market signal; no supplier has offered this price"],
    nextStep: "Confirm whether the benchmark covers machining and powder coat. If it does, use it as an input to the next price review with Supplier S-17.",
    owner: "Category manager · Castings",
    gates: [
      { owner: "Sourcing", gate: "Confirm benchmark scope (machining, coating)", status: "Not started" },
      { owner: "Sourcing", gate: "Use as input to next price review with S-17", status: "Not started" },
    ],
    alt: null,
    noAlt: "No alternative source is in scope for H-204. The benchmark is a market signal, not a supplier offer, so there is nothing to switch to. Its best use is as an input to the next price review with Supplier S-17, once the benchmark scope is confirmed.",
  },
  {
    id: "M-311",
    type: "Alternative source",
    component: "Mechanical seal assembly",
    spec: "Carbon / ceramic face · EPDM elastomer · 5/8 in shaft · drawing rev B",
    category: "Seals",
    site: "Plant B",
    volume: 4000,
    volumeNote: "12-month BOM usage across two product lines",
    current: 44.8,
    compare: 41.5,
    compareKind: "Illustrative alternative quote",
    risk: "High",
    status: "Supplier not qualified",
    caveat: "Alternative is not qualified; lead time is 2 weeks longer.",
    signals: ["spend", "bom", "supplier", "price"],
    cur: {
      who: "Supplier S-08",
      tag: "Approved source",
      source: "Contract price",
      dateLabel: "Effective",
      date: "2026-07-01",
      steps: [
        { label: "Unit price, FOB origin", value: 42.6, kind: "known" },
        { label: "Inbound freight · 6-month lane average", value: 1.6, kind: "known", op: "+" },
        { label: "Duty & handling", value: 0.6, kind: "known", op: "+" },
      ],
    },
    cmp: {
      who: "Supplier S-31",
      tag: "Simulated supplier quote",
      source: "Quote valid 90 days",
      dateLabel: "Quoted",
      date: "2026-10-06",
      steps: [
        { label: "Quoted unit price, FOB origin", value: 39.1, kind: "known" },
        { label: "Freight · from supplier quote, cross-border lane", value: 1.8, kind: "known", op: "+" },
        { label: "Duty & handling · assumed same as current", value: 0.6, kind: "assumed", op: "+", whatIf: true },
      ],
    },
    whatIf: { label: "Assumed duty & handling on S-31's cross-border lane", min: 0, max: 5, step: 0.01 },
    fields: [
      { f: "Specification", cur: "Drawing rev B", cmp: "Quoted to drawing rev B", r: "inferred", note: "Supplier states equivalence; not yet tested." },
      { f: "Unit of measure", cur: "Each", cmp: "Each", r: "match" },
      { f: "Currency", cur: "USD", cmp: "USD", r: "match" },
      { f: "Price basis", cur: "FOB origin + actual freight", cmp: "FOB origin + quoted freight", r: "normalized" },
      { f: "Effective date", cur: "01 Jul 2026", cmp: "06 Oct 2026", r: "match", note: "Quote valid for 90 days." },
      { f: "Volume tier", cur: "4,000 / yr", cmp: "Quoted at 4,000 / yr", r: "match" },
      { f: "Packaging & labelling", cur: "Kitted and labelled", cmp: "Not stated", r: "missing" },
    ],
    knowledge: {
      known: ["Current price, quality and delivery history for S-08", "12-month BOM usage of 4,000 units", "Simulated S-31 quote values"],
      inferred: ["Specification equivalence — quoted to the same drawing, not tested"],
      missing: ["S-31 quality and delivery history", "Packaging scope", "Capacity audit"],
      assumed: ["Duty & handling on S-31's lane equal to current ($0.60 / unit)"],
    },
    rationale: "A simulated quote from Supplier S-31 is $3.30 / unit (7.4%) below the current approved source on normalized landed cost.",
    risks: ["S-31 is not qualified", "Lead time 2 weeks longer — about 154 more units held in the pipeline", "Capacity stated, not verified", "No quality or delivery history", "Higher minimum order quantity (1,000 vs 500)"],
    nextStep: "Ask Engineering and Quality whether S-31 should enter qualification. Verify capacity before any volume discussion. No change to the current source.",
    owner: "Sourcing lead · Seals",
    gates: [
      { owner: "Engineering", gate: "Specification equivalence review", status: "Not started" },
      { owner: "Quality", gate: "First-article inspection and qualification", status: "Not started" },
      { owner: "Supply chain", gate: "Capacity and lead-time verification", status: "Not started" },
      { owner: "Sourcing", gate: "Commercial terms and MOQ", status: "Quote received (simulated)" },
      { owner: "Finance", gate: "Business case incl. inventory effect", status: "Not started" },
    ],
    alt: {
      rows: [
        { k: "Normalized landed cost", cur: "$44.80 / unit", opt: "$41.50 / unit", flag: ["−$3.30 / unit", "neutral"] },
        { k: "Freight / logistics", cur: "$1.60 / unit · domestic lane · 4-day transit", opt: "$1.80 / unit · cross-border lane · 9-day transit", flag: ["Longer lane", "amber"] },
        { k: "Lead time", cur: "6 weeks", opt: "8 weeks", flag: ["+2 weeks", "amber"] },
        { k: "Minimum order quantity (MOQ)", cur: "500 units", opt: "1,000 units", flag: ["Higher MOQ", "amber"] },
        { k: "Capacity", cur: "Confirmed · 6,000 / yr", opt: "Stated 5,000 / yr", flag: ["Not verified", "amber"] },
        { k: "Quality · defective parts per million (PPM)", cur: "210 PPM · last 12 months", opt: "No history", flag: ["No history", "amber"] },
        { k: "Delivery · on time, in full (OTIF)", cur: "95% · last 12 months", opt: "No history", flag: ["No history", "amber"] },
        { k: "Qualification status", cur: "Approved", opt: "Not qualified", flag: ["Not qualified", "red"] },
        { k: "Key supply risks", cur: "Single approved source", opt: "New supplier · cross-border lane · unverified capacity", flag: null },
        { k: "Evidence", cur: "Contract price · effective 01 Jul 2026", opt: "Simulated quote · 06 Oct 2026 · valid 90 days", flag: null },
      ],
      extraWeeks: 2,
    },
  },
  {
    id: "E-225",
    type: "Price benchmark",
    component: "Pressure gauge",
    spec: "0–100 psi · 2.5 in dial · stainless case",
    category: "Instruments",
    site: "Plant B",
    volume: 25000,
    volumeNote: "12-month BOM usage across all gauge-fitted models",
    current: 12.75,
    compare: 11.9,
    compareKind: "Illustrative benchmark",
    risk: "Medium",
    status: "Needs validation",
    caveat: "Benchmark is not a verified offer; comparability needs validation.",
    signals: ["spend", "bom", "price"],
    cur: {
      who: "Supplier S-22",
      tag: "Approved distributor",
      source: "Distributor price",
      dateLabel: "Effective",
      date: "2026-07-01",
      steps: [
        { label: "Delivered unit price", value: 12.4, kind: "known" },
        { label: "Receiving & handling", value: 0.35, kind: "known", op: "+" },
      ],
    },
    cmp: {
      who: "Illustrative external benchmark",
      tag: "Benchmark · not a verified offer",
      source: "Catalogue index, industrial gauges",
      dateLabel: "Dated",
      date: "2026-03-18",
      steps: [
        { label: "Benchmark price, box of 10, FOB", text: "$113.00 / box", kind: "known" },
        { label: "Convert to each (÷ 10)", value: 11.3, kind: "converted", op: "→" },
        { label: "Freight to Plant B · assumed", value: 0.25, kind: "assumed", op: "+", whatIf: true },
        { label: "Receiving & handling · same as current", value: 0.35, kind: "assumed", op: "+" },
      ],
    },
    whatIf: { label: "Assumed benchmark freight to Plant B", min: 0, max: 1.5, step: 0.01 },
    fields: [
      { f: "Specification", cur: "0–100 psi · ±1.6% accuracy", cmp: "0–100 psi · accuracy not stated", r: "missing" },
      { f: "Case & connection", cur: "Stainless · ¼ in NPT bottom mount", cmp: "Not stated", r: "missing" },
      { f: "Unit of measure", cur: "Each", cmp: "Box of 10 → each", r: "normalized" },
      { f: "Currency", cur: "USD", cmp: "USD", r: "match" },
      { f: "Price basis", cur: "Delivered", cmp: "FOB + assumed freight", r: "normalized" },
      { f: "Effective date", cur: "01 Jul 2026", cmp: "18 Mar 2026", r: "mismatch", note: "105 days apart · outside the 90-day window. Market movement since March is not reflected." },
      { f: "Volume tier", cur: "25,000 / yr", cmp: "50,000+ tier", r: "mismatch", note: "Benchmark reflects a larger tier; the price may not be available at 25,000." },
    ],
    knowledge: {
      known: ["Current distributor price", "12-month BOM usage of 25,000 units"],
      inferred: ["Benchmark mapped to this gauge by description"],
      missing: ["Accuracy class of the benchmark item", "Case and connection type"],
      assumed: ["Benchmark freight of $0.25 / unit", "Receiving & handling unchanged"],
    },
    rationale: "A catalogue benchmark sits $0.85 / unit (6.7%) below the current distributor price, but the benchmark is older and priced at a larger volume tier.",
    risks: ["Benchmark is 105 days older than the current price", "Volume tier mismatch (50,000+ vs 25,000)", "Specification only partly known", "Not a verified offer"],
    nextStep: "Confirm the benchmark specification and tier. If they hold, request two comparable quotes before treating this as an opportunity.",
    owner: "Category manager · Instruments",
    gates: [
      { owner: "Sourcing", gate: "Confirm benchmark specification and tier", status: "Not started" },
      { owner: "Engineering", gate: "Confirm accuracy class requirement", status: "Not started" },
    ],
    alt: null,
    noAlt: "No alternative source is in scope for E-225. The benchmark is a catalogue index, not a verified offer, and fails two comparability checks. The next step is to confirm specification and tier, then request comparable quotes.",
  },
  {
    id: "V-410",
    type: "VAVE candidate",
    component: "Filter end cap",
    spec: "Glass-filled nylon PA66-GF30 · injection moulded",
    category: "Moulded plastics",
    site: "Plant A",
    volume: null,
    volumeNote: "Not yet validated",
    current: null,
    compare: null,
    compareKind: "Potential engineering alternative",
    risk: "High",
    status: "Needs engineering review",
    caveat: "Engineering equivalence, qualification and impact must be assessed first.",
    signals: ["bom", "supplier"],
    idea: "An alternative polymer grade, or consolidating the end cap and seal retainer into one moulded part.",
    fields: [],
    knowledge: {
      known: ["Part is used across several filter models"],
      inferred: ["A lower-cost material may meet the duty — not tested"],
      missing: ["Volume, cost baseline, equivalence data, certification impact"],
      assumed: [],
    },
    rationale: "A possible design or material change (VAVE) flagged for engineering review. Not quantified.",
    risks: ["Engineering equivalence unknown", "Possible re-testing or re-certification", "Tooling change"],
    nextStep: "Engineering to decide whether the idea merits an equivalence study. Do not quantify until then.",
    owner: "Engineering lead · Filtration",
    gates: [
      { owner: "Engineering", gate: "Equivalence: pressure, temperature, chemical resistance", status: "Not started" },
      { owner: "Quality", gate: "Validation testing plan", status: "Not started" },
      { owner: "Operations", gate: "Tooling and line impact", status: "Not started" },
      { owner: "Sourcing", gate: "Cost baseline and supplier input", status: "Not started" },
    ],
    alt: null,
    noAlt: "V-410 is a design or material idea, not a supplier comparison. It moves forward only after Engineering confirms equivalence.",
  },
];

/* Derived fields */
OPPS.forEach((o) => {
  o.confidence = confidenceOf(o.fields);
  o.gap = o.current != null ? Math.round((o.current - o.compare) * 100) / 100 : null;
  o.value = o.gap != null ? Math.round(o.gap * o.volume) : null;
  o.pct = o.gap != null ? (o.gap / o.current) * 100 : null;
});

export const byId = (id) => OPPS.find((o) => o.id === id);
export const priced = OPPS.filter((o) => o.value != null);
export const TOTAL = priced.reduce((s, o) => s + o.value, 0);

const CONF_ORDER = { High: 0, Medium: 1, Low: 2, "Not assessed": 3 };
export const byPriority = (a, b) =>
  CONF_ORDER[a.confidence] - CONF_ORDER[b.confidence] || (b.value ?? -1) - (a.value ?? -1);
export const byValue = (a, b) => (b.value ?? -1) - (a.value ?? -1);

export const GLOSSARY = [
  ["BOM", "Bill of materials — the list of parts that go into each product."],
  ["Landed cost", "Price plus freight, duty and handling — what a part really costs once it arrives at the plant."],
  ["FOB / EXW", "Price terms. FOB: price at the supplier's shipping point. EXW (ex works): price at the factory gate, before any freight."],
  ["Normalization", "Adjusting two prices to the same currency, unit and terms so they can be compared fairly."],
  ["MOQ", "Minimum order quantity a supplier will accept."],
  ["OTIF", "On time, in full — share of deliveries that arrive on time with the full quantity."],
  ["PPM", "Defective parts per million received."],
  ["Qualification", "The approval process a new supplier must pass before supplying production."],
  ["VAVE", "Value analysis / value engineering — changing a design or material to reduce cost."],
];

export const QUESTIONS = [
  "Would connecting spend, BOM usage, supplier performance and external price signals add value beyond the current process?",
  "Which signal matters most: price variance, category leverage, alternative sourcing, VAVE or risk-adjusted prioritization?",
  "What data and rules would establish comparability and a credible business case?",
  "Who must review an opportunity before it progresses — sourcing, engineering, quality, operations, finance?",
  "Which narrow category or product family would suit a proof of concept?",
];
