// Rendering: turns deals into HTML for the board and the detail page.
// No network calls, no images: every card is text and numbers from data.js.

import { discountPercent, savingDollars, sameProductElsewhere } from "./filters.js";

const SIGNAL_LABELS = {
  "new-low": "New low",
  strong: "Strong deal",
  routine: "Routine sale",
  inflated: "Inflated",
};

export function formatMoney(value) {
  return "$" + value.toFixed(2).replace(/\.00$/, "");
}

export function formatChecked(iso) {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function dealCard(deal) {
  const pct = discountPercent(deal);
  const saving = savingDollars(deal);
  return `
<article class="card" data-id="${deal.id}">
  <div class="card-top">
    <span class="store-badge">${escapeHtml(deal.store)}</span>
    <span class="signal signal-${deal.signal}">${SIGNAL_LABELS[deal.signal]}</span>
  </div>
  <h3 class="card-title"><a href="#/deal/${deal.id}">${escapeHtml(deal.title)}</a></h3>
  <p class="card-category">${escapeHtml(deal.category)}</p>
  <p class="card-prices">
    <span class="price-now">${formatMoney(deal.price)}</span>
    <span class="price-was">${formatMoney(deal.was)}</span>
    <span class="price-off">-${pct}%</span>
  </p>
  <p class="card-saving">You save ${formatMoney(saving)}</p>
  <p class="card-evidence">${escapeHtml(deal.evidence)}</p>
  <p class="card-checked">Checked ${formatChecked(deal.checked)} &middot; ${escapeHtml(deal.source)}</p>
  <div class="card-actions">
    <a class="btn btn-store" href="${deal.url}" target="_blank" rel="noopener">View at ${escapeHtml(deal.store)} &nearr;</a>
    <a class="btn btn-detail" href="#/deal/${deal.id}">Details</a>
  </div>
</article>`;
}

export function boardView(shownDeals, totalDeals) {
  if (shownDeals.length === 0) {
    return `
<section class="empty">
  <h2>No deals match those filters</h2>
  <p>Try a different search word, a wider category, or a lower minimum discount. All ${totalDeals} deals are still on the board.</p>
  <button class="btn btn-store" id="clear-filters" type="button">Clear all filters</button>
</section>`;
  }
  const totalSaving = shownDeals.reduce((sum, deal) => sum + savingDollars(deal), 0);
  const bestPct = Math.max(...shownDeals.map(discountPercent));
  return `
<section class="stats" aria-label="Deal summary">
  <span><strong>${shownDeals.length}</strong> deals shown</span>
  <span>of <strong>${totalDeals}</strong> checked</span>
  <span>Best discount <strong>-${bestPct}%</strong></span>
  <span>Total savings on show <strong>${formatMoney(totalSaving)}</strong></span>
</section>
<section class="grid" aria-label="Deals">
  ${shownDeals.map(dealCard).join("\n")}
</section>`;
}

export function detailView(deal, allDeals) {
  const pct = discountPercent(deal);
  const saving = savingDollars(deal);
  const others = sameProductElsewhere(allDeals, deal);
  const comparison = others.length
    ? `
  <section class="compare">
    <h2>Same product at other stores</h2>
    <table class="compare-table">
      <thead><tr><th>Store</th><th>Price</th><th>Discount</th><th></th></tr></thead>
      <tbody>
        ${others
          .map(
            (other) => `<tr>
          <td>${escapeHtml(other.store)}</td>
          <td>${formatMoney(other.price)}</td>
          <td>-${discountPercent(other)}%</td>
          <td><a href="#/deal/${other.id}">See deal</a></td>
        </tr>`,
          )
          .join("\n")}
      </tbody>
    </table>
    <p class="compare-note">Cheapest first. Each price was checked at the time shown on its own card.</p>
  </section>`
    : `
  <section class="compare">
    <h2>Same product at other stores</h2>
    <p>No other store on this board carries this exact product right now.</p>
  </section>`;
  return `
<article class="detail">
  <p class="detail-back"><a href="#/">&larr; Back to all deals</a></p>
  <div class="card-top">
    <span class="store-badge">${escapeHtml(deal.store)}</span>
    <span class="signal signal-${deal.signal}">${SIGNAL_LABELS[deal.signal]}</span>
  </div>
  <h2 class="detail-title">${escapeHtml(deal.title)}</h2>
  <p class="card-category">${escapeHtml(deal.category)}</p>
  <p class="card-prices detail-prices">
    <span class="price-now">${formatMoney(deal.price)}</span>
    <span class="price-was">${formatMoney(deal.was)}</span>
    <span class="price-off">-${pct}%</span>
  </p>
  <p class="card-saving">You save ${formatMoney(saving)} off the usual price of ${formatMoney(deal.was)}.</p>
  <section class="assessment">
    <h2>Is it really a deal?</h2>
    <p><strong>${SIGNAL_LABELS[deal.signal]}.</strong> ${escapeHtml(deal.evidence)}</p>
  </section>
  <section class="provenance">
    <h2>Where this price was checked</h2>
    <p>Checked ${formatChecked(deal.checked)} at ${escapeHtml(deal.source)}.</p>
    <p>Prices change during Black Friday week; re-check the store page before you pay.</p>
  </section>
  <div class="card-actions detail-actions">
    <a class="btn btn-store" href="${deal.url}" target="_blank" rel="noopener">Buy at ${escapeHtml(deal.store)} &nearr;</a>
    <a class="btn btn-detail" href="#/">Back to all deals</a>
  </div>
  ${comparison}
</article>`;
}

export function notFoundView(id) {
  return `
<section class="empty">
  <h2>No deal called &ldquo;${escapeHtml(id)}&rdquo;</h2>
  <p>That deal is not on the board. It may have been removed, or the link is mistyped.</p>
  <p><a class="btn btn-store" href="#/">Back to all deals</a></p>
</section>`;
}
