import type { Metadata } from "next";

import { removeAdmin, setAdminRole } from "@/app/actions/admin-team";
import { countOwners, listAdmins } from "@/lib/admins";
import { requireOwner } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { AdminAlert, AdminCard, AdminEmpty, AdminPageHeader } from "@/components/admin";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { Tag } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin accounts",
  robots: { index: false, follow: false },
};

function relative(iso: string | null) {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

const REFUSALS: Record<string, string> = {
  "last-owner":
    "That's the last owner account. Promote somebody else to owner first — otherwise nobody could get back into the owner-only parts of the admin, and there's no way to fix that from inside the site.",
  self: "You can't change your own role or remove yourself. Ask another owner.",
  missing: "That account wasn't found — it may have just been removed.",
};

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ refused?: string }>;
}) {
  const me = await requireOwner("/admin/team");
  const refused = REFUSALS[(await searchParams).refused ?? ""];
  const [admins, owners] = await Promise.all([listAdmins(me.id), countOwners()]);

  const editors = admins.filter((a) => a.role === "editor").length;

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Admin accounts"
        description={`${owners} ${owners === 1 ? "owner" : "owners"} and ${editors} ${editors === 1 ? "editor" : "editors"}. Owners see everything. Editors only see story submissions and posts.`}
      />

      {refused ? (
        <AdminAlert tone="error" title="That didn't happen">
          {refused}
        </AdminAlert>
      ) : null}

      {owners === 1 ? (
        <AdminAlert tone="note" title="Only one owner">
          If that account is lost, nobody can get back into the parts of the admin that owners
          control — there is no way to appoint a new owner from inside the site. Worth promoting a
          second person.
        </AdminAlert>
      ) : null}

      <AdminCard>
        <h2 className="text-xl">Give somebody access</h2>
        <p className="mt-1 mb-4 text-brown-mid">
          If they already have a Hearts4Hands account, they just gain access — no email is sent.
          If they don&apos;t, Supabase emails them an invitation and the account exists once they
          accept it.
        </p>
        <InviteAdminForm />
      </AdminCard>

      {admins.length === 0 ? (
        <AdminEmpty title="No admin accounts." />
      ) : (
        <ul className="flex list-none flex-col gap-3">
          {admins.map((a) => {
            // Guards mirrored from the actions. The action re-checks both — this
            // only decides whether to render a control that would be refused.
            const lastOwner = a.role === "owner" && owners <= 1;
            const locked = a.isYou || lastOwner;

            return (
              <li
                key={a.userId}
                className="rounded-xl border-2 border-brown-faint bg-paper px-5 py-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <p className="font-display text-lg font-bold text-berry">
                    {a.email}
                    {a.isYou ? (
                      <span className="ml-2 font-body text-sm font-normal text-brown-soft">
                        you
                      </span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-2">
                    {!a.confirmed ? <Tag tone="cream">Invitation pending</Tag> : null}
                    <Tag tone={a.role === "owner" ? "red" : "pink"}>
                      {a.role === "owner" ? "Owner" : "Editor"}
                    </Tag>
                  </div>
                </div>

                <p className="mt-1 text-sm text-brown-mid">
                  Added {formatDate(a.addedAt)} · last signed in {relative(a.lastSignInAt)}
                </p>

                {locked ? (
                  <p className="mt-3 text-sm text-brown-soft">
                    {a.isYou
                      ? "You can't change your own role or remove yourself — ask another owner."
                      : "The last owner can't be demoted or removed."}
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <form action={setAdminRole}>
                      <input type="hidden" name="userId" value={a.userId} />
                      <input
                        type="hidden"
                        name="role"
                        value={a.role === "owner" ? "editor" : "owner"}
                      />
                      <button
                        type="submit"
                        className="rough-pill border-2 border-brown/40 bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown hover:border-red hover:bg-blush"
                      >
                        {a.role === "owner" ? "Make editor" : "Make owner"}
                      </button>
                    </form>

                    <details className="inline-block">
                      <summary className="cursor-pointer list-none rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid marker:content-none hover:border-red hover:text-berry">
                        Remove access
                      </summary>
                      <form
                        action={removeAdmin}
                        className="mt-2 flex flex-col items-start gap-2 rounded-lg border border-red bg-red/5 p-3"
                      >
                        <input type="hidden" name="userId" value={a.userId} />
                        <p className="max-w-sm text-sm text-brown-mid">
                          Removes admin access for <strong>{a.email}</strong>. Their Hearts4Hands
                          account stays — including any hours and certificates, which would be lost
                          if the account itself were deleted.
                        </p>
                        <button
                          type="submit"
                          className="rounded-lg border border-red bg-red/10 px-3 py-1.5 font-display text-sm font-bold text-berry hover:bg-red/20"
                        >
                          Remove access
                        </button>
                      </form>
                    </details>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
