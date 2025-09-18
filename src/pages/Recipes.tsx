import { useEffect, useMemo, useRef, useState } from "react";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  image?: string;
  tags: string[];
  time: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  rating?: number; // 1-5
};

type Props = {
  recipes?: Recipe[];
  pageSize?: number;
};

const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3 } as const;

export default function RecipesPro({ recipes, pageSize = 6 }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "time-asc" | "time-desc" | "rating-desc" | "difficulty-asc"
  >("rating-desc");
  const [page, setPage] = useState(1);
  const [fav, setFav] = useLocalFavorites("fav_recipes"); // 本地收藏
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const data = recipes ?? MOCK_RECIPES;

  const allTags = useMemo(() => {
    const s = new Set<string>();
    data.forEach((r) => r.tags.forEach((t) => s.add(t)));
    return [...Array.from(s)].sort();
  }, [data]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inQuery = (r: Recipe) =>
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some((t) => t.toLowerCase().includes(q));

    const inTags = (r: Recipe) =>
      selectedTags.length === 0 ||
      selectedTags.every((t) => r.tags.includes(t));

    const base = data.filter((r) => inQuery(r) && inTags(r));

    const sorted = [...base].sort((a, b) => {
      if (sortBy === "time-asc") return a.time - b.time;
      if (sortBy === "time-desc") return b.time - a.time;
      if (sortBy === "rating-desc") return (b.rating ?? 0) - (a.rating ?? 0);
      // difficulty-asc
      return DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
    });

    return sorted;
  }, [data, query, selectedTags, sortBy]);

  const total = filteredSorted.length;
  const visible = filteredSorted.slice(0, page * pageSize);
  const canLoadMore = visible.length < total;

  // 观察器：当 sentinel 进入视窗且还有更多内容时，自动 page+1
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;

    let ticking = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!ticking && entry.isIntersecting && canLoadMore) {
          ticking = true;
          setIsAutoLoading(true);
          // 模拟异步加载的节流（实际从服务端取就不需要 setTimeout）
          setTimeout(() => {
            setPage((p) => p + 1);
            setIsAutoLoading(false);
            ticking = false;
          }, 200);
        }
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 } // 提前 200px 触发
    );

    io.observe(el);
    return () => io.disconnect();
  }, [canLoadMore]); // 注意依赖：能否继续加载变化时需要重新计算

  useEffect(() => {
    setPage(1);
  }, [query, selectedTags, sortBy]); // 改筛选时重置页码

  return (
    <section className="w-full">
      {/* 顶部控制栏 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Recipes</h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* 搜索 */}
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes…"
              className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m21 21-4.3-4.3" />
              <circle cx="10" cy="10" r="7" />
            </svg>
          </div>

          {/* 排序 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating-desc">Top Rated</option>
            <option value="time-asc">Time ↑</option>
            <option value="time-desc">Time ↓</option>
            <option value="difficulty-asc">Difficulty ↑</option>
          </select>
        </div>
      </div>

      {/* 标签多选 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() =>
                setSelectedTags((prev) =>
                  active ? prev.filter((t) => t !== tag) : [...prev, tag]
                )
              }
              className={
                "rounded-full border px-3 py-1 text-sm " +
                (active
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50")
              }
            >
              {tag}
            </button>
          );
        })}
        {selectedTags.length > 0 && (
          <button
            onClick={() => setSelectedTags([])}
            className="text-sm text-slate-500 underline underline-offset-4"
          >
            Clear
          </button>
        )}
      </div>

      {/* 列表 */}
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.length === 0
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : visible.map((r) => (
              <li key={r.id}>
                <RecipeCard recipe={r} fav={fav} setFav={setFav} />
              </li>
            ))}
      </ul>

      {/* 加载更多 */}
      {/* <div className="mt-4 flex justify-center">
        {canLoadMore ? (
          <button
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:opacity-90"
          >
            Load more
          </button>
        ) : total === 0 ? (
          <p className="text-slate-500">No recipes found.</p>
        ) : (
          <p className="text-slate-500">No more results.</p>
        )}
      </div> */}

      {/* sentinel：放在列表尾部用来触发下一页 */}
      <div ref={sentinelRef} className="h-10" />

      {/* 可选的底部状态 */}
      <div className="mt-4 flex justify-center text-sm text-slate-500">
        {isAutoLoading && canLoadMore
          ? "Loading…"
          : !canLoadMore
          ? "No more results."
          : null}
      </div>
    </section>
  );
}

/* ---------- 子组件 ---------- */

function RecipeCard({
  recipe,
  fav,
  setFav,
}: {
  recipe: Recipe;
  fav: Record<string, true>;
  setFav: (f: Record<string, true>) => void;
}) {
  const isFav = !!fav[recipe.id];
  const toggleFav = () =>
    setFav(isFav ? omitKey(fav, recipe.id) : { ...fav, [recipe.id]: true });

  const [open, setOpen] = useState(false);

  return (
    <div className="h-full overflow-hidden rounded-2xl border bg-white shadow-sm">
      {recipe.image ? (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="h-40 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-40 items-center justify-center bg-slate-100 text-slate-400">
          No Image
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold">{recipe.title}</h3>
          <button
            onClick={toggleFav}
            aria-label="favorite"
            className={
              isFav ? "text-red-500" : "text-slate-400 hover:text-red-400"
            }
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
              <path d="M12 21s-7-4.35-9.33-8.05A5.5 5.5 0 0 1 12 6.35a5.5 5.5 0 0 1 9.33 6.6C19 16.65 12 21 12 21z" />
            </svg>
          </button>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">
          {recipe.description}
        </p>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Badge>{recipe.difficulty}</Badge>
          <span>⏱ {recipe.time} min</span>
          {recipe.rating ? <span>★ {recipe.rating.toFixed(1)}</span> : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {recipe.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
            >
              #{t}
            </span>
          ))}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-1 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          View Recipe
        </button>
      </div>

      {/* 简易详情弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-w-lg w-full rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">{recipe.title}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500">
                ✕
              </button>
            </div>
            <p className="mt-2 text-slate-700">{recipe.description}</p>
            <div className="mt-4 flex gap-4 text-sm text-slate-500">
              <span>⏱ {recipe.time} min</span>
              <span>Difficulty: {recipe.difficulty}</span>
              {recipe.rating ? <span>★ {recipe.rating.toFixed(1)}</span> : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">
      {children}
    </span>
  );
}
function SkeletonCard() {
  return (
    <div className="h-full overflow-hidden rounded-2xl border bg-white">
      <div className="h-40 w-full animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-1/2 animate-pulse bg-slate-100 rounded" />
        <div className="h-3 w-full animate-pulse bg-slate-100 rounded" />
        <div className="h-3 w-2/3 animate-pulse bg-slate-100 rounded" />
        <div className="h-8 w-full animate-pulse bg-slate-100 rounded" />
      </div>
    </div>
  );
}

/* ---------- 本地收藏 Hook + 小工具 ---------- */
function useLocalFavorites(key: string) {
  const [state, setState] = useState<Record<string, true>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, [key]);
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  return [state, setState] as const;
}
function omitKey<T extends Record<string, any>>(obj: T, k: string) {
  const { [k]: _, ...rest } = obj;
  return rest as T;
}

/* ---------- Mock 数据（可替换为接口） ---------- */
const MOCK_RECIPES: Recipe[] = [
  {
    id: "r1",
    title: "Garlic Butter Shrimp",
    description: "Juicy shrimp with garlic butter and lemon.",
    image:
      "https://images.unsplash.com/photo-1604908176819-51e8533c2b40?q=80&w=1200&auto=format&fit=crop",
    tags: ["seafood", "dinner", "quick"],
    time: 20,
    difficulty: "easy",
    rating: 4.6,
  },
  {
    id: "r2",
    title: "Classic Beef Ramen",
    description: "Rich broth with noodles and beef.",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437b?q=80&w=1200&auto=format&fit=crop",
    tags: ["noodles", "asian"],
    time: 35,
    difficulty: "medium",
    rating: 4.4,
  },
  {
    id: "r3",
    title: "Avocado Toast",
    description: "Sourdough with creamy avocado.",
    image:
      "https://images.unsplash.com/photo-1543332164-6e82f355bad8?q=80&w=1200&auto=format&fit=crop",
    tags: ["breakfast", "vegetarian", "quick"],
    time: 10,
    difficulty: "easy",
    rating: 4.2,
  },
  {
    id: "r4",
    title: "Grilled Chicken Salad",
    description: "Greens with chicken & citrus dressing.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop",
    tags: ["salad", "healthy"],
    time: 25,
    difficulty: "easy",
    rating: 4.1,
  },
  {
    id: "r5",
    title: "Margherita Pizza",
    description: "Tomato, mozzarella, basil.",
    image:
      "https://images.unsplash.com/photo-1548365328-9f547fb0953f?q=80&w=1200&auto=format&fit=crop",
    tags: ["italian", "baking"],
    time: 40,
    difficulty: "medium",
    rating: 4.7,
  },
  {
    id: "r6",
    title: "Chocolate Lava Cake",
    description: "Molten center dessert.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1200&auto=format&fit=crop",
    tags: ["dessert", "baking"],
    time: 30,
    difficulty: "hard",
    rating: 4.8,
  },
  {
    id: "r7",
    title: "Miso Soup",
    description: "Light & umami-rich.",
    tags: ["asian", "soup", "quick"],
    time: 12,
    difficulty: "easy",
    rating: 4.0,
  },
  {
    id: "r8",
    title: "Garlic Butter Shrimp",
    description: "Juicy shrimp with garlic butter and lemon.",
    image:
      "https://images.unsplash.com/photo-1604908176819-51e8533c2b40?q=80&w=1200&auto=format&fit=crop",
    tags: ["seafood", "dinner", "quick"],
    time: 20,
    difficulty: "easy",
    rating: 4.6,
  },
  {
    id: "r9",
    title: "Classic Beef Ramen",
    description: "Rich broth with noodles and beef.",
    image:
      "https://images.unsplash.com/photo-1557872943-16a5ac26437b?q=80&w=1200&auto=format&fit=crop",
    tags: ["noodles", "asian"],
    time: 35,
    difficulty: "medium",
    rating: 4.4,
  },
  {
    id: "r10",
    title: "Avocado Toast",
    description: "Sourdough with creamy avocado.",
    image:
      "https://images.unsplash.com/photo-1543332164-6e82f355bad8?q=80&w=1200&auto=format&fit=crop",
    tags: ["breakfast", "vegetarian", "quick"],
    time: 10,
    difficulty: "easy",
    rating: 4.2,
  },
  {
    id: "r11",
    title: "Grilled Chicken Salad",
    description: "Greens with chicken & citrus dressing.",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop",
    tags: ["salad", "healthy"],
    time: 25,
    difficulty: "easy",
    rating: 4.1,
  },
  {
    id: "r12",
    title: "Margherita Pizza",
    description: "Tomato, mozzarella, basil.",
    image:
      "https://images.unsplash.com/photo-1548365328-9f547fb0953f?q=80&w=1200&auto=format&fit=crop",
    tags: ["italian", "baking"],
    time: 40,
    difficulty: "medium",
    rating: 4.7,
  },
  {
    id: "r13",
    title: "Chocolate Lava Cake",
    description: "Molten center dessert.",
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1200&auto=format&fit=crop",
    tags: ["dessert", "baking"],
    time: 30,
    difficulty: "hard",
    rating: 4.8,
  },
  {
    id: "r14",
    title: "Miso Soup",
    description: "Light & umami-rich.",
    tags: ["asian", "soup", "quick"],
    time: 12,
    difficulty: "easy",
    rating: 4.0,
  },
];
