export function matchesQuery(
  query: string,
  values: Array<string | number | null | undefined>
) {
  const normalised = query.trim().toLowerCase()
  if (!normalised) return true
  return values.some(value => String(value ?? '').toLowerCase().includes(normalised))
}

export function matchesSelected(selected: string, allLabel: string, value: string) {
  return selected === allLabel || selected === value
}

export function filterRecords<T>(
  items: readonly T[],
  query: string,
  searchValues: (item: T) => Array<string | number | null | undefined>,
  predicates: Array<(item: T) => boolean> = []
) {
  return items.filter(
    item => matchesQuery(query, searchValues(item)) && predicates.every(predicate => predicate(item))
  )
}
