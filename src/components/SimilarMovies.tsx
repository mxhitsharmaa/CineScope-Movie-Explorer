
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Film } from "lucide-react";

interface SimilarMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface SimilarMoviesProps {
  movieId: number;
  isDark?: boolean;
}

export default function SimilarMovies({
  movieId,
  isDark = true,
}: SimilarMoviesProps) {
  const [movies, setMovies] = useState<SimilarMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSimilarMovies() {
      setLoading(true);
      setError("");
      setMovies([]);

      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN as
          | string
          | undefined;
        const apiKey = import.meta.env.VITE_TMDB_API_KEY as
          | string
          | undefined;

        if (!token && !apiKey) {
          throw new Error(
            "TMDB credentials are missing. Check your .env.local file."
          );
        }

        const url = new URL(
          `https://api.themoviedb.org/3/movie/${movieId}/similar`
        );

        url.searchParams.set("language", "en-US");
        url.searchParams.set("page", "1");

        if (!token && apiKey) {
          url.searchParams.set("api_key", apiKey);
        }

        const response = await fetch(url.toString(), {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load similar movies.");
        }

        const data: { results: SimilarMovie[] } =
          await response.json();

        setMovies(
          (data.results ?? [])
            .filter((movie) => movie.poster_path)
            .slice(0, 12)
        );
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSimilarMovies();

    return () => controller.abort();
  }, [movieId]);

  const sectionClass = isDark
    ? "bg-slate-950 text-white"
    : "bg-white text-slate-900";

  const mutedClass = isDark
    ? "text-slate-400"
    : "text-slate-500";

  return (
    <section className={`mt-12 rounded-2xl ${sectionClass}`}>
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`rounded-xl p-3 ${
            isDark ? "bg-indigo-500/15" : "bg-indigo-50"
          }`}
        >
          <Film className="h-6 w-6 text-indigo-500" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            You May Also Like
          </h2>
          <p className={`mt-1 text-sm ${mutedClass}`}>
            Discover more movies you might enjoy
          </p>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div
                className={`aspect-[2/3] rounded-xl ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}
              />
              <div
                className={`mt-3 h-4 w-3/4 rounded ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}
              />
              <div
                className={`mt-2 h-3 w-1/2 rounded ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </p>
      )}

      {!loading && !error && movies.length === 0 && (
        <p className={`py-6 ${mutedClass}`}>
          No similar movies found for this title.
        </p>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group min-w-0"
              aria-label={`View ${movie.title}`}
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-sm font-semibold text-white">
                  <Star
                    size={15}
                    className="fill-yellow-400 text-yellow-400"
                  />
                  {movie.vote_average
                    ? movie.vote_average.toFixed(1)
                    : "N/A"}
                </div>
              </div>

              <h3
                className="mt-3 line-clamp-2 font-semibold transition group-hover:text-indigo-400"
                title={movie.title}
              >
                {movie.title}
              </h3>

              <p className={`mt-1 text-sm ${mutedClass}`}>
                {movie.release_date
                  ? movie.release_date.slice(0, 4)
                  : "Release date unknown"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
