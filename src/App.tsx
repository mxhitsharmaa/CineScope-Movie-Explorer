
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Bookmark,
  Clapperboard,
  Compass,
  Film,
  LogOut,
  Play,
  RefreshCw,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import AuthPage from "./pages/AuthPage";
import {
  getMovieDetails,
  getPosterUrl,
  getTrendingMovies,
  searchMovies,
  type Movie,
  type MovieDetails,
} from "./services/tmdb";

function MovieSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="skeleton mt-3 h-3 w-4/5 rounded-full" />
      <div className="skeleton mt-2 h-3 w-2/5 rounded-full" />
    </div>
  );
}

function MovieCard({
  movie,
  isSaved,
  onToggleWatchlist,
}: {
  movie: Movie;
  isSaved: boolean;
  onToggleWatchlist: (movie: Movie) => void;
}) {
  const poster = getPosterUrl(movie.poster_path);

  return (
    <article className="group min-w-0">
      <Link
        to={`/movie/${movie.id}`}
        aria-label={`View ${movie.title} details`}
        className="relative block overflow-hidden rounded-xl border border-white/[0.07] bg-[#131b2b]"
      >
        {poster ? (
          <img
            src={poster}
            alt={`${movie.title} poster`}
            loading="lazy"
            className="aspect-[2/3] w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center text-slate-500">
            <Film size={32} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-amber-300 backdrop-blur">
          <Star size={12} fill="currentColor" />
          {movie.vote_average > 0
            ? movie.vote_average.toFixed(1)
            : "N/A"}
        </div>
      </Link>

      <Link
        to={`/movie/${movie.id}`}
        className="mt-3 block line-clamp-2 text-sm font-semibold text-slate-100 transition hover:text-blue-400"
      >
        {movie.title}
      </Link>

      <p className="mt-1 text-xs text-slate-500">
        {movie.release_date?.slice(0, 4) || "Release date unavailable"}
      </p>

      <button
        type="button"
        onClick={() => onToggleWatchlist(movie)}
        aria-pressed={isSaved}
        aria-label={
          isSaved
            ? `Remove ${movie.title} from watchlist`
            : `Add ${movie.title} to watchlist`
        }
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border px-2 py-2 text-xs font-semibold transition ${
          isSaved
            ? "border-blue-400/30 bg-blue-500/15 text-blue-300 hover:bg-red-500/10 hover:text-red-300"
            : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-blue-500/15 hover:text-blue-300"
        }`}
      >
        <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />
        {isSaved ? "Saved · Remove" : "Add to Watchlist"}
      </button>
    </article>
  );
}

function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      setLoading(true);
      setError("");
      setMovie(null);

      if (!id || !/^\d+$/.test(id)) {
        setError("Invalid movie ID.");
        setLoading(false);
        return;
      }

      try {
        const result = await getMovieDetails(id);

        if (!cancelled) {
          setMovie(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load movie details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="mt-8 grid gap-8 md:grid-cols-[300px_1fr]">
          <div className="skeleton aspect-[2/3] rounded-2xl" />
          <div className="space-y-5 pt-3">
            <div className="skeleton h-10 w-3/4 rounded-lg" />
            <div className="skeleton h-5 w-1/3 rounded-lg" />
            <div className="skeleton h-24 w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-20 text-center">
        <Film className="mx-auto mb-4 text-slate-500" size={42} />
        <h1 className="text-2xl font-bold">Movie unavailable</h1>
        <p className="mt-3 text-sm text-red-300">
          {error || "Movie details could not be found."}
        </p>
        <button
          onClick={() => setRetryCount((count) => count + 1)}
          className="mt-6 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold hover:bg-blue-400"
        >
          Try Again
        </button>
        <button
          onClick={() => navigate("/")}
          className="ml-3 rounded-xl border border-white/10 px-5 py-3 text-sm"
        >
          Home
        </button>
      </main>
    );
  }

  const backdrop = getPosterUrl(movie.backdrop_path, "original");
  const poster = getPosterUrl(movie.poster_path);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 lg:px-12">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-blue-400"
      >
        <ArrowLeft size={17} />
        Back to movies
      </Link>

      <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101a30]">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14] via-[#070b14]/90 to-[#070b14]/50" />

        <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[240px_1fr] lg:gap-12 lg:p-14">
          <div>
            {poster ? (
              <img
                src={poster}
                alt={`${movie.title} poster`}
                className="mx-auto w-full max-w-[260px] rounded-xl shadow-2xl"
              />
            ) : (
              <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-white/5">
                <Film size={48} />
              </div>
            )}
          </div>

          <div className="self-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Movie details
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-5xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-3 italic text-slate-300">
                {movie.tagline}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Star size={16} fill="currentColor" />
                {movie.vote_average.toFixed(1)} / 10
              </span>
              <span>
                {movie.release_date?.slice(0, 4) || "Release date unknown"}
              </span>
              {movie.runtime ? <span>{movie.runtime} min</span> : null}
            </div>

            {movie.genres.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-200"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <h2 className="mt-8 text-lg font-bold">Overview</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {movie.overview || "No overview is available for this movie."}
            </p>

            <p className="mt-5 text-xs text-slate-500">
              Status: {movie.status || "Unknown"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function WatchlistPage({
  watchlist,
  onToggleWatchlist,
  onClearWatchlist,
  user,
  onSignOut,
}: {
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie) => void;
  onClearWatchlist: () => void;
  user: User | null;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-12">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-700">
              <Clapperboard size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Cine<span className="text-blue-400">Scope</span>
            </span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
              <Compass size={16} /><span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/#trending" className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
              <Film size={16} /><span className="hidden sm:inline">Movies</span>
            </Link>
            <Link to="/watchlist" aria-current="page" className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bookmark size={16} />Watchlist
              <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{watchlist.length}</span>
            </Link>
          </nav>
          {user ? (
            <button type="button" onClick={onSignOut} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:text-red-300">
              <LogOut size={15} /><span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link to="/login" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold transition hover:bg-blue-400">
              <UserRound size={15} />Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-145px)] max-w-[1440px] px-4 py-10 sm:px-7 sm:py-12 lg:px-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Your collection</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My Watchlist</h1>
            <p className="mt-3 text-sm text-slate-400">
              {watchlist.length} saved movie{watchlist.length === 1 ? "" : "s"} — your next movie night starts here.
            </p>
          </div>
          {watchlist.length > 0 && (
            <button type="button" onClick={onClearWatchlist} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300">
              Clear watchlist
            </button>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-16 text-center">
            <Bookmark className="mx-auto mb-4 text-slate-500" size={38} />
            <h2 className="text-lg font-bold">Your watchlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Browse trending movies and tap “Add to Watchlist”. Your saved movies will appear here, even after you refresh.
            </p>
            <Link to="/#trending" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold transition hover:bg-blue-400">
              <Film size={16} />Explore movies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
            {watchlist.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isSaved onToggleWatchlist={onToggleWatchlist} />
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-white/[0.07] px-4 py-6 text-center text-xs text-slate-500">
        CineScope · Discover your next favourite story
      </footer>
    </div>
  );
}

function HomePage({
  watchlist,
  onToggleWatchlist,
  onClearWatchlist,
  user,
  onSignOut,
}: {
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie) => void;
  onClearWatchlist: () => void;
  user: User | null;
  onSignOut: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [activeNav, setActiveNav] = useState("Home");


  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);



  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let cancelled = false;

    async function loadMovies() {
      setLoading(true);
      setLoadingMore(false);
      loadingMoreRef.current = false;
      setError("");
      setMovies([]);
      setPage(1);
      setTotalPages(1);

      try {
        const result = debouncedQuery
          ? await searchMovies(debouncedQuery, 1)
          : await getTrendingMovies(1);

        if (!cancelled && requestId.current === currentRequest) {
          setMovies(result.results);
          setTotalPages(Math.min(result.total_pages, 500));
        }
      } catch (err) {
        if (!cancelled && requestId.current === currentRequest) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load movies."
          );
        }
      } finally {
        if (!cancelled && requestId.current === currentRequest) {
          setLoading(false);
        }
      }
    }

    void loadMovies();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, retryCount]);

  const loadMoreMovies = useCallback(async () => {
    if (
      loading ||
      loadingMoreRef.current ||
      page >= totalPages ||
      movies.length === 0
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError("");

    const nextPage = page + 1;
    const currentRequest = requestId.current;

    try {
      const result = debouncedQuery
        ? await searchMovies(debouncedQuery, nextPage)
        : await getTrendingMovies(nextPage);

      if (requestId.current !== currentRequest) return;

      setMovies((previous) => {
        const existingIds = new Set(previous.map((movie) => movie.id));
        return [
          ...previous,
          ...result.results.filter((movie) => !existingIds.has(movie.id)),
        ];
      });

      setPage(nextPage);
      setTotalPages(Math.min(result.total_pages, 500));
    } catch (err) {
      if (requestId.current === currentRequest) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load more movies."
        );
      }
    } finally {
      if (requestId.current === currentRequest) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [loading, page, totalPages, movies.length, debouncedQuery]);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || loading || error || page >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreMovies();
        }
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loading, error, page, totalPages, loadMoreMovies]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070b14]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-4 sm:px-7 lg:px-12">
          <Link
            to="/"
            onClick={() => {
              setSearchQuery("");
              setActiveNav("Home");
            }}
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-700">
              <Clapperboard size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Cine<span className="text-blue-400">Scope</span>
            </span>
          </Link>

          <nav className="ml-3 hidden items-center gap-6 md:flex">
            {[
              { label: "Home", href: "#home", icon: Compass },
              { label: "Movies", href: "#trending", icon: Film },
            ].map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                onClick={() => setActiveNav(label)}
                className={`flex items-center gap-2 text-sm font-medium transition ${
                  activeNav === label
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </a>
            ))}
            <Link
              to="/watchlist"
              className="relative flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <Bookmark size={16} />
              Watchlist
              {watchlist.length > 0 && (
                <span className="ml-0.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {watchlist.length}
                </span>
              )}
            </Link>
          </nav>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setActiveNav("Search");
              document
                .getElementById("trending")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="ml-auto flex min-w-0 max-w-[300px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 sm:flex-none sm:w-[240px]"
          >
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setActiveNav("Search");
              }}
              placeholder="Search movies..."
              aria-label="Search movies"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </form>
          {user ? (
            <button type="button" onClick={onSignOut} title={user.email ?? "Sign out"} aria-label="Sign out" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:text-red-300">
              <LogOut size={16} /><span className="hidden lg:inline">Sign out</span>
            </button>
          ) : (
            <Link to="/login" className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-500 px-3 py-2.5 text-xs font-bold transition hover:bg-blue-400">
              <UserRound size={16} /><span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </header>

      <main
        id="home"
        className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12"
      >
        <section className="fade-up relative mt-5 flex min-h-[410px] items-end overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101a30] sm:mt-7 sm:min-h-[470px] lg:min-h-[520px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(37,99,235,0.28),transparent_38%),radial-gradient(ellipse_at_90%_90%,rgba(124,58,237,0.17),transparent_40%),linear-gradient(110deg,#101a30_0%,#101a30_42%,#0b1222_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101a30] via-[#101a30]/70 to-transparent" />

          <div className="relative z-10 max-w-2xl px-5 pb-8 pt-20 sm:px-9 sm:pb-11 lg:px-12 lg:pb-14">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-blue-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              YOUR NEXT MOVIE STARTS HERE
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Every story
              <br />
              <span className="bg-gradient-to-r from-blue-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                starts somewhere.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Discover trending movies, find hidden gems, and save your next
              favourite film.
            </p>

            <button
              onClick={() =>
                document
                  .getElementById("trending")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold transition hover:bg-blue-400"
            >
              <Play size={17} fill="currentColor" />
              Explore Movies
            </button>
          </div>
        </section>

        <section id="trending" className="py-10 sm:py-12">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              {debouncedQuery ? "Search Results" : "Discover"}
            </p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {debouncedQuery
                ? `Movies matching "${debouncedQuery}"`
                : "Trending Movies"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {loading ? "Finding movies for you..." : `${movies.length} movies loaded`}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5"
            >
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => setRetryCount((count) => count + 1)}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                <RefreshCw size={15} />
                Retry
              </button>
              <p className="mt-2 text-xs text-slate-500">
                Check your TMDB token and network connection if the request fails.
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
              {Array.from({ length: 12 }, (_, index) => (
                <MovieSkeleton key={index} />
              ))}
            </div>
          ) : !error && movies.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.07] py-16 text-center">
              <Film className="mx-auto mb-3 text-slate-500" size={34} />
              <h3 className="font-semibold">No movies found</h3>
              <p className="mt-2 text-sm text-slate-400">
                Try another movie title.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved={watchlist.some((savedMovie) => savedMovie.id === movie.id)}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>

              <div ref={observerTarget} className="h-4" />

              {loadingMore && (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                  {Array.from({ length: 6 }, (_, index) => (
                    <MovieSkeleton key={index} />
                  ))}
                </div>
              )}

              {!loadingMore && page < totalPages && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() => void loadMoreMovies()}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Load More Movies
                  </button>
                </div>
              )}

              {page >= totalPages && movies.length > 0 && (
                <p className="mt-8 text-center text-sm text-slate-500">
                  You have reached the end of the results.
                </p>
              )}
            </>
          )}
        </section>

        <section
          id="watchlist"
          className="mb-12 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Bookmark size={21} />
              </div>
              <div>
                <h2 className="font-bold">Your Watchlist</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {watchlist.length} saved movie{watchlist.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            {watchlist.length > 0 && (
              <button
                type="button"
                onClick={onClearWatchlist}
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              >
                Clear watchlist
              </button>
            )}
          </div>

          {watchlist.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
              <Bookmark className="mx-auto mb-3 text-slate-500" size={30} />
              <h3 className="font-semibold">Your watchlist is empty</h3>
              <p className="mt-2 text-sm text-slate-400">
                Find a movie above and select “Add to Watchlist” to save it here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t border-white/[0.07] py-6 text-center text-xs text-slate-500">
          CineScope · Discover your next favourite story
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Restore the Supabase session and listen for login/logout changes.
  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) console.error("Could not restore Supabase session:", error.message);
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load only the current user's watchlist from Supabase.
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function loadWatchlist() {
      if (!user) {
        setWatchlist([]);
        setWatchlistLoading(false);
        return;
      }

      setWatchlistLoading(true);
      const { data, error } = await supabase
        .from("watchlist")
        .select("movie_data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Could not load watchlist:", error.message);
        window.alert(`Could not load your watchlist: ${error.message}`);
        setWatchlist([]);
      } else {
        const movies = (data ?? [])
          .map((row) => row.movie_data as Movie)
          .filter(
            (movie): movie is Movie =>
              Boolean(movie) &&
              typeof movie.id === "number" &&
              typeof movie.title === "string",
          );
        setWatchlist(movies);
      }

      setWatchlistLoading(false);
    }

    void loadWatchlist();

    return () => {
      cancelled = true;
    };
  }, [user, authReady]);

  // Add/remove a movie in Supabase. Login is required for a personal watchlist.
  const toggleWatchlist = useCallback(
    async (movie: Movie) => {
      if (!user) {
        window.alert("Please sign in to save movies to your watchlist.");
        window.location.assign("/login");
        return;
      }

      const isAlreadySaved = watchlist.some((item) => item.id === movie.id);

      if (isAlreadySaved) {
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movie.id);

        if (error) {
          console.error("Could not remove movie:", error.message);
          window.alert(`Could not remove this movie: ${error.message}`);
          return;
        }

        setWatchlist((previous) => previous.filter((item) => item.id !== movie.id));
        return;
      }

      const { error } = await supabase.from("watchlist").insert({
        // user_id is set by the database default auth.uid().
        movie_id: movie.id,
        movie_data: movie,
      });

      if (error) {
        console.error("Could not save movie:", error.message);
        window.alert(`Could not save this movie: ${error.message}`);
        return;
      }

      setWatchlist((previous) =>
        previous.some((item) => item.id === movie.id)
          ? previous
          : [movie, ...previous],
      );
    },
    [user, watchlist],
  );

  const clearWatchlist = useCallback(async () => {
    if (!user) {
      window.alert("Please sign in to manage your watchlist.");
      window.location.assign("/login");
      return;
    }

    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      console.error("Could not clear watchlist:", error.message);
      window.alert(`Could not clear your watchlist: ${error.message}`);
      return;
    }

    setWatchlist([]);
  }, [user]);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out failed:", error.message);
      window.alert(`Sign out failed: ${error.message}`);
    }
  }, []);

  if (!authReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070b14] text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Loading CineScope...
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      {watchlistLoading && (
        <div className="fixed bottom-4 right-4 z-[100] rounded-lg border border-white/10 bg-[#101a30] px-4 py-2 text-xs text-slate-300 shadow-xl">
          Syncing watchlist...
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              onClearWatchlist={clearWatchlist}
              user={user}
              onSignOut={handleSignOut}
            />
          }
        />
        <Route
          path="/watchlist"
          element={
            <WatchlistPage
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              onClearWatchlist={clearWatchlist}
              user={user}
              onSignOut={handleSignOut}
            />
          }
        />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route
          path="*"
          element={
            <main className="min-h-screen bg-[#070b14] px-5 py-20 text-center text-white">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <Link to="/" className="mt-5 inline-block text-blue-400 hover:text-blue-300">
                Return to CineScope
              </Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
