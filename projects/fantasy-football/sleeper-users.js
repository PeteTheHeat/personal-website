export const SLEEPER_USERS = {
  "604165721953472512": { displayName: "petetheheat", ownerId: "peter" },
  "76435275316084736": { displayName: "paddles4", ownerId: "ryan" },
  "1123778934836965376": { displayName: "dcolavita", ownerId: "david" },
  "1123779230791340032": { displayName: "maldini311", ownerId: "daniel" },
  "616545753615147008": { displayName: "kjwong", ownerId: "kevin" },
  "1123808195807461376": { displayName: "Colavita65", ownerId: "mike-c" },
  "1124965013485232128": { displayName: "peterho", ownerId: "peter-ho" },
  "1126910781263564800": { displayName: "acattarozzi", ownerId: "alex" },
  "1127280736630960128": { displayName: "Greggie79", ownerId: "greg" },
  "604890311470153728": {
    displayName: "SandroFootball87",
    ownerId: "alessandro",
  },
  "1132309588071776256": { displayName: "neilraina", ownerId: "neil" },
  "1133567014829707264": { displayName: "bigolbutts", ownerId: "michael" },
  "869067929629687808": {
    displayName: "Marccappuccitti",
    ownerId: "marc",
  },
};

export function resolveSleeperOwner(userId, displayName) {
  const identity = SLEEPER_USERS[userId];
  if (!identity) {
    throw new Error(
      `Unknown Sleeper user ${userId}. Verify the account before updating the owner catalog.`,
    );
  }
  if (identity.displayName !== displayName) {
    throw new Error(
      `Sleeper display name changed for ${userId}: expected ${identity.displayName}, received ${displayName}. Verify the person before updating the owner catalog.`,
    );
  }
  return identity.ownerId;
}

export function assertUniqueSleeperOwners(ownerIds, season) {
  const duplicates = ownerIds.filter(
    (ownerId, index) => ownerIds.indexOf(ownerId) !== index,
  );
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate canonical Sleeper owner in ${season}: ${[...new Set(duplicates)].join(", ")}`,
    );
  }
}
