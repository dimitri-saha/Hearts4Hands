import type { Metadata } from "next";

import { setMessageHandled } from "@/app/actions/admin";
import {
  AdminAlert,
  AdminEmpty,
  AdminList,
  AdminListItem,
  AdminPageHeader,
  FilterTabs,
  StatusBadge,
} from "@/components/admin";
import { requireOwner } from "@/lib/auth";
import { getServiceClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";
import { contactTopics } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

const ROW_LIMIT = 200;

const FILTERS = [
  { value: "open", label: "Needs a reply" },
  { value: "done", label: "Handled" },
  { value: "all", label: "All" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function parseFilter(value: string | undefined): Filter {
  return FILTERS.some((f) => f.value === value) ? (value as Filter) : "open";
}

function topicLabel(value: string) {
  return contactTopics.find((t) => t.value === value)?.label ?? value;
}

/** mailto with the subject pre-filled, so a reply threads sensibly. */
function replyHref(message: ContactMessage) {
  const subject = message.subject
    ? `Re: ${message.subject}`
    : `Re: your message to Hearts4Hands`;
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
}

/**
 * How long a handled message has left. The 7-day window is enforced by
 * `purge_handled_messages()` in supabase/migrations/0003 — this only reports
 * it, so nobody is surprised when a message disappears.
 */
function retentionNote(handledAt: string | null) {
  if (!handledAt) return "handled";
  const days = Math.floor((Date.now() - Date.parse(handledAt)) / 86_400_000);
  const left = 7 - days;
  if (left <= 0) return "handled — due to be cleared";
  if (left === 1) return "handled — clears tomorrow";
  return `handled — clears in ${left} days`;
}

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ handled?: string }>;
}) {
  await requireOwner("/admin/messages");

  const filter = parseFilter((await searchParams).handled);
  const supabase = getServiceClient();

  if (!supabase) {
    return (
      <div className="flex flex-col gap-5">
        <AdminPageHeader
          title="Messages"
          description="Everything sent through the contact form."
        />
        <AdminAlert tone="note" title="No database connected yet">
          <p>
            Contact messages are stored in Supabase. This page needs{" "}
            <code className="font-body font-bold">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-body font-bold">SUPABASE_SERVICE_ROLE_KEY</code> in the
            environment before it can show them.
          </p>
          <p className="mt-2">
            Until then the contact form tells people to email us directly, so nothing gets lost.
          </p>
        </AdminAlert>
      </div>
    );
  }

  const countFor = (handled: boolean) =>
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("handled", handled);

  const listQuery = supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(ROW_LIMIT);

  const [openCount, doneCount, listResult] = await Promise.all([
    countFor(false),
    countFor(true),
    filter === "all" ? listQuery : listQuery.eq("handled", filter === "done"),
  ]);

  const messages = (listResult.data ?? []) as ContactMessage[];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Messages"
        description="Everything sent through the contact form. Reply from your own email, then mark it handled so the next person knows it's covered. Handled messages are deleted automatically a week later; anything still needing a reply is kept indefinitely."
        count={messages.length}
      />

      <FilterTabs
        basePath="/admin/messages"
        active={filter}
        param="handled"
        label="Filter messages by whether they've been handled"
        options={[
          { value: "open", label: "Needs a reply", count: openCount.count ?? 0 },
          { value: "done", label: "Handled", count: doneCount.count ?? 0 },
          { value: "all", label: "All", count: (openCount.count ?? 0) + (doneCount.count ?? 0) },
        ]}
      />

      {listResult.error ? (
        <AdminAlert tone="error" title="Couldn't load the messages">
          <p>The database returned an error: {listResult.error.message}.</p>
        </AdminAlert>
      ) : null}

      {messages.length === 0 ? (
        <AdminEmpty
          title={
            filter === "open"
              ? "Inbox zero. Everything has been answered."
              : filter === "done"
                ? "Nothing has been marked handled yet."
                : "No messages yet."
          }
          description={
            filter === "open"
              ? "Nothing is waiting on a reply right now. Go make a card."
              : "New messages from the contact form will land here."
          }
        />
      ) : (
        <AdminList>
          {messages.map((message) => (
            <AdminListItem
              key={message.id}
              title={message.subject || `${topicLabel(message.topic)} — no subject`}
              badge={
                <StatusBadge
                  status={message.handled ? "handled" : "pending"}
                  label={message.handled ? "Handled" : "Needs a reply"}
                />
              }
              meta={
                <>
                  {message.name} ·{" "}
                  <a
                    href={replyHref(message)}
                    className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-2"
                  >
                    {message.email}
                  </a>{" "}
                  · {topicLabel(message.topic)} · received {formatDate(message.created_at)}
                  {message.handled ? <> · {retentionNote(message.handled_at)}</> : null}
                </>
              }
              actions={
                <>
                  <a
                    href={replyHref(message)}
                    className="rounded-lg border border-brown-faint bg-paper px-3 py-1.5 font-display text-sm font-bold text-brown-mid no-underline hover:bg-cream"
                  >
                    ✉ Reply by email
                  </a>
                  <form action={setMessageHandled} className="inline">
                    <input type="hidden" name="id" value={message.id} />
                    <input
                      type="hidden"
                      name="handled"
                      value={message.handled ? "false" : "true"}
                    />
                    <button
                      type="submit"
                      className={
                        message.handled
                          ? "rounded-lg border border-brown-faint bg-cream px-3 py-1.5 font-display text-sm font-bold text-brown-mid hover:bg-kraft"
                          : "rounded-lg border border-leaf bg-leaf/18 px-3 py-1.5 font-display text-sm font-bold text-brown hover:bg-leaf/30"
                      }
                    >
                      {message.handled ? "↩ Reopen" : "✓ Mark handled"}
                    </button>
                  </form>
                </>
              }
            >
              <p className="max-w-[68ch] font-body text-[0.98rem] leading-relaxed whitespace-pre-wrap text-brown">
                {message.message}
              </p>
            </AdminListItem>
          ))}
        </AdminList>
      )}
    </div>
  );
}
