import React, { useState } from "react";
import { Disclaimer, Brand, Frame } from "./konverge-ui.jsx";
import Sidebar from "./Sidebar.jsx";
import Tour from "./Tour.jsx";
import Queue from "./screens/Queue.jsx";
import Investigate from "./screens/Investigate.jsx";
import Compare from "./screens/Compare.jsx";
import Brief from "./screens/Brief.jsx";

export default function App() {
  const [step, setStep] = useState("queue");
  const [focusId, setFocusId] = useState("H-204");
  const [compareId, setCompareId] = useState("M-311");
  const [visited, setVisited] = useState(() => new Set(["queue"]));
  const [reviewed, setReviewed] = useState(() => new Set());
  const [briefed, setBriefed] = useState(() => new Set());
  const [events, setEvents] = useState(() => new Set());
  const [tour, setTour] = useState(false);

  const markReviewed = (id) => setReviewed((r) => new Set(r).add(id));
  const logEvent = (e) => setEvents((s) => (s.has(e) ? s : new Set(s).add(e)));

  const show = (s) => { setVisited((v) => new Set(v).add(s)); setStep(s); };
  const go = (s) => { show(s); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const openFromQueue = (id) => { setFocusId(id); markReviewed(id); logEvent(`open-${id}`); go("investigate"); };
  const pickFocus = (id) => { setFocusId(id); markReviewed(id); };
  const pickCompare = (id) => { setCompareId(id); markReviewed(id); };
  // Storyline: step 3 always opens on M-311, the queue's alternative-source signal.
  const toCompare = () => { pickCompare("M-311"); go("compare"); };

  // The walkthrough moves the screen itself; scrolling is left to the tour.
  const tourNav = (s) => {
    if (s.focus) pickFocus(s.focus);
    if (s.compare) pickCompare(s.compare);
    show(s.screen);
  };

  const screens = {
    queue: <Queue briefed={briefed} onOpen={openFromQueue} onEvent={logEvent} />,
    investigate: (
      <Investigate key={focusId} id={focusId} onPick={pickFocus} onBack={() => go("queue")} onNext={toCompare} onEvent={logEvent} />
    ),
    compare: (
      <Compare key={compareId} id={compareId} fromId={focusId} onPick={pickCompare} onBack={() => go("investigate")} onNext={() => go("brief")} />
    ),
    brief: (
      <Brief reviewed={reviewed} briefed={briefed} onCreate={(ids) => setBriefed((b) => { const n = new Set(b); ids.forEach((i) => n.add(i)); return n; })}
        onBack={() => go("compare")} onQueue={() => go("queue")} />
    ),
  };

  return (
    <div className="ri-root">
      <Disclaimer />
      <div className="data-banner"><b>Illustrative data only</b> — values and suppliers are synthetic.</div>
      <div className="layout">
        <Sidebar step={step} visited={visited} onStep={go} onTour={() => setTour(true)} />
        <main className="main">
          <Frame>
            <Brand solution="Direct Material Sourcing" pills={[["Synthetic data", "ghost"]]} />
            {screens[step]}
          </Frame>
        </main>
      </div>
      <Tour open={tour} setOpen={setTour} ctx={{ events, briefed }} nav={tourNav} />
    </div>
  );
}
