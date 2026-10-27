import React, { useRef, useState, useEffect } from "react";
import { SIGNALS, RESULT } from "./data.js";

export const usd = (v, dp = 2) =>
  "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
export const usd0 = (v) => usd(v, 0);
export const n0 = (v) => Number(v).toLocaleString("en-US");

/** Verdict pill — amber, red, neutral or info. Never orange. */
export const Pill = ({ tone = "neutral", sm, children, title }) => (
  <span className={`pill ${tone} ${sm ? "sm" : ""}`} title={title}>{children}</span>
);

const STATUS_TONE = {
  "Benchmark only": "amber",
  "Supplier not qualified": "red",
  "Low confidence": "amber",
  "Needs validation": "amber",
  "Needs engineering review": "amber",
  "Ready for review": "info",
};
export const StatusPill = ({ status, sm }) => <Pill tone={STATUS_TONE[status] || "neutral"} sm={sm}>{status}</Pill>;

const CONF_TONE = { High: "neutral", Medium: "neutral", Low: "amber", "Not assessed": "neutral" };
export const ConfPill = ({ c, sm }) => <Pill tone={CONF_TONE[c]} sm={sm}>{c === "Not assessed" ? "Not assessed" : `${c} confidence`}</Pill>;

const RISK_TONE = { Low: "neutral", Medium: "amber", High: "red" };
export const RiskPill = ({ r, sm }) => <Pill tone={RISK_TONE[r]} sm={sm}>{r} risk</Pill>;

export const ResultPill = ({ r }) => {
  const [label, tone, glyph] = RESULT[r];
  return <Pill tone={tone} sm><span className="g">{glyph}</span> {label}</Pill>;
};

export const SignalTags = ({ used }) => (
  <div className="sigs">
    {Object.entries(SIGNALS).map(([k, [label, desc]]) => (
      <span key={k} className={`sig ${used.includes(k) ? "" : "off"}`} title={`${label} — ${used.includes(k) ? "used" : "not used"} for this signal`}>
        {label === "External price signal" ? "Price" : label === "Supplier performance" ? "Supplier" : label === "BOM usage" ? "BOM" : label}
      </span>
    ))}
  </div>
);

/**
 * Small "i" button. Hover (or tap / keyboard focus) shows a plain-language
 * explanation of what the thing next to it does. The tip is fixed-positioned
 * so it is never clipped by a scrolling table.
 */
export function Info({ children, w = 270, label = "What this means" }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const hide = () => setPos(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const width = Math.min(w, vw - 24);
    const left = Math.max(12, Math.min(r.left + r.width / 2 - width / 2, vw - width - 12));
    const above = r.bottom > vh - 190;
    setPos({ left, top: above ? r.top - 8 : r.bottom + 8, above, width });
  };
  useEffect(() => {
    if (!pos) return;
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => { window.removeEventListener("scroll", hide, true); window.removeEventListener("resize", hide); };
  }, [pos]);
  return (
    <span className="info-wrap" onMouseEnter={show} onMouseLeave={hide}>
      <button type="button" ref={ref} className="info" aria-label={label}
        onFocus={show} onBlur={hide} onClick={(e) => { e.stopPropagation(); e.preventDefault(); pos ? hide() : show(); }}>i</button>
      {pos && (
        <span className="info-tip" role="tooltip"
          style={{ left: pos.left, top: pos.top, width: pos.width, transform: pos.above ? "translateY(-100%)" : "none" }}>
          {children}
        </span>
      )}
    </span>
  );
}
