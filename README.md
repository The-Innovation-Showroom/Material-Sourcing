# Direct Material Sourcing · V0 demo

A clickable concept demo built to the "Direct Material Sourcing V0 Demo Build Brief"
(27 Oct 2026). All data, values and suppliers are synthetic.

## The story it walks through

1. **Opportunity queue.** Four signals, ranked for review. The $62,450 shown is an
   illustrative gross difference, never "savings".
2. **Investigate price (H-204).** Normalizes both prices to landed cost and checks
   that they are comparable field by field ("Why this is comparable?").
3. **Compare sources (M-311).** The cheaper supplier is flagged as needing
   validation, not recommended, because it is unqualified and has a longer lead time.
4. **Decision brief.** Creates a local preview for human review. Nothing is sent
   or changed anywhere.

## Added beyond the brief

- **Navigate me through** (top of the sidebar): a 13-step guided walkthrough that
  highlights each part of the screen. Five steps wait until the viewer actually does
  the action (open the math, open H-204, check comparability, move the slider,
  create the brief). Press Esc or ✕ to leave it at any time.

- A what-if slider on the key assumption, showing the point where the price gap disappears
- A Known / Inferred / Missing / Assumed panel for each opportunity
- A plain-language confidence rule instead of a score
- A lead-time effect calculation (extra stock held), kept separate from the value
- Decision gates showing who owns each check
- Small “i” buttons across every screen: hover (or tap) to see what that part does, in plain language
- A sidebar with the hypothesis, the questions to validate, and a glossary of terms
- The queue updates to "Ready for review" after a brief is created

## Run it

```
npm install
npm run dev        # local preview
npm run build      # production build
```

## Deploy (Vercel) and password

1. Push this folder to a GitHub repository.
2. In Vercel: Add New → Project → import the repository → Deploy. The default settings work.

Anyone with the link sees a password screen. The password is **Kdemo@123**.
After entering it once, a browser stays signed in for 7 days.

- To change the password, add an environment variable `DEMO_PASSWORD` in the
  Vercel project settings and redeploy. No code change is needed.
- `middleware.js` runs the password check. Keep it beside `package.json` and don't rename it.
- The password screen appears only on Vercel. `npm run dev` on your own computer opens without one.

## Change the data

All numbers, suppliers and text are in `src/data.js`. Totals, percentages,
confidence levels and the break-even point are calculated from it.
