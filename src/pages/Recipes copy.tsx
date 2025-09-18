// //方案 B｜React Query 的服务端分页（真正无限滚动）

// // api
// import { useInfiniteQuery } from '@tanstack/react-query'
// import { api } from '../api/client'

// // 假设接口支持 page 参数，返回 { items, nextPage }
// const fetchPage = ({ pageParam = 1, query = '', tags = [] as string[], sort = 'rating-desc' }) =>
//   api.get(`/recipes`, { params: { page: pageParam, size: 12, query, tags: tags.join(','), sort } })

// export default function RecipesInfinite() {
//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//     status,
//   } = useInfiniteQuery({
//     queryKey: ['recipes', {/* 你的筛选条件对象 */}],
//     queryFn: ({ pageParam }) => fetchPage({ pageParam /*, query, tags, sort */}),
//     getNextPageParam: (lastPage) => lastPage.nextPage ?? false, // 由后端告知是否还有下一页
//     staleTime: 5 * 60 * 1000,
//   })

//   const sentinelRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     if (!sentinelRef.current) return
//     if (!hasNextPage) return
//     const el = sentinelRef.current
//     let locked = false
//     const io = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && hasNextPage && !locked) {
//           locked = true
//           fetchNextPage().finally(() => { locked = false })
//         }
//       },
//       { root: null, rootMargin: '200px 0px', threshold: 0 }
//     )
//     io.observe(el)
//     return () => io.disconnect()
//   }, [hasNextPage, fetchNextPage])

//   if (status === 'pending') return <div className="p-6">Loading…</div>
//   if (status === 'error')   return <div className="p-6 text-red-600">Failed to load.</div>

//   const items = data.pages.flatMap(p => p.items)

//   return (
//     <section className="w-full">
//       <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {items.map(r => (
//           <li key={r.id}>{/* <RecipeCard recipe={r} /> */}</li>
//         ))}
//       </ul>

//       <div ref={sentinelRef} className="h-10" />
//       <div className="mt-4 flex justify-center text-sm text-slate-500">
//         {isFetchingNextPage ? 'Loading…' : hasNextPage ? '' : 'No more results.'}
//       </div>
//     </section>
//   )
// }

export const f1 = ()=>{}