import type { Metadata } from "next";
import Link from "next/link";

import { getMyGroups } from "@/lib/account-data";
import { requireVolunteer } from "@/lib/volunteer-auth";
import { Card } from "@/components/ui/Card";
import { LogHoursForm } from "@/components/account/LogHoursForm";

export const metadata: Metadata = { title: "Log hours" };

export default async function LogHoursPage() {
  const volunteer = await requireVolunteer("/account/hours");
  const memberships = await getMyGroups(volunteer.id);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="font-hand text-lg tracking-[0.14em] text-red-deep uppercase">Log hours</p>
        <h1 className="text-3xl sm:text-4xl">What did you get done?</h1>
        <p className="text-brown-mid">
          We already know who you are, so this is just the work itself. An adult on our team checks
          every entry before it counts toward a certificate.{" "}
          <Link
            className="font-bold text-red-deep underline decoration-pink-deep decoration-2 underline-offset-4"
            href="/volunteer#how-to-make-a-card"
          >
            Not sure what makes a good card?
          </Link>
        </p>
      </header>

      <Card tone="paper" seed="log-hours" className="px-5 py-7 sm:px-8 sm:py-9">
        <LogHoursForm
          groups={memberships
            .filter((m) => !m.group.archived)
            .map((m) => ({ id: m.group.id, name: m.group.name }))}
        />
      </Card>
    </div>
  );
}
