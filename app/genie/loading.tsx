export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--ak-bg)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[var(--ak-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium animate-pulse">Summoning the Genie...</p>
      </div>
    </div>
  );
}
