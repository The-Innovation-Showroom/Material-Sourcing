import React, { useState } from "react";
import { Head, Btn, Section, Msg, fdate } from "../konverge-ui.jsx";
import { OPPS, byId, AS_OF, countResults } from "../data.js";
import { usd, usd0, n0, Pill, StatusPill, ConfPill, RiskPill, Info } from "../ui.jsx";

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

function OppSection({ o }) {
  const c = countResults(o.fields);
  const parts = Object.entries(c).filter(([, v]) => v).map(([k, v]) => `${v} ${k}`);
  return (
    <div className="doc-opp">
      <h4>
        <span className="mono">{o.id}</span> · {o.component} <span className="cap" style={{ fontWeight: 600 }}>{o.type} · {o.site}</span>
        <ConfPill c={o.confidence} sm /> <RiskPill r={o.risk} sm />
      </h4>
      <Section>Opportunity rationale</Section>
      <p>{o.rationale}</p>

      <div className="doc-grid">
        <div>
          <Section>Comparison math<Info>The same sum shown on the queue, written out so a reviewer can check it by hand.</Info></Section>
          {o.value != null ? (
            <table className="doc-math num">
              <tbody>
                <tr><td>Current normalized landed cost</td><td className="r">{usd(o.current)}</td></tr>
                <tr><td>{o.compareKind}</td><td className="r">{usd(o.compare)}</td></tr>
                <tr><td>Difference per unit</td><td className="r">{usd(o.gap)} ({o.pct.toFixed(1)}%)</td></tr>
                <tr><td>Eligible annual volume</td><td className="r">{n0(o.volume)}</td></tr>
                <tr className="t"><td>Illustrative gross annualized difference</td><td className="r">{usd0(o.value)}</td></tr>
              </tbody>
            </table>
          ) : (
            <p className="cap">Not quantified. A value will only be estimated after Engineering confirms equivalence.</p>
          )}
        </div>
        <div>
          <Section>Evidence and source dates</Section>
          {o.cur ? (
            <ul>
              <li>Current: {o.cur.who} · {o.cur.source.toLowerCase()} · {o.cur.dateLabel.toLowerCase()} {fdate(o.cur.date)}</li>
              <li>Comparison: {o.cmp.who} · {o.cmp.source} · {o.cmp.dateLabel.toLowerCase()} {fdate(o.cmp.date)}</li>
              <li>BOM usage: {o.volumeNote}</li>
            </ul>
          ) : (
            <ul>{o.knowledge.known.map((t) => <li key={t}>{t}</li>)}</ul>
          )}
          <Section>Data confidence<Info>How sure we are the two prices describe the same thing, with the count of fields that matched, were missing or did not match.</Info></Section>
          <p>
            <b>{o.confidence}.</b>{" "}
            {o.fields.length ? `${o.fields.length} fields checked: ${parts.join(", ")}.` : "No price comparison yet."}
          </p>
        </div>
        <div>
          <Section>Assumptions<Info>Everything that was estimated, inferred or missing. These are the things a reviewer should check first.</Info></Section>
          <ul>
            {[...o.knowledge.assumed, ...o.knowledge.inferred.map((t) => `Inferred: ${t}`)].map((t) => <li key={t}>{t}</li>)}
            {o.knowledge.missing.map((t) => <li key={t}>Missing: {t}</li>)}
          </ul>
        </div>
        <div>
          <Section>Potential risks</Section>
          <ul>{o.risks.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
      <Section>Suggested next step<Info>A proposed action and an owner. It is a suggestion for the review, not something the system does.</Info></Section>
      <p>{o.nextStep} <span className="cap">Owner: {o.owner}.</span></p>
    </div>
  );
}

export default function Brief({ reviewed, briefed, onCreate, onBack, onQueue }) {
  const defaults = OPPS.filter((o) => reviewed.has(o.id)).map((o) => o.id);
  const [sel, setSel] = useState(defaults.length ? defaults : ["H-204", "M-311"]);
  const [made, setMade] = useState(null); // ids in the generated brief

  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const create = () => { const ids = OPPS.map((o) => o.id).filter((i) => sel.includes(i)); setMade(ids); onCreate(ids); };

  const opps = (made || []).map(byId);
  const total = opps.reduce((s, o) => s + (o.value || 0), 0);
  const quantified = opps.filter((o) => o.value != null).length;
  const reviewers = [...new Set(opps.flatMap((o) => o.gates.map((g) => g.owner)))];
  const stale = made && !sameSet(made, sel);

  return (
    <>
      <Head
        eyebrow="Step 4 · Sourcing decision brief"
        title="Review-ready summary for human decision"
        sub="Pull the rationale, comparison math, evidence, assumptions, confidence, risks and a suggested next step into one brief for sourcing, engineering and quality to review."
      />

      <div className="ri-frame no-print" data-tour="brief-setup">
        <div className="brief-setup">
          <div>
            <h3>Opportunities to include<Info>Pre-ticked from the items you opened in this session. Tick or untick to choose what goes into the brief.</Info></h3>
            <p>Pre-selected from what you opened in this session.</p>
            <div className="pick">
              {OPPS.map((o) => (
                <label key={o.id}>
                  <input type="checkbox" checked={sel.includes(o.id)} onChange={() => toggle(o.id)} />
                  <b className="mono">{o.id}</b> <small>{o.component}</small>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Btn primary={!made || stale} disabled={!sel.length || (made && !stale)} onClick={create}>
            {made ? (stale ? "Update review brief" : "Brief created ✓") : "Create review brief"}
          </Btn><Info w={290}>Builds the summary on this screen only. Nothing is emailed, saved to ERP or sent to a supplier.</Info></div>
        </div>
        <Msg kind="info">
          Creates a local preview only. Nothing is emailed, no ERP record or purchase order is changed, no supplier is contacted and no approval workflow starts.
        </Msg>
      </div>

      {!made && <Msg kind="info">Select one or more opportunities and choose “Create review brief” to preview the summary.</Msg>}

      {made && (
        <div className="doc">
          <div className="doc-head">
            <div>
              <div className="ri-ey">Draft for human review · not a decision</div>
              <h3>Sourcing review brief</h3>
              <div className="meta">Prepared {fdate(AS_OF)} · {opps.length} {opps.length === 1 ? "opportunity" : "opportunities"} · synthetic data</div>
            </div>
            <StatusPill status="Ready for review" />
          </div>
          {stale && <Msg kind="warn">The selection above has changed. Choose “Update review brief” to refresh this preview.</Msg>}

          <div className="doc-sum" data-tour="brief-sum">
            <div>
              <div className="l">Illustrative gross annualized difference<Info>Total of the price gaps × volumes for the items in this brief. Not savings: before checks and extra costs.</Info></div>
              <div className="v num">{quantified ? usd0(total) : "—"}</div>
              <div className="s">{quantified} priced {quantified === 1 ? "signal" : "signals"} · before overlap checks and validation · not a savings estimate</div>
            </div>
            <div>
              <div className="l">Lowest data confidence<Info>The weakest comparison in the brief, so reviewers know how much to trust the total.</Info></div>
              <div className="v">{["Low", "Medium", "High", "Not assessed"].find((l) => opps.some((o) => o.confidence === l)) || "—"}</div>
              <div className="s">See each section for fields checked and gaps</div>
            </div>
            <div>
              <div className="l">Decision status<Info>Always pending until people sign off below. The system never approves anything.</Info></div>
              <div className="v">Pending human review</div>
              <div className="s">Reviewers: {reviewers.join(", ")}</div>
            </div>
          </div>

          {opps.map((o) => <OppSection key={o.id} o={o} />)}

          <div className="doc-opp">
            <h4>Review and sign-off<Info>One line per team that must review. In a live version this would feed the existing approval process.</Info></h4>
            <table className="signoff">
              <tbody>
                {reviewers.map((r) => (
                  <tr key={r}><td className="box">☐</td><td style={{ fontWeight: 700, width: 140 }}>{r}</td><td className="cap">Decision · comments</td><td><span className="line" /></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="doc-foot">
            Generated locally as a preview. Figures are illustrative gross differences from synthetic data — not committed savings,
            and not net of qualification, inventory or transition costs. All sourcing
            decisions remain with the reviewing teams.
          </div>
        </div>
      )}

      <div className="nav-foot no-print">
        <Btn onClick={onBack}>← Back to comparison</Btn>
        <Btn primary={!!made && !stale} onClick={onQueue}>Return to opportunity queue →</Btn>
      </div>
    </>
  );
}
