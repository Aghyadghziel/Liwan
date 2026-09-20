/**
 * Page transition: every page is uncovered the same way its photographs are — a dark panel
 * lifts off it. A template re-mounts on navigation, so the animation runs on each arrival.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <div aria-hidden="true" className="page-curtain pointer-events-none fixed inset-0 z-[90] bg-ink" />
    </>
  );
}
