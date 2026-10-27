/* ================================================================
   Konverge AI — UI primitives

   Styling only. Nothing here decides what pages exist, how many
   there are, or how a user moves between them — that follows from
   the solution being demonstrated.

   What is fixed:  Brand   — the wordmark, the disclaimer strip
   What is yours:  Layout  — pages, navigation, sidebar or no sidebar,
                             which components carry the screen

   Import what you need:
     import { Brand, Disclaimer, Frame, Btn, Kpis, DataTable } from "./konverge-ui.jsx";
   ================================================================ */

import React from "react";

/* ---------- formatters -------------------------------------------
   Numbers pair with the .num class so columns of figures align.
------------------------------------------------------------------ */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmtN = (v) => Math.trunc(v).toLocaleString("en-US");
export const fdate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`; };
export const plabel = (period) => { const [y, m] = period.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };

/* ================================================================
   BRAND — the two pieces every Konverge demo carries, unchanged
   ================================================================ */

/** Prototype disclaimer. Full-bleed, above everything, verbatim. */
export const Disclaimer = () => (
  <div className="disc">
    <b>PROTOTYPE</b> — Visual representation only — based on assumed considerations of the ideated solution.
    No backend or live connection. Final implementation to be discussed after discovery.
  </div>
);

/**
 * The brand card: wordmark left, status pills right.
 * Sits at the top of the content column, inside a Frame.
 * pills: array of strings, or [label, "ghost"] pairs for the grey variant.
 */
export const Brand = ({ solution, pills = [] }) => (
  <div className="kk-topbar">
    <div className="kk-logo">Konverge<span>.AI</span>{solution && <small>{solution}</small>}</div>
    {pills.length > 0 && (
      <div className="kk-pills">
        {pills.map((p, i) => {
          const [label, variant] = Array.isArray(p) ? p : [p, ""];
          return <span key={i} className={`kk-pill ${variant}`}>{label}</span>;
        })}
      </div>
    )}
  </div>
);

/** Content column, max 1240px. Put Brand and everything else inside it. */
export const Frame = ({ children }) => <div className="frame">{children}</div>;

/** Optional one-line statement of what the prototype covers. */
export const ScopeStrip = ({ label = "Prototype scope", children }) => (
  <div className="global-scope-strip"><b>{label}</b><span>{children}</span></div>
);

/* ================================================================
   CONTROLS
   ================================================================ */

/** Orange when primary, white with a rule otherwise. One primary per view. */
export const Btn = ({ primary, small, stretch, className = "", ...p }) => (
  <button className={`btn ${primary ? "" : "ghost"} ${small ? "small" : ""} ${stretch ? "stretch" : ""} ${className}`} {...p} />
);

export const Select = ({ label, value, onChange, options, format, disabled, help }) => (
  <div className="ctrl">
    <label>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} title={help || undefined}>
      {options.map((o) => <option key={o} value={o}>{format ? format(o) : o}</option>)}
    </select>
    {help && <div className="help">{help}</div>}
  </div>
);

export const Field = ({ label, help, children }) => (
  <div className="ctrl"><label>{label}</label>{children}{help && <div className="help">{help}</div>}</div>
);

/** Segmented toggle. options: [value, label] pairs or plain strings. */
export const Seg = ({ value, onChange, options }) => (
  <div className="seg">
    {options.map((o) => {
      const [val, label] = Array.isArray(o) ? o : [o, o];
      return <button key={val} className={val === value ? "on" : ""} onClick={() => onChange(val)}>{label}</button>;
    })}
  </div>
);

/** Filter chips. Use over any list the reader needs to narrow. */
export const Chip = ({ on, count, children, ...p }) => (
  <button className={`vr-chip ${on ? "on" : ""}`} {...p}>{children}{count != null && <small> {count}</small>}</button>
);

/* ================================================================
   FEEDBACK
   ================================================================ */

/** kind: "info" | "ok" | "warn" | "err". Use info for empty states. */
export const Msg = ({ kind = "info", children }) => <div className={`msg ${kind}`}>{children}</div>;

/** tone: "valid" | "blocked" | "short" | "invalid" — verdict colours, never orange. */
export const Status = ({ tone, children }) => <span className={`ri-status ${tone}`}>{children}</span>;

/* ================================================================
   CONTENT BLOCKS
   ================================================================ */

/** Header for any view: orange micro-label, title, one-line explanation, right chip. */
export const Head = ({ eyebrow, title, sub, chip = "Synthetic demo · sample data" }) => (
  <div className="ri-head">
    <div>
      {eyebrow && <div className="ri-ey">{eyebrow}</div>}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
    {chip && <div className="ri-chip">{chip}</div>}
  </div>
);

/** Orange micro-label used as a rule between blocks. */
export const Section = ({ children }) => <div className="ri-sec">{children}</div>;

/** Left-ruled aside for a caveat or assumption. */
export const Note = ({ children }) => <div className="ri-note">{children}</div>;

/** White titled panel. */
export const Panel = ({ title, sub, children }) => (
  <div className="ri-frame">
    {title && <h3>{title}</h3>}
    {sub && <p>{sub}</p>}
    {children}
  </div>
);

/**
 * Metric row. items: [label, value, sublabel, tone?] where tone is
 * "good" | "bad" | "warn". Sizes itself to however many you pass —
 * three reads as calm, six as dense. Both are fine.
 */
export const Kpis = ({ items }) => (
  <div className="ri-kpis" style={{ "--kpi-cols": items.length }}>
    {items.map(([l, v, s, tone], i) => (
      <div key={i} className={`ri-kpi ${tone || ""}`}>
        <div className="l">{l}</div><div className="v num">{v}</div>{s && <div className="s">{s}</div>}
      </div>
    ))}
  </div>
);

/** Capability card. ico is a text glyph — ☰ ⚖ ◎ ▣ ✦ — never an icon library. */
export const Card = ({ ico, title, children }) => (
  <div className="kk-card">
    {ico && <div className="ico">{ico}</div>}
    {title && <h3>{title}</h3>}
    <p>{children}</p>
  </div>
);

/**
 * Sticky-header data table built from an array of objects.
 * numberCols get right-aligned and thousands-separated.
 */
export function DataTable({ rows, numberCols = [], empty = "No rows match the current selection." }) {
  if (!rows.length) return <Msg kind="info">{empty}</Msg>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="dtwrap">
      <table className="dt">
        <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => (
          <tr key={i}>{cols.map((c) => (
            <td key={c} className={numberCols.includes(c) ? "r num" : ""}>
              {numberCols.includes(c) ? fmtN(r[c]) : String(r[c])}
            </td>
          ))}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
