import type { Metadata } from "next";

import {
  leaveGroup,
  removeMember,
  rotateInviteCode,
  setGroupArchived,
  setMemberRole,
} from "@/app/actions/account";
import { getGroupRoster, getMyGroups } from "@/lib/account-data";
import { site } from "@/lib/site";
import { formatNumber } from "@/lib/utils";
import { requireVolunteer } from "@/lib/volunteer-auth";
import { Card, Tag } from "@/components/ui/Card";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import { CreateGroupForm, JoinGroupForm } from "@/components/account/GroupForms";
import { Megaphone } from "@/components/illustrations/Objects";

export const metadata: Metadata = { title: "My club" };

export default async function GroupsPage() {
  const volunteer = await requireVolunteer("/account/groups");
  const memberships = await getMyGroups(volunteer.id);

  // Every member sees the roster now, so this is fetched for all memberships.
  const rosters = await Promise.all(
    memberships.map((m) => getGroupRoster(m.group.id, volunteer.id)),
  );

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">Clubs</p>
        <h1 className="text-3xl sm:text-4xl">Volunteering with other people</h1>
        <p className="max-w-2xl text-brown-mid">
          A club pools everyone&apos;s approved hours into one total you can show a school. Your own
          hours still count for you either way — joining a club never takes anything away from your
          own record.
        </p>
      </header>

      {memberships.length === 0 ? (
        <EmptyState title="You're not in a club yet.">
          <p>Join one with a code, or start your own below.</p>
        </EmptyState>
      ) : (
        <section aria-labelledby="my-clubs" className="flex flex-col gap-5">
          <h2 id="my-clubs" className="text-2xl">
            Your clubs
          </h2>

          {memberships.map((m, i) => {
            const roster = rosters[i];
            return (
              <Card key={m.group.id} seed={m.group.id} tone="cream" className="px-5 py-6 sm:px-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl">{m.group.name}</h3>
                    {m.group.organisation ? (
                      <p className="text-sm text-brown-mid">{m.group.organisation}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {m.group.archived ? <Tag tone="brown">Archived</Tag> : null}
                    <Tag tone={m.role === "leader" ? "red" : "pink"}>
                      {m.role === "leader" ? "You run this" : "Member"}
                    </Tag>
                  </div>
                </div>

                <p className="mt-3 text-brown">
                  <strong className="font-display text-2xl text-red-deep">
                    {formatNumber(m.groupHours)}
                  </strong>{" "}
                  approved hours between {formatNumber(m.memberCount)}{" "}
                  {m.memberCount === 1 ? "member" : "members"}
                </p>

                {/* Roster: everyone in the club sees it. Names and approved
                    totals only — see getGroupRoster for why. */}
                <div className="mt-5 border-t-2 border-dashed border-brown-faint pt-5">
                  <p className="font-display font-bold text-berry">Members</p>
                  {roster && roster.length > 0 ? (
                    <ul className="mt-2 flex list-none flex-col gap-2">
                      {roster.map((r) => (
                        <li
                          key={r.userId}
                          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-brown-faint/60 pb-2 last:border-b-0 last:pb-0"
                        >
                          <span className="text-brown">
                            {r.name}
                            {r.userId === volunteer.id ? (
                              <span className="ml-2 font-hand text-sm text-brown-soft">you</span>
                            ) : null}
                            {r.role === "leader" ? (
                              <span className="ml-2 font-hand text-sm text-red-deep">leader</span>
                            ) : null}
                          </span>

                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-brown-mid tabular-nums">
                              {formatNumber(r.approvedHours)} h · {formatNumber(r.approvedCards)}{" "}
                              cards
                            </span>

                            {m.role === "leader" && r.userId !== volunteer.id ? (
                              <>
                                <form action={setMemberRole}>
                                  <input type="hidden" name="groupId" value={m.group.id} />
                                  <input type="hidden" name="userId" value={r.userId} />
                                  <input
                                    type="hidden"
                                    name="role"
                                    value={r.role === "leader" ? "member" : "leader"}
                                  />
                                  <button
                                    type="submit"
                                    className="rounded-lg border border-brown-faint bg-paper px-2.5 py-1 font-display text-xs font-bold text-brown-mid hover:border-red hover:text-berry"
                                  >
                                    {r.role === "leader" ? "Make member" : "Make leader"}
                                  </button>
                                </form>

                                <details className="inline-block">
                                  <summary className="cursor-pointer list-none rounded-lg border border-brown-faint bg-paper px-2.5 py-1 font-display text-xs font-bold text-brown-mid marker:content-none hover:border-red hover:text-berry">
                                    Remove
                                  </summary>
                                  <div className="mt-1 flex flex-col items-end gap-1.5 rounded-lg border border-red bg-red/5 p-2">
                                    <p className="max-w-52 text-right text-xs text-brown-mid">
                                      Remove {r.name} from this club? Their hours stay counted —
                                      both for them and in this total.
                                    </p>
                                    <form action={removeMember}>
                                      <input type="hidden" name="groupId" value={m.group.id} />
                                      <input type="hidden" name="userId" value={r.userId} />
                                      <button
                                        type="submit"
                                        className="rounded-lg border border-red bg-red/10 px-2.5 py-1 font-display text-xs font-bold text-berry hover:bg-red/20"
                                      >
                                        Yes, remove
                                      </button>
                                    </form>
                                  </div>
                                </details>
                              </>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-sm text-brown-mid">Nobody has joined yet.</p>
                  )}
                  <p className="mt-2 text-sm text-brown-soft">
                    Names and approved totals only — nobody here can see anyone&apos;s email
                    address, photos, or stories.
                  </p>
                </div>

                {m.role === "leader" ? (
                  <div className="mt-5 flex flex-col gap-4 border-t-2 border-dashed border-brown-faint pt-5">
                    <div>
                      <p className="font-display font-bold text-berry">Invite code</p>
                      {m.group.archived ? (
                        <p className="mt-1 text-sm text-brown-mid">
                          This club is archived, so nobody new can join.
                        </p>
                      ) : (
                        <>
                          <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-red-deep select-all">
                            {m.group.invite_code}
                          </p>
                          <p className="mt-1 text-sm text-brown-mid break-all">
                            Or share:{" "}
                            <span className="select-all">
                              {site.url}/account/groups?code={m.group.invite_code}
                            </span>
                          </p>
                          <form action={rotateInviteCode} className="mt-2">
                            <input type="hidden" name="groupId" value={m.group.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:border-red hover:text-berry"
                            >
                              Get a new code
                            </button>
                          </form>
                          <p className="mt-1 text-sm text-brown-soft">
                            Changing it stops the old one working. Nobody already in the club is
                            removed.
                          </p>
                        </>
                      )}
                    </div>

                    <div>
                      <p className="font-display font-bold text-berry">
                        {m.group.archived ? "Reopen this club" : "Finished with this club?"}
                      </p>
                      <p className="mt-1 mb-2 text-sm text-brown-mid">
                        {m.group.archived
                          ? "Reopening lets people join again and log hours toward it."
                          : "Archiving closes it to new members and takes it out of the hour-logging list. Every hour already logged stays counted."}
                      </p>
                      <form action={setGroupArchived}>
                        <input type="hidden" name="groupId" value={m.group.id} />
                        <input
                          type="hidden"
                          name="archived"
                          value={m.group.archived ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:border-red hover:text-berry"
                        >
                          {m.group.archived ? "Reopen club" : "Archive club"}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : null}

                <form action={leaveGroup} className="mt-5">
                  <input type="hidden" name="groupId" value={m.group.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:border-red hover:text-berry"
                  >
                    Leave this club
                  </button>
                </form>
                <p className="mt-1 text-sm text-brown-soft">
                  Hours you already logged stay with the club&apos;s total, and stay on your own
                  record too.
                </p>
              </Card>
            );
          })}
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card tone="paper" seed="join-club" className="px-5 py-6 sm:px-7">
          <h2 className="text-xl">Join a club</h2>
          <p className="mt-1 mb-4 text-sm text-brown-mid">
            Someone running one will have given you a code.
          </p>
          <JoinGroupForm />
        </Card>

        <Card tone="paper" seed="make-club" className="px-5 py-6 sm:px-7">
          <div className="flex items-start gap-3">
            <Megaphone className="mt-1 h-10 w-12 shrink-0" />
            <div>
              <h2 className="text-xl">Start one</h2>
              <p className="mt-1 mb-4 text-sm text-brown-mid">
                For a school club, a class, or a group of friends. You&apos;ll get a code to share.
              </p>
            </div>
          </div>
          <CreateGroupForm />
        </Card>
      </div>

      <Alert tone="note" title="Teachers and club advisors">
        <p>
          Everyone logs their own hours under their own account, so each student gets their own
          certificate, and the club total is worked out from entries we&apos;ve already checked —
          there&apos;s nothing for you to tally up or for us to take on trust.
        </p>
      </Alert>
    </div>
  );
}
