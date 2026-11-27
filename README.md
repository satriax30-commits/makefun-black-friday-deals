# Deal Radar — Black Friday 2026 deals, checked

[![Black Friday deal finder](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/satriax30-commits/makefun-black-friday-deals/rank.svg)](https://make.fun/c/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/satriax30-commits/makefun-black-friday-deals/reward.svg)](https://make.fun/c/black-friday-deal-finder-01)

A static deal finder for Black Friday and Cyber Monday 2026: **43 deals from
7 stores** (Amazon, Best Buy, Walmart, Target, Costco, Kohl's, Home Depot)
across 11 categories, each checked by hand on 27 November 2026.

Every deal card shows the product, the store, the sale price, the usual
price, the discount (computed from the two prices), a signal saying whether
it is really a deal — **new low**, **strong deal** or **routine sale** — with
one line of evidence, plus the time the price was checked and the source that
named the store. Deals found at more than one store (AirPods Pro 3, MacBook
Air M5, Dyson V9, the Switch 2 bundle) compare across stores on their detail
page, cheapest first.

## Use it

Serve `app/` with any static server and open `app/index.html`:

```sh
node serve.ts
# open http://localhost:8080
```

Search, filter by category / store / minimum discount / deal signal, and sort
by best discount, biggest saving, lowest price or newest low first. Filters
can also be set from the URL, e.g.
`index.html?category=Audio&min=40&sort=best-discount`. Each deal has its own
page on a hash route (`#/deal/airpods-pro-3-amazon`). No network requests: the
deals are data in `app/data.js`, and the only outside links are the store
links on each card.

## Files

- `app/index.html` — the page and the search/filter toolbar
- `app/style.css` — the whole look (dark board, one sale-red accent)
- `app/data.js` — the 43 checked deals
- `app/filters.js` — filtering, sorting and cross-store comparison
- `app/views.js` — the board, the deal cards and the detail page
- `app/main.js` — toolbar wiring and hash routing
- `deals-sources.md` — the verification log: where every price was read
- `check-site.mjs` — logic checks (run `node check-site.mjs`)
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`

## License

MIT — see `LICENSE`.
