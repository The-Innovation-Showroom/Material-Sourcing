import React, { useMemo, useState } from "react";
import { Head, Kpis, Chip, Seg, Msg, Note } from "../konverge-ui.jsx";
import { OPPS, TOTAL, priced, byPriority, byValue } from "../data.js";
import { usd, usd0, n0, StatusPill, ConfPill, RiskPill, SignalTags, Info } from "../ui.jsx";

const GROUPS = [
  ["type", "Type", ["Price variance", "Alternative source", "Price benchmark", "VAVE candidate"]],
  ["site", "Site", ["Plant A", "Plant B"]],
  ["confidence", "Confidence", ["High", "Medium", "Low", "Not assessed"]],
  ["risk", "Risk", ["Low", "Medium", "High"]],
];

export default function Queue({ briefed, onOpen, onEvent = () => {} }) {
  const [filters, setFilters] = useState({ type: null, site: null, confidence: null, risk: null });
  const [sort, setSort] = useState("priority");
  const [showMath, setShowMath] = useState(false);

  const ranked = useMemo(() => [...OPPS].sort(byPriority), []);
  const rows = useMemo(() => {
    const list = ranked.filter((o) => Object.entries(filters).every(([k, v]) => !v || o[k] === v));
    return sort === "value" ? [...list].sort(byValue) : list;
  }, [ranked, filters, sort]);

  const toggle = (k, v) => setFilters((f) => ({ ...f, [k]: f[k] === v ? null : v }));
  const anyFilter = Object.values(filters).some(Boolean);

  return (
    <>
      <Head
        eyebrow="Step 1 · Opportunity queue"
        title={<>Direct-material opportunities to review<Info w={300}>A short work list of parts where the data suggests you may be paying more than needed. Click any row to see the evidence behind it.</Info></>}
        sub="Signals that merit a closer look, ranked for review. Every value on this screen is a screening signal, not a savings commitment — each item still needs comparability checks and human review."
      />

      <div data-tour="q-kpis">
      <Kpis
        items={[
          [<>Signals in queue<Info>How many possible opportunities the system flagged. A signal is a lead to check, not a confirmed saving.</Info></>, OPPS.length, `${priced.length} priced · ${OPPS.length - priced.length} not yet quantified`],
          [<>Illustrative gross annualized difference<Info w={300}>Adds up volume × price gap for the three priced items. <b>Gross</b> means before any extra costs (switching, testing, stock). It is not a savings figure.</Info></>, usd0(TOTAL), "3 priced signals · before overlap checks and validation"],
          [<>Briefs ready for review<Info>Items that have a summary prepared for people to review. Goes up when you create a brief in step 4.</Info></>, briefed.size, briefed.size ? "Drafted this session · awaiting human review" : "None drafted yet"],
          [<>Validated by sourcing, engineering, quality<Info>Stays at zero on purpose: only people can validate an opportunity. The system never marks one as approved.</Info></>, 0, "No opportunity has passed validation"],
        ]}
      />
      </div>

      <div className="q-tools">
        <div style={{ display: "flex", alignItems: "center" }}>
        <button className="expander" data-tour="q-math" onClick={() => { if (!showMath) onEvent("math"); setShowMath((s) => !s); }} aria-expanded={showMath}>
          <span className="car">{showMath ? "▾" : "▸"}</span> How the {usd0(TOTAL)} is built
        </button>
        <Info>Opens the sum line by line, so anyone can check the number by hand.</Info>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="vr-filter-label">Order<Info>Priority puts the most reliable comparisons first, then the bigger values. Indicative value sorts by size of the gap only.</Info></span>
          <Seg value={sort} onChange={setSort} options={[["priority", "Priority"], ["value", "Indicative value"]]} />
        </div>
      </div>

      {showMath && (
        <div className="math">
          <div className="ri-sec" style={{ marginTop: 0 }}>Eligible annual volume × (current normalized landed cost − comparison cost)</div>
          {OPPS.map((o) => (
            <div key={o.id} className="math-row">
              <span className="mono">{o.id}</span>
              <span className="f num">
                {o.value != null
                  ? <>{n0(o.volume)} × ({usd(o.current)} − {usd(o.compare)}) <span className="cap">· {o.compareKind.toLowerCase()}</span></>
                  : <span className="cap">Not quantified — engineering assessment comes first</span>}
              </span>
              <b className="num">{o.value != null ? usd0(o.value) : "—"}</b>
            </div>
          ))}
          <div className="math-row total">
            <span>Total</span>
            <span className="f">Illustrative gross annualized difference · not a savings estimate</span>
            <b className="num">{usd0(TOTAL)}</b>
          </div>
          <Note>
            Overlap check: the three priced signals cover different components, so no volume is counted twice in this sample.
            A formal overlap check is still required before any figures are combined in a business case.
          </Note>
        </div>
      )}

      <div className="vr-filters">
        {GROUPS.map(([k, label, vals]) => (
          <div key={k} className="vr-filter-group">
            <span className="vr-filter-label">{label}</span>
            {vals.map((v) => (
              <Chip key={v} on={filters[k] === v} onClick={() => toggle(k, v)}>
                {v} <span style={{ opacity: 0.6 }}>{OPPS.filter((o) => o[k] === v).length}</span>
              </Chip>
            ))}
          </div>
        ))}
        <Info w={290}>Narrow the list by type of opportunity, plant, how reliable the comparison is, or how risky acting on it would be. Click a chip again to clear it.</Info>
        {anyFilter && <button className="vr-chip clear" onClick={() => setFilters({ type: null, site: null, confidence: null, risk: null })}>Clear</button>}
      </div>

      <div className="q-count">
        Showing {rows.length} of {OPPS.length} · {sort === "priority" ? "Priority = confidence first, then indicative value; unquantified items last" : "Ordered by indicative gross annualized difference"}
      </div>

      {rows.length === 0 ? (
        <Msg kind="info">No opportunities match the current filters.</Msg>
      ) : (
        <div className="dtwrap" data-tour="q-table" style={{ marginTop: 8, maxHeight: "none" }}>
          <table className="q-table">
            <thead>
              <tr>
                <th>#<Info>Rank in the queue under the current order.</Info></th>
                <th>Opportunity</th>
                <th>Component · site<Info w={290}>The part, its category and plant. The small tags show which of the four data sources fed this signal: Spend, BOM, Supplier, Price. Faded tags were not used.</Info></th>
                <th className="r">Current normalized<br />landed cost<Info w={290}>What one unit really costs once it reaches the plant: price + freight + duty and handling, in US dollars. Putting every price on this same basis is what makes them comparable.</Info></th>
                <th className="r">Comparison signal<Info w={290}>The price we compare against: a market benchmark or another supplier’s quote, also brought to landed cost. A benchmark is a market signal, not an offer anyone has made.</Info></th>
                <th className="r">Eligible<br />annual volume<Info>Units the products will need over the next 12 months (from the BOM) that are not already locked into a fixed-price contract.</Info></th>
                <th className="r">Indicative gross<br />annualized difference<Info>Eligible volume × the price gap per unit. A rough size of the opportunity, before checks and extra costs.</Info></th>
                <th>Confidence · risk<Info w={300}><b>Confidence</b>: how sure we are the two prices describe the same thing (the rule is shown on the next screen). <b>Risk</b>: what could go wrong if someone acted on it, such as an unapproved supplier or a design change.</Info></th>
                <th>Status · key caveat<Info>Where the item stands and the one thing a reviewer must know before trusting it.</Info></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const rank = ranked.indexOf(o) + 1;
                return (
                  <tr key={o.id} data-tour={`row-${o.id}`} onClick={() => onOpen(o.id)}>
                    <td><span className="q-rank num">{rank}</span></td>
                    <td><div className="id mono">{o.id}</div><div className="sub">{o.type}</div></td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{o.component}</div>
                      <div className="sub">{o.category} · {o.site}</div>
                      <SignalTags used={o.signals} />
                    </td>
                    <td className="r num">{o.current != null ? <><b>{usd(o.current)}</b><div className="sub">per unit</div></> : <span className="sub">Not established</span>}</td>
                    <td className="r num">
                      {o.compare != null ? <b>{usd(o.compare)}</b> : <span className="sub">—</span>}
                      <div className="sub">{o.compareKind}</div>
                    </td>
                    <td className="r num">{o.volume != null ? n0(o.volume) : <span className="sub">Not yet validated</span>}{o.volume != null && <div className="sub">units</div>}</td>
                    <td className="r num">
                      {o.value != null ? <><div className="val">{usd0(o.value)}</div><div className="sub">illustrative · gross</div></> : <span className="sub">Do not quantify yet</span>}
                    </td>
                    <td><div className="stack"><ConfPill c={o.confidence} sm /><RiskPill r={o.risk} sm /></div></td>
                    <td>
                      <div className="stack"><StatusPill status={o.status} sm />{briefed.has(o.id) && <StatusPill status="Ready for review" sm />}</div>
                      <div className="cav">{o.caveat}</div>
                    </td>
                    <td className="r"><button className="open" onClick={(e) => { e.stopPropagation(); onOpen(o.id); }}>Open ›</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Note>
        Sites, component IDs, suppliers and values are fictional. A value in this queue is an estimate for screening only;
        it is not a commitment, a net figure, or an estimate of any real company's spend.
      </Note>
    </>
  );
}
