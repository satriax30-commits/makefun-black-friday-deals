// Wiring: the toolbar, the hash routes and the first render.
// Routes: #/ is the board, #/deal/<id> is one deal's page. Filters can also
// be set from the page's own query string, so a filtered view is shareable:
// index.html?category=Audio&min=40&sort=best-discount
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals, CATEGORIES, STORES } from "./data.js";
import { filterAndSort, SORTS } from "./filters.js";
import { boardView, detailView, notFoundView } from "./views.js";

const app = document.getElementById("app");

const toolbar = document.getElementById("toolbar");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const storeSelect = document.getElementById("store");
const discountSelect = document.getElementById("discount");
const signalSelect = document.getElementById("signal");
const sortSelect = document.getElementById("sort");

function fillSelect(select, items, allLabel) {
  for (const item of items) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  }
  void allLabel;
}

fillSelect(categorySelect, CATEGORIES);
fillSelect(storeSelect, STORES);
for (const key of Object.keys(SORTS)) {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = SORTS[key].label;
  sortSelect.appendChild(option);
}

function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  return {
    query: params.get("q") || "",
    category: params.get("category") || "all",
    store: params.get("store") || "all",
    minDiscount: Number(params.get("min") || 0),
    signal: params.get("signal") || "all",
    sort: params.get("sort") || "best-discount",
  };
}

function stateFromToolbar() {
  return {
    query: searchInput.value,
    category: categorySelect.value,
    store: storeSelect.value,
    minDiscount: Number(discountSelect.value),
    signal: signalSelect.value,
    sort: sortSelect.value,
  };
}

function applyStateToToolbar(state) {
  searchInput.value = state.query;
  categorySelect.value = CATEGORIES.includes(state.category) ? state.category : "all";
  storeSelect.value = STORES.includes(state.store) ? state.store : "all";
  discountSelect.value = String([0, 20, 30, 40, 50].includes(state.minDiscount) ? state.minDiscount : 0);
  signalSelect.value = ["all", "new-low", "strong", "routine", "inflated"].includes(state.signal)
    ? state.signal
    : "all";
  sortSelect.value = SORTS[state.sort] ? state.sort : "best-discount";
}

function renderBoard() {
  const shown = filterAndSort(deals, stateFromToolbar());
  app.innerHTML = boardView(shown, deals.length);
  const clearButton = document.getElementById("clear-filters");
  if (clearButton) {
    clearButton.addEventListener("click", () => {
      applyStateToToolbar({
        query: "",
        category: "all",
        store: "all",
        minDiscount: 0,
        signal: "all",
        sort: "best-discount",
      });
      renderBoard();
    });
  }
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?#]+)/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const found = deals.find((deal) => deal.id === id);
    toolbar.hidden = true;
    document.title = found ? `${found.title} | Deal Radar` : "Deal not found | Deal Radar";
    app.innerHTML = found ? detailView(found, deals) : notFoundView(id);
  } else {
    toolbar.hidden = false;
    document.title = "Deal Radar — Black Friday 2026 deals, checked";
    renderBoard();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

for (const control of [searchInput, categorySelect, storeSelect, discountSelect, signalSelect, sortSelect]) {
  control.addEventListener("input", () => {
    if (!location.hash.startsWith("#/deal/")) renderBoard();
  });
}

applyStateToToolbar(readStateFromUrl());
window.addEventListener("hashchange", render);
render();
