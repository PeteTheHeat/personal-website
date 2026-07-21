const DEFAULT_SORT_DIRECTIONS = {
  manager: "asc",
  seasons: "desc",
  wins: "desc",
  winPct: "desc",
  points: "desc",
  average: "desc",
  playoffs: "desc",
  titles: "desc",
  sackos: "desc",
};

const NUMERIC_SORT_VALUES = {
  seasons: (owner) => owner.seasons,
  wins: (owner) => owner.wins,
  winPct: (owner) => owner.winPct,
  points: (owner) => owner.pointsFor,
  average: (owner) => owner.averagePoints,
  playoffs: (owner) => owner.playoffs,
  titles: (owner) => owner.championships,
  sackos: (owner) => owner.sackos,
};

export function getDefaultSortDirection(sortBy) {
  return DEFAULT_SORT_DIRECTIONS[sortBy] ?? "desc";
}

export function sortOwners(owners, sortBy, sortDirection) {
  const direction = sortDirection === "asc" ? 1 : -1;

  return [...owners].sort((left, right) => {
    let primaryComparison;

    if (sortBy === "manager") {
      primaryComparison = left.name.localeCompare(right.name);
    } else {
      const getValue = NUMERIC_SORT_VALUES[sortBy] ?? NUMERIC_SORT_VALUES.wins;
      primaryComparison = getValue(left) - getValue(right);
    }

    if (primaryComparison !== 0) {
      return primaryComparison * direction;
    }

    if (sortBy !== "wins") {
      const winsComparison = right.wins - left.wins;
      if (winsComparison !== 0) {
        return winsComparison;
      }
    }

    if (sortBy !== "titles") {
      const titleComparison = right.championships - left.championships;
      if (titleComparison !== 0) {
        return titleComparison;
      }
    }

    if (sortBy !== "winPct") {
      const winPctComparison = right.winPct - left.winPct;
      if (winPctComparison !== 0) {
        return winPctComparison;
      }
    }

    return left.name.localeCompare(right.name);
  });
}
