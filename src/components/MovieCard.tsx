import { Bookmark, Film, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getPosterUrl, type Movie } from "../services/tmdb";

interface MovieCardProps {
  movie: Movie;
  isSaved: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onOpen?: (movie: Movie) => void;
}

export default function MovieCard({
  movie,
  isSaved,
  onToggleWatchlist,
  onOpen,
}: MovieCardProps) {
  const poster = getPosterUrl(movie.poster_path);

  const rating =
    typeof movie.vote_average === "number" && movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : "N/A";

  const releaseYear =
    movie.release_date?.slice(0, 4) || "Coming soon";

  const handleOpen = () => {
    onOpen?.(movie);
  };

  return (
    <article className="movie-card group min-w-0">
      <div className="relative overflow-hidden rounded-xl">
        <Link
          to={`/movie/${movie.id}`}
          onClick={handleOpen}
          aria-label={`View ${movie.title} details`}
          className="relative block overflow-hidden"
        >
          {poster ? (
            <img
              src={poster}
              alt={`${movie.title} poster`}
              loading="lazy"
              className="movie-card-image transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center bg-[#171b2a] text-slate-500">
              <Film size={36} />
            </div>
          )}

          <div className="movie-card-overlay" />

          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2.5 py-1.5 text-xs font-bold text-amber-300">
            <Star size={12} fill="currentColor" />
            {rating}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 p-3 sm:p-4">
            <p className="mb-1 text-xs font-medium text-cyan-300">
              {releaseYear}
            </p>

            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-cyan-200 sm:text-base">
              {movie.title}
            </h3>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => onToggleWatchlist(movie)}
          aria-pressed={isSaved}
          aria-label={
            isSaved
              ? `Remove ${movie.title} from watchlist`
              : `Add ${movie.title} to watchlist`
          }
          title={isSaved ? "Remove from watchlist" : "Add to watchlist"}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-colors duration-200 ${
            isSaved
              ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
              : "border-white/15 bg-black/70 text-white hover:border-cyan-400/50 hover:bg-cyan-400/15 hover:text-cyan-300"
          }`}
        >
          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-3">
        <Link
          to={`/movie/${movie.id}`}
          onClick={handleOpen}
          className="line-clamp-2 block text-sm font-semibold leading-5 text-slate-100 transition-colors hover:text-cyan-300"
        >
          {movie.title}
        </Link>

        <p className="mt-1.5 text-xs text-slate-500">{releaseYear}</p>
      </div>
    </article>
  );
}
