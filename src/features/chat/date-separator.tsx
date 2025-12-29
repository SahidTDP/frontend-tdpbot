export function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center my-3">
      <div className="flex-1 border-t" />
      <span className="mx-3 text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 border-t" />
    </div>
  );
}

