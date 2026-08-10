/**
 * Shared admin UI toolkit — one import path for every /admin page:
 *
 *   import { AdminPageHeader, AdminTable, StatusBadge } from "@/components/admin";
 *
 * Everything here is a Server Component and none of it touches Supabase, so it
 * can be imported from any admin page without dragging server-only code along.
 *
 * | Export           | Props                                                                   |
 * |------------------|-------------------------------------------------------------------------|
 * | AdminPageHeader  | title, description?, count?, children?, className?                       |
 * | AdminCard        | children?, title?, description?, actions?, padded?, as?, className?      |
 * | AdminDetail      | label, children, className?                                              |
 * | AdminTable<T>    | columns, rows, getKey, caption?, empty?, className?                      |
 * | AdminList        | children, className?                                                     |
 * | AdminListItem    | title, meta?, badge?, actions?, children?, className?                    |
 * | StatusBadge      | status, label?, className?                                               |
 * | AdminEmpty       | title, description?, children?, className?                               |
 * | AdminAlert       | tone?, title?, children?, role?, className?  (= the public `Alert`)      |
 * | FilterTabs       | options, active, basePath, param?, label?, className?                    |
 * | AdminStat        | label, value, hint?, href?, attention?, className?                       |
 */

export { AdminPageHeader } from "./AdminPageHeader";
export { AdminCard, AdminDetail } from "./AdminCard";
export { AdminTable, AdminList, AdminListItem, type AdminColumn } from "./AdminTable";
export { StatusBadge, type AdminStatus } from "./StatusBadge";
export { AdminEmpty } from "./AdminEmpty";
export { FilterTabs, type FilterOption } from "./FilterTabs";
export { AdminStat } from "./AdminStat";

/**
 * Admin notices reuse the public `Alert` — same tones (`success` | `error` |
 * `info` | `note`), same a11y behaviour. Re-exported under both names so admin
 * pages don't need a second import path.
 */
export { Alert, Alert as AdminAlert } from "@/components/ui/Feedback";
