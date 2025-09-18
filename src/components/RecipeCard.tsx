import { Recipe } from "../pages/Recipes";
import { ClockIcon } from "./ClockIcon";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
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
        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400">
          No Image
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-semibold">{recipe.title}</h3>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 capitalize">
            {recipe.difficulty}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600">{recipe.description}</p>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <ClockIcon className="h-4 w-4" />
          <span>{recipe.time} min</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {recipe.tags.map(t => (
            <span
              key={t}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
            >
              #{t}
            </span>
          ))}
        </div>

        <button className="mt-1 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90">
          View Recipe
        </button>
      </div>
    </div>
  )
}