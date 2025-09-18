export function EmptyState({ query, tag }: { query: string; tag: string }) {
  return (
    <div className="mt-10 rounded-2xl border bg-white p-8 text-center text-slate-600">
      <p className="text-lg font-medium">No recipes found</p>
      <p className="mt-1 text-sm">
        {query ? <>Search: <span className="font-semibold">{query}</span></> : null}
        {query && tag !== 'all' ? ' · ' : null}
        {tag !== 'all' ? <>Tag: <span className="font-semibold">{tag}</span></> : null}
      </p>
    </div>
  )
}