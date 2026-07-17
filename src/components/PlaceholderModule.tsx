export function PlaceholderModule({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="text-[var(--color-text-muted)]">{description}</p>
    </div>
  )
}
