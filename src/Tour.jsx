import React, { useState, useEffect, useCallback, useRef } from "react";

/* Guided walkthrough. Steps with `done(ctx)` will not advance until the
   viewer has actually done the thing — the system shows, a person acts. */
export const STEPS = [
  {
    screen: "queue", target: "q-kpis",
    t: "Start with the work queue",
    b: "The demo opens on a short list of direct-material signals worth a look, not a dashboard of totals. All data is synthetic, so nobody mistakes it for real spend.",
  },
  {
    screen: "queue", target: "q-math",
    t: "See where the number comes from",
    b: "The $62,450 is three simple sums: volume × (current cost − comparison cost). It is a screening signal and is never called savings.",
    action: "Open “How the $62,450 is built”",
    done: (c) => c.events.has("math"),
  },
  {
    screen: "queue", target: "row-H-204",
    t: "Open the top signal",
    b: "H-204 ranks first: medium confidence, low risk. Click its row to investigate the price gap.",
    action: "Open H-204",
    done: (c) => c.events.has("open-H-204"),
  },
  {
    screen: "investigate", focus: "H-204", target: "pc-grid",
    t: "Two prices, made comparable",
    b: "The supplier price is FOB; the benchmark is in euros at the factory gate. Both are brought to landed cost at Plant A, and every step is labelled known, converted or assumed.",
  },
  {
    screen: "investigate", focus: "H-204", target: "why-btn",
    t: "Is it a fair comparison?",
    b: "Before trusting the $3.50 gap, check that specification, unit, price terms, date and volume tier line up.",
    action: "Open “Why this is comparable?”",
    done: (c) => c.events.has("why"),
  },
  {
    screen: "investigate", focus: "H-204", target: "why-panel",
    t: "Confidence you can explain",
    b: "Eight fields checked. One is inferred and one is missing, so confidence is Medium. The rule is written on screen, not hidden in a score.",
  },
  {
    screen: "investigate", focus: "H-204", target: "whatif",
    t: "Test the weakest assumption",
    b: "Benchmark freight is assumed. Drag the slider and watch the gap shrink. Above $5.39 per unit it disappears.",
    action: "Move the freight slider",
    done: (c) => c.events.has("whatif"),
  },
  {
    screen: "compare", compare: "M-311", target: "cmp-table",
    t: "A cheaper supplier, side by side",
    b: "M-311 has a quote $3.30 below the current source. It is compared on landed cost, lead time, MOQ, capacity, quality and qualification, not on price alone.",
  },
  {
    screen: "compare", compare: "M-311", target: "cmp-verdict",
    t: "Flagged, not recommended",
    b: "The supplier is not qualified and adds two weeks of lead time, so the screen says “requires validation”. It never suggests switching.",
  },
  {
    screen: "compare", compare: "M-311", target: "gates",
    t: "People make the call",
    b: "Engineering, quality, supply chain and finance each own a gate. Nothing changes a source, an order or a supplier automatically.",
  },
  {
    screen: "brief", target: "brief-setup",
    t: "Pull it into a brief",
    b: "The opportunities you opened are pre-selected. Creating the brief only shows a preview here. Nothing is emailed or written to any system.",
    action: "Press “Create review brief”",
    done: (c) => c.briefed.size > 0,
  },
  {
    screen: "brief", target: "brief-sum",
    t: "Ready for human review",
    b: "Each item carries its math, evidence dates, assumptions, confidence, risks and a next step, with a sign-off line for every reviewer.",
  },
  {
    screen: "queue", target: "q-table",
    t: "Back to the queue",
    b: "The items you briefed now show “Ready for review”. That is the whole loop: signal, evidence, risk, brief, human decision.",
  },
];

const BOX_W = 340, BOX_H = 270, M = 22;

/* Put the step card in whichever corner covers the highlighted area least. */
function placeBox(rect) {
  const vw = window.innerWidth, vh = window.innerHeight;
  if (vw < 700) return { left: 14, right: 14, bottom: 14 };
  const corners = [
    { pos: { right: M, bottom: M }, box: [vw - M - BOX_W, vh - M - BOX_H] },
    { pos: { right: M, top: M + 60 }, box: [vw - M - BOX_W, M + 60] },
    { pos: { left: M, bottom: M }, box: [M, vh - M - BOX_H] },
  ];
  if (!rect) return corners[0].pos;
  const overlap = ([x, y]) => {
    const w = Math.max(0, Math.min(x + BOX_W, rect.left + rect.w + 8) - Math.max(x, rect.left - 8));
    const h = Math.max(0, Math.min(y + BOX_H, rect.top + rect.h + 8) - Math.max(y, rect.top - 8));
    return w * h;
  };
  return corners.reduce((best, c) => (overlap(c.box) < overlap(best.box) ? c : best)).pos;
}

export default function Tour({ open, setOpen, ctx, nav }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const navRef = useRef(nav);
  navRef.current = nav;
  const step = open ? STEPS[i] : null;
  const blocked = step?.done ? !step.done(ctx) : false;

  const close = useCallback(() => { setOpen(false); setI(0); setRect(null); }, [setOpen]);

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, w: r.width, h: r.height });
  }, [step]);

  // Move to the step's screen only when the step changes, so the viewer's own clicks are never undone.
  useEffect(() => {
    if (!step) return;
    navRef.current(step);
    const t = setTimeout(() => {
      document.querySelector(`[data-tour="${step.target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(measure, 380);
    }, 140);
    return () => clearTimeout(t);
  }, [open, i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const h = () => measure();
    const key = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    window.addEventListener("keydown", key);
    const iv = setInterval(measure, 400);
    return () => {
      window.removeEventListener("scroll", h, true);
      window.removeEventListener("resize", h);
      window.removeEventListener("keydown", key);
      clearInterval(iv);
    };
  }, [open, measure, close]);

  if (!step) return null;
  const last = i === STEPS.length - 1;

  return (
    <>
      {rect && <div className="spot no-print" style={{ top: rect.top - 8, left: rect.left - 8, width: rect.w + 16, height: rect.h + 16 }} />}
      <div className="tourbox no-print" style={placeBox(rect)} role="dialog" aria-label="Guided walkthrough">
        <div className="tb-head">
          <span className="tb-count">Step {i + 1} of {STEPS.length}</span>
          <button className="tb-x" onClick={close} aria-label="Close the walkthrough">✕</button>
        </div>
        <div className="tb-prog"><i style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} /></div>
        <h5>{step.t}</h5>
        <p>{step.b}</p>
        {step.action && (
          <div className={`tb-act ${blocked ? "" : "ok"}`}>
            <span className="tb-tick">{blocked ? "○" : "✓"}</span>
            <span>{blocked ? step.action : "Done — carry on"}</span>
          </div>
        )}
        <div className="tb-nav">
          <button className="btn ghost small" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>Back</button>
          {last
            ? <button className="btn small" onClick={close}>Finish</button>
            : <button className="btn small" onClick={() => setI((v) => v + 1)} disabled={blocked}>{blocked ? "Do it to continue" : "Next"}</button>}
        </div>
      </div>
    </>
  );
}
