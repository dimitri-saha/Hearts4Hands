import type { Metadata } from "next";

import { ScallopEdge, TornEdge, WaveEdge } from "@/components/illustrations/Dividers";
import { ClosingCta } from "@/components/home/ClosingCta";
import { DonationBand } from "@/components/home/DonationBand";
import { Hero } from "@/components/home/Hero";
import { HowToHelp } from "@/components/home/HowToHelp";
import { ImpactSnapshot } from "@/components/home/ImpactSnapshot";
import { StoriesPreview } from "@/components/home/StoriesPreview";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { sectionHex } from "@/components/ui/Section";
import { getRecentPosts } from "@/lib/posts";
import { getStats } from "@/lib/stats";
import { site } from "@/lib/site";

/**
 * Impact numbers are edited by hand in /admin, which calls `revalidatePath`.
 * This is the belt-and-braces path: it also picks up changes made straight in
 * the Supabase dashboard, within ten minutes.
 */
export const revalidate = 600;

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} — creativity is a form of courage`,
  },
  description:
    "Handmade cards for patients in hospitals, stories written by volunteers, and money raised for cancer research. Start with one card.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [stats, posts] = await Promise.all([getStats(), getRecentPosts(3)]);

  return (
    <>
      <Hero />
      {/* Each divider carries the *outgoing* band's colour as its own background
          and the *incoming* band's colour as its shape fill. */}
      <TornEdge color={sectionHex.paper} className="-mt-px bg-blush" />

      <ImpactSnapshot stats={stats} />
      <ScallopEdge color={sectionHex.cream} className="-mt-px bg-paper" />

      <WhatWeDo />
      <TornEdge color={sectionHex.paper} className="-mt-px bg-cream" />

      <HowToHelp />
      <WaveEdge color={sectionHex.blush} className="-mt-px bg-paper" />

      <StoriesPreview posts={posts} />
      <TornEdge color={sectionHex.kraft} className="-mt-px bg-blush" />

      <DonationBand stats={stats} />
      <ScallopEdge color={sectionHex.paper} className="-mt-px bg-kraft" />

      <ClosingCta />
    </>
  );
}
