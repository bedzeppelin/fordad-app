import dynamic from "next/dynamic";

// SSR disabled — CompanionApp uses new Date() at render time (greeting,
// today's date, week bars), so server and client would always produce
// different HTML and cause hydration errors. As a client-only PWA it
// doesn't need or benefit from server rendering anyway.
const CompanionApp = dynamic(() => import("@/components/dad/CompanionApp"), { ssr: false });

export default function HomePage() {
  return <CompanionApp />;
}
