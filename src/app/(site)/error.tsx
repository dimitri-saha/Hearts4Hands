"use client";

import { ErrorContent } from "@/components/layout/ErrorContent";

export default function SiteError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorContent {...props} />;
}
