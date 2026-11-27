// Filtering and sorting for the deal board. Pure functions over the deals
// array: given the toolbar's state they return the deals to show, in order.
// Default order is best deals first: biggest discount, then biggest saving
// in dollars, then lowest price.

export function discountPercent(deal) {
  if (!deal.was || deal.was <= deal.price) return 0;
  return Math.round(((deal.was - deal.price) / deal.was) * 100);
}

export function savingDollars(deal) {
  return Math.round((deal.was - deal.price) * 100) / 100;
}

export function matchesQuery(deal, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [deal.title, deal.store, deal.category, deal.source]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(allDeals, state) {
  return allDeals.filter((deal) => {
    if (state.category && state.category !== "all" && deal.category !== state.category) return false;
    if (state.store && state.store !== "all" && deal.store !== state.store) return false;
    if (state.minDiscount && discountPercent(deal) < state.minDiscount) return false;
    if (state.signal && state.signal !== "all" && deal.signal !== state.signal) return false;
    if (!matchesQuery(deal, state.query)) return false;
    return true;
  });
}

export const SORTS = {
  "best-discount": {
    label: "Best discount first",
    compare: (a, b) =>
      discountPercent(b) - discountPercent(a) ||
      savingDollars(b) - savingDollars(a) ||
      a.price - b.price,
  },
  "biggest-saving": {
    label: "Biggest saving ($) first",
    compare: (a, b) =>
      savingDollars(b) - savingDollars(a) ||
      discountPercent(b) - discountPercent(a),
  },
  "lowest-price": {
    label: "Lowest price first",
    compare: (a, b) => a.price - b.price || discountPercent(b) - discountPercent(a),
  },
  "newest-low": {
    label: "New lowest prices first",
    compare: (a, b) => {
      const rank = { "new-low": 0, strong: 1, routine: 2, inflated: 3 };
      return (
        rank[a.signal] - rank[b.signal] ||
        discountPercent(b) - discountPercent(a)
      );
    },
  },
};

export function sortDeals(shown, sortKey) {
  const sort = SORTS[sortKey] || SORTS["best-discount"];
  return [...shown].sort(sort.compare);
}

export function filterAndSort(allDeals, state) {
  return sortDeals(applyFilters(allDeals, state), state.sort || "best-discount");
}

// Deals for the same product at other stores, cheapest first. Used by the
// detail view so a shopper can compare the same product across stores.
export function sameProductElsewhere(allDeals, deal) {
  return allDeals
    .filter((other) => other.group === deal.group && other.id !== deal.id)
    .sort((a, b) => a.price - b.price);
}
