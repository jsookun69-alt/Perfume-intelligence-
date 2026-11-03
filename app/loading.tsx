export default function Loading() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center bg-ivory" role="status" aria-label="Loading">
      <svg width="40" height="46" viewBox="0 0 26 30" className="animate-pulse" aria-hidden>
        <path d="M13 1 3 10v18h20V10L13 1Z" fill="none" stroke="#d4b483" strokeWidth="1.4" />
        <path d="M13 9 9 15l4 6 4-6-4-6Z" fill="#d4b483" />
      </svg>
    </div>
  );
}
