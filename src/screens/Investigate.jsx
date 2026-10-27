import React, { useState } from "react";
import { Head, Seg, Btn, Section, Note, Msg } from "../konverge-ui.jsx";
import { OPPS, byId, landed, countResults, CONFIDENCE_RULE } from "../data.js";
import { usd, usd0, n0, Pill, StatusPill, ConfPill, RiskPill, ResultPill, Info } from "../ui.jsx";
import { fdate } from "../konverge-ui.jsx";

const OPP_OPTIONS = OPPS.map((o) => [o.id, o.id]);

function PriceCard({ label, side, total, tip }) {
  return (
    <div className="pc">
      <div className="pc-top">
        <div>
          <div className="l">{label}{tip && <Info w={280}>{tip}</Info>}</div>
          <div className="who">{side.who}</div>
          <div className="src">{side.source} · {side.dateLabel} {fdate(side.date)}</div>
          <div style={{ marginTop: 6 }}><Pill sm tone={side.tag.startsWith("Approved") ? "neutral" : "amber"}>{side.tag}</Pill></div>
        </div>
        <div className="big num">{usd(total)}<small>Normalized landed / unit<Info w={280}>The price after converting to the same basis: US dollars, per unit, delivered to the plant. Each step that gets it there is listed below.</Info></small></div>
      </div>
      <div className="steps">
        {side.steps.map((s, i) => (
          <div key={i} className="srow">
            <span className="op">{s.op === "+" ? "+" : s.op === "→" ? "→" : ""}</span>
            <span>{s.label}</span>
            <span className={`kind ${s.kind}`}>{s.kind}</span>
            <span className="v num">{s.text || usd(s.value)}</span>
          </div>
        ))}
        <div className="srow tot">
          <span className="op">=</span>
          <span>Normalized landed cost<Info w={290}>{"Known = taken from a record (contract, quote, freight history). Converted = calculated, such as a currency or unit change. Assumed = an estimate a person should confirm."}</Info></span>
          <span className="kind blank" />
          <span className="v num">{usd(total)}</span>
        </div>
      </div>
    </div>
  );
}

function Vave({ o }) {
  return (
    <>
      <Msg kind="warn">
        <b>{o.id} is a VAVE candidate</b> — value analysis / value engineering, meaning a possible design or material change.
        There is no price comparison to investigate yet, and it should not be quantified until Engineering confirms equivalence.
      </Msg>
      <div className="two">
        <div className="ri-frame">
          <h3>{o.component}</h3>
          <p>{o.spec} · {o.category} · {o.site}</p>
          <Section>Idea under consideration</Section>
          <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{o.idea}</div>
          <Section>What is known · missing</Section>
          <ul style={{ margin: 0, paddingLeft: 17, fontSize: 12, lineHeight: 1.55 }}>
            {o.knowledge.known.map((t) => <li key={t}>Known: {t}</li>)}
            {o.knowledge.inferred.map((t) => <li key={t}>Inferred: {t}</li>)}
            {o.knowledge.missing.map((t) => <li key={t}>Missing: {t}</li>)}
          </ul>
        </div>
        <div className="ri-frame">
          <h3>Gates before any value is estimated<Info>Checks that must happen, and who owns each one, before anyone puts a number on this idea.</Info></h3>
          <p>Each gate is owned by a person or team. Nothing moves automatically.</p>
          <div className="gates" style={{ marginTop: 10 }}>
            {o.gates.map((g) => (
              <div key={g.gate} className="gate"><span className="o">{g.owner}</span><span>{g.gate}</span><Pill sm>{g.status}</Pill></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default function Investigate({ id, onPick, onBack, onNext, onEvent = () => {} }) {
  const o = byId(id);
  const [open, setOpen] = useState(false);
  const wiStep = o.cmp?.steps.find((s) => s.whatIf);
  const [wi, setWi] = useState(wiStep ? wiStep.value : 0);

  const header = (
    <>
      <Head
        eyebrow="Step 2 · Investigate price variance"
        title={`${o.id} · ${o.component}`}
        sub={`${o.spec} · ${o.category} · ${o.site}. ${o.cur ? "Check whether the two prices describe the same thing before treating the gap as real." : "A design or material idea — there is no price comparison yet."}`}
      />
      <div className="switch-row no-print">
        <span className="lbl">Opportunity<Info>Switch between the four signals in the queue without going back.</Info></span>
        <Seg value={id} onChange={onPick} options={OPP_OPTIONS} />
        <StatusPill status={o.status} sm /><ConfPill c={o.confidence} sm /><RiskPill r={o.risk} sm />
      </div>
    </>
  );

  const foot = (
    <div className="nav-foot no-print">
      <Btn onClick={onBack}>← Back to queue</Btn>
      <Btn primary onClick={onNext}>Next: compare sourcing alternatives →</Btn>
    </div>
  );

  if (!o.cur) return (<>{header}<Vave o={o} />{foot}</>);

  const curTotal = landed(o.cur.steps);
  const cmpTotal = landed(o.cmp.steps);
  const c = countResults(o.fields);
  const flagged = c.missing + c.inferred + c.mismatch;

  const wiCmp = landed(o.cmp.steps, wi);
  const wiGap = Math.round((curTotal - wiCmp) * 100) / 100;
  const breakEven = wiStep.value + o.gap;

  return (
    <>
      {header}

      <div className="pc-grid" data-tour="pc-grid">
        <PriceCard label="Current supplier price" side={o.cur} total={curTotal} tip="What is paid today under the current contract, built up to the cost of one unit arriving at the plant." />
        <PriceCard label={o.compareKind} side={o.cmp} total={cmpTotal} tip="The outside price this is compared against, with the source and date. It is converted step by step onto the same basis as the current price." />
      </div>

      <div className="diff">
        <div>
          <div className="eq num">
            <b>{usd(curTotal)}</b> − <b>{usd(cmpTotal)}</b> = <b>{usd(o.gap)} per unit</b> ({o.pct.toFixed(1)}%)
            &nbsp;× <b>{n0(o.volume)}</b> eligible units
          </div>
          <div className="cap">Eligible volume: {o.volumeNote}. The result is a screening signal, not a savings commitment.</div>
        </div>
        <div className="res">
          <div className="l">Illustrative gross annualized difference<Info>Price gap per unit × eligible units for a year. A rough size of the opportunity, before checks and extra costs, so not a saving.</Info></div>
          <div className="v num">{usd0(o.value)}</div>
        </div>
      </div>

      <button className="expander" data-tour="why-btn" onClick={() => { if (!open) onEvent("why"); setOpen((s) => !s); }} aria-expanded={open}>
        <span className="car">{open ? "▾" : "▸"}</span> Why this is comparable?
        <span className="cap" style={{ fontWeight: 600 }}>· {o.fields.length} fields checked · {flagged} flagged</span>
      </button>
      <Info w={290}>Opens a field-by-field check that the two prices describe the same thing: same specification, unit, currency, price terms, date and volume tier.</Info>

      {open && (
        <div className="ri-frame" data-tour="why-panel" style={{ marginTop: 10 }}>
          <h3>Field-by-field comparability check<Info w={300}>Match = the same. Normalized = different but converted fairly. Inferred = probably the same, not proven. Missing = not stated. Mismatch = not the same, so the comparison is weaker.</Info></h3>
          <p>Unlike specifications, units, commercial terms or time periods are flagged — never silently compared.</p>
          <div className="chk-sum">
            {Object.entries(c).filter(([, v]) => v).map(([k, v]) => (
              <span key={k} className="res-chip"><ResultPill r={k} /><span className="cap num">× {v}</span></span>
            ))}
          </div>
          <div className="dtwrap" style={{ maxHeight: "none" }}>
            <table className="dt">
              <thead><tr><th>Field</th><th>Current price</th><th>Comparison signal</th><th>Result</th><th>Note</th></tr></thead>
              <tbody>
                {o.fields.map((f) => (
                  <tr key={f.f}>
                    <td style={{ fontWeight: 700 }}>{f.f}</td>
                    <td>{f.cur}</td>
                    <td>{f.cmp}</td>
                    <td><ResultPill r={f.r} /></td>
                    <td className="cap">{f.note || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="conf-box">
            <div className="big">{o.confidence}<small>Match confidence<Info>Set by the written rule on the right, based on how many fields are missing, inferred or mismatched. No hidden score.</Info></small></div>
            <div className="conf-rule">
              {CONFIDENCE_RULE.map(([lvl, rule]) => (
                <React.Fragment key={lvl}><b>{lvl}</b><span className={lvl === o.confidence ? "on" : ""}>{rule}{lvl === o.confidence ? "  ← this signal" : ""}</span></React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <Section>What is known, inferred, missing and assumed<Info w={290}>Separates facts from guesses, so a reviewer knows exactly what to check before trusting the number.</Info></Section>
      <div className="kgrid">
        {[["Known", "known", "ink"], ["Inferred", "inferred", "amber"], ["Missing", "missing", "amber"], ["Assumed", "assumed", "amber"]].map(([l, k, tone]) => (
          <div key={k} className={`kcol ${tone}`}>
            <div className="l">{l}</div>
            {o.knowledge[k].length ? <ul>{o.knowledge[k].map((t) => <li key={t}>{t}</li>)}</ul> : <div className="none">None</div>}
          </div>
        ))}
      </div>

      <Section>What if the assumption is wrong?<Info w={290}>Drag the slider to change the weakest assumption and watch the result move. It shows how fragile the number is. Nothing is saved.</Info></Section>
      <div className="whatif" data-tour="whatif">
        <div className="whatif-row">
          <div>
            <div className="ctrl"><label>{o.whatIf.label}</label></div>
            <div className="cur num">{usd(wi)} / unit {wi !== wiStep.value && <span className="cap">(base {usd(wiStep.value)})</span>}</div>
            <input type="range" min={o.whatIf.min} max={o.whatIf.max} step={o.whatIf.step} value={wi} onChange={(e) => { setWi(Number(e.target.value)); onEvent("whatif"); }} aria-label={o.whatIf.label} />
            <div className="rl num"><span>{usd(o.whatIf.min)}</span><span>{usd(o.whatIf.max)}</span></div>
          </div>
          <div className="whatif-out">
            <div><div className="l">Comparison landed</div><div className="v num">{usd(wiCmp)}</div></div>
            <div><div className="l">Gap per unit</div><div className="v num">{wiGap > 0 ? usd(wiGap) : "No gap"}</div></div>
            <div><div className="l">Illustrative gross / yr</div><div className="v num">{wiGap > 0 ? usd0(wiGap * o.volume) : "$0"}</div></div>
          </div>
        </div>
        <Note>The gap disappears if this assumption rises above <b className="num">{usd(breakEven)}</b> / unit. Validate it before relying on the figure.</Note>
      </div>

      {foot}
    </>
  );
}
