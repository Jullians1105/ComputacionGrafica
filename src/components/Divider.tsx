export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-divider" />
      <span className="text-label-md text-on-surface-variant">{label}</span>
      <span className="h-px flex-1 bg-divider" />
    </div>
  );
}
