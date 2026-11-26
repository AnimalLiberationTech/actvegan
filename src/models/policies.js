/**
 * Frontend mirrors of backend authorization policies (`../actfta-api/src/domain/policies.py`).
 *
 * UI checks are UX hints only; the backend enforces all policies authoritatively.
 */

const ADMIN_TYPES = new Set(["admin", "super_admin"]);

function normalizeUserType(actor) {
  return String(actor?.user_type ?? "").toLowerCase();
}

export function isAdmin(actor) {
  return ADMIN_TYPES.has(normalizeUserType(actor));
}

/**
 * Return whether `actor` may change `target`'s user type.
 *
 * Mirrors `can_change_user_type` in `../actfta-api/src/domain/policies.py`:
 * - No user may change their own user type.
 * - `super_admin` may change any other user's type.
 * - `admin` may change any other user's type except a `super_admin`'s.
 * - Regular `user` and `disabled` accounts cannot change user types.
 */
export function canChangeUserType(actor, target) {
  const actorId = actor?.id ?? actor?.user_id;
  const targetId = target?.id ?? target?.user_id;
  if (!actorId || !targetId || actorId === targetId) {
    return false;
  }

  const actorType = normalizeUserType(actor);
  const targetType = normalizeUserType(target);

  if (actorType === "super_admin") {
    return true;
  }
  return actorType === "admin" && targetType !== "super_admin";
}

export function canCreatePublicTask(actor) {
  return isAdmin(actor);
}

export function canCreateTask(actor, visibility = "private") {
  if (String(visibility ?? "").toLowerCase() === "public") {
    return canCreatePublicTask(actor);
  }
  return true;
}

export function canChangeTaskVisibility(actor) {
  return isAdmin(actor);
}

export function canManageTools(actor) {
  return isAdmin(actor);
}

export function canManageSkills(actor) {
  return isAdmin(actor);
}
