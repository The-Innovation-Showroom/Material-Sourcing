import React from "react";
import { SIGNALS, GLOSSARY, QUESTIONS } from "./data.js";
import { Info } from "./ui.jsx";

const STEPS = [
  ["queue", "Opportunity queue", "Which signals merit review"],
  ["investigate", "Investigate price", "Is the comparison fair?"],
  ["compare", "Compare sources", "Price versus risk"],
  ["brief", "Decision brief", "Summary for human review"],
];

const GLYPH = { spend: "$", bom: "☰", supplier: "◎", price: "⇄" };

export default function Sidebar({ step, visited, onStep, onTour }) {
  return (
    <aside className="sidebar no-print">
      <h2>Sourcing workbench</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}><button className="tour-btn" onClick={onTour}><span className="g">▶</span> Navigate me through</button><Info>A guided walkthrough of the whole demo. Some steps wait until you try the action yourself. Press Esc to leave it.</Info></div>
      <p className="cap">
        Exploratory concept on synthetic data. In practice, spend, BOM usage, supplier scorecards and price feeds would
        replace this sample — no systems are connected here.
      </p>

      <div className="side-nav-label">Decision path<Info>The four steps a sourcing lead would follow, from spotting a signal to a brief for people to decide on.</Info></div>
      <div className="stepper">
        {STEPS.map(([k, t, s], i) => (
          <button key={k} className={`step ${step === k ? "on" : visited.has(k) ? "done" : ""}`} onClick={() => onStep(k)}>
            <span className="n">{visited.has(k) && step !== k ? "✓" : i + 1}</span>
            <span><b>{t}</b><span>{s}</span></span>
          </button>
        ))}
      </div>

      <div className="side-extra">
      <hr />
      <div className="side-nav-label">Hypothesis</div>
      <p className="side-hyp">
        Could connecting direct-material spend, BOM usage, supplier performance and external price signals help sourcing
        leaders identify and prioritize additional opportunities — without compromising total landed cost, supply
        continuity, quality or qualification requirements?
      </p>

      <div className="side-nav-label">Signals combined<Info w={280}>The four data sources this concept links together. In a live version they would come from ERP spend, the BOM, supplier scorecards and price feeds.</Info></div>
      {Object.entries(SIGNALS).map(([k, [label, desc]]) => (
        <div key={k} className="side-sig">
          <span className="g">{GLYPH[k]}</span>
          <span><b>{label}</b><span>{desc}</span></span>
        </div>
      ))}

      <details className="side-det">
        <summary>Questions to validate</summary>
        <ol>{QUESTIONS.map((q, i) => <li key={i}>{q}</li>)}</ol>
      </details>
      <details className="side-det">
        <summary>Terms used</summary>
        <dl>{GLOSSARY.map(([t, d]) => <React.Fragment key={t}><dt>{t}</dt><dd>{d}</dd></React.Fragment>)}</dl>
      </details>

      </div>
    </aside>
  );
}
