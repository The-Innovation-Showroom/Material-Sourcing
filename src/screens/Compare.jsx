import React from "react";
import { Head, Seg, Btn, Section, Note, Msg, Kpis } from "../konverge-ui.jsx";
import { OPPS, byId } from "../data.js";
import { usd, usd0, n0, Pill, StatusPill, Info } from "../ui.jsx";

const OPP_OPTIONS = OPPS.map((o) => [o.id, o.id]);

const ROW_TIPS = {
  "Normalized landed cost": "Price + freight + duty and handling for one unit arriving at the plant, worked out the same way for both suppliers.",
  "Freight / logistics": "Cost and transit time to get the parts to the plant. A longer, cross-border lane adds delay and more things that can go wrong.",
  "Lead time": "Time from placing an order to receiving it. Longer lead time means holding more stock to avoid running out.",
  "Minimum order quantity (MOQ)": "The smallest order the supplier will accept. A higher MOQ means buying in bigger batches and holding more stock.",
  "Capacity": "How many units a year the supplier can make for us. Stated means they told us; confirmed means it has been checked.",
  "Quality · defective parts per million (PPM)": "How many parts in every million received were faulty over the last 12 months. Lower is better.",
  "Delivery · on time, in full (OTIF)": "Share of deliveries that arrived on time with the full quantity. Higher is better.",
  "Qualification status": "Whether the supplier has passed the approval process to supply production parts. Until it has, it cannot be used.",
};

function Gates({ gates }) {
  return (
    <div className="gates">
      {gates.map((g) => (
        <div key={g.gate} className="gate">
          <span className="o">{g.owner}</span>
          <span>{g.gate}</span>
          <Pill sm tone={g.status === "Not started" ? "neutral" : "info"}>{g.status}</Pill>
        </div>
      ))}
    </div>
  );
}

export default function Compare({ id, fromId, onPick, onBack, onNext }) {
  const o = byId(id);
  const a = o.alt;

  const header = (
    <>
      <Head
        eyebrow="Step 3 · Compare sourcing alternatives"
        title={a ? `${o.id} · current source vs potential alternative` : `${o.id} · ${o.component}`}
        sub="Price alone does not decide the preferred source. Landed cost, logistics, lead time, capacity, quality and qualification are compared side by side, and unresolved items are flagged — not recommended."
      />
      <div className="switch-row no-print">
        <span className="lbl">Opportunity<Info>Switch between the four signals in the queue. Only M-311 has an alternative supplier to compare.</Info></span>
        <Seg value={id} onChange={onPick} options={OPP_OPTIONS} />
        <StatusPill status={o.status} sm />
      </div>
      {fromId && fromId !== id && id === "M-311" && (
        <Note>Showing M-311, the queue’s alternative-source signal. {byId(fromId).id} has no alternative supplier to compare.</Note>
      )}
    </>
  );

  const foot = (
    <div className="nav-foot no-print">
      <Btn onClick={onBack}>← Back to investigation</Btn>
      <Btn primary onClick={onNext}>Next: draft decision brief →</Btn>
    </div>
  );

  if (!a) {
    return (
      <>
        {header}
        <Msg kind="info">{o.noAlt}</Msg>
        <div className="ri-frame">
          <h3>Who needs to act before this can progress<Info>Checks that must happen, and who owns each one, before this item can move forward.</Info></h3>
          <p>Each gate is owned by a person or team. Nothing moves automatically.</p>
          <div style={{ marginTop: 10 }}><Gates gates={o.gates} /></div>
        </div>
        {foot}
      </>
    );
  }

  const weekly = o.volume / 52;
  const extraUnits = Math.round(weekly * a.extraWeeks);
  const extraValue = extraUnits * o.compare;
  const open = o.gates.filter((g) => g.status === "Not started").length;

  return (
    <>
      {header}

      <Kpis
        items={[
          [<>Quoted difference<Info>How much cheaper the alternative’s quote is per unit, after both are brought to landed cost.</Info></>, `${usd(o.gap)} / unit`, `${o.pct.toFixed(1)}% · ${usd0(o.value)} illustrative gross annualized`],
          [<>Lead time<Info>The alternative takes longer to deliver, so more stock must be held to avoid running short.</Info></>, `+${a.extraWeeks} weeks`, `≈ ${n0(extraUnits)} more units held in the pipeline`, "warn"],
          [<>Open decision gates<Info>Checks still to be done by the teams that own them. Nothing moves until they are done.</Info></>, `${open} of ${o.gates.length}`, "Engineering, quality, supply chain, finance", "warn"],
          [<>Qualification<Info>The alternative has not passed the approval process, so it cannot supply production parts today.</Info></>, "Not qualified", "Alternative cannot supply production today", "bad"],
        ]}
      />

      <div className="cmp-wrap" data-tour="cmp-table">
        <table className="cmp">
          <thead>
            <tr>
              <th><div className="l">Factor<Info w={280}>Everything that matters when choosing a supplier, not just price. Coloured tags flag where the alternative is weaker or unproven.</Info></div></th>
              <th><div className="l">Current source</div><div className="n">{o.cur.who}</div><Pill sm>{o.cur.tag}</Pill></th>
              <th><div className="l">Potential alternative<Info>A supplier that has quoted but is not approved yet. Shown for comparison only.</Info></div><div className="n">{o.cmp.who}</div><Pill sm tone="red">Not qualified</Pill> <Pill sm tone="amber">{o.cmp.tag}</Pill></th>
            </tr>
          </thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.k}>
                <td className="k">{r.k}{ROW_TIPS[r.k] && <Info w={280}>{ROW_TIPS[r.k]}</Info>}</td>
                <td className="num">{r.cur}</td>
                <td className="o num">
                  <div className="flagcell"><span>{r.opt}</span>{r.flag && <Pill sm tone={r.flag[1]}>{r.flag[0]}</Pill>}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-tour="cmp-verdict"><Msg kind="warn">
        <b>Requires validation — this is not a recommendation to switch.</b> The lower quoted cost ({usd(o.gap)} / unit) is offset by an
        unqualified supplier, a lead time two weeks longer, unverified capacity and a higher minimum order. Engineering, quality and
        sourcing teams retain decision authority.
      </Msg></div>

      <div className="two">
        <div className="ri-frame">
          <h3>Lead-time effect, shown openly<Info w={290}>Two extra weeks of lead time means about two extra weeks of parts sitting in stock. This works out roughly how many units and how much money that ties up.</Info></h3>
          <p>Illustrative only · a one-time working-capital effect, not netted against the price difference.</p>
          <div className="math" style={{ marginTop: 10, boxShadow: "none" }}>
            <div className="math-row"><span>Weekly use</span><span className="f num">{n0(o.volume)} units ÷ 52 weeks</span><b className="num">≈ {weekly.toFixed(0)} units</b></div>
            <div className="math-row"><span>Extra stock</span><span className="f num">≈ {weekly.toFixed(1)} × {a.extraWeeks} extra weeks</span><b className="num">≈ {n0(extraUnits)} units</b></div>
            <div className="math-row"><span>Held value</span><span className="f num">{n0(extraUnits)} × {usd(o.compare)}</span><b className="num">≈ {usd0(extraValue)}</b></div>
          </div>
          <Note>Finance would validate carrying cost and whether safety stock needs to rise. No figure here is netted into the opportunity value.</Note>
        </div>
        <div className="ri-frame" data-tour="gates">
          <h3>Decision gates · who decides<Info w={290}>Each check has an owner. In a live system these would link to the existing approval process; here they are a static example.</Info></h3>
          <p>Nothing changes source, order or supplier status automatically.</p>
          <div style={{ marginTop: 10 }}><Gates gates={o.gates} /></div>
        </div>
      </div>

      {foot}
    </>
  );
}
