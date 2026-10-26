
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
  Clapperboard,
  Bookmark,
  Film,
  Star,
  Compass,
  LogOut,
  Play,
  RefreshCw,
  Search,
  UserRound,
  Volume2,
  VolumeX,
  Check,
  ChevronRight,
  Plus,
  
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

import {
  getMovieDetails,
  getPosterUrl,
  getTrendingMovies,
  searchMovies,
  type Movie,
  type MovieDetails,
} from "./services/tmdb";

import AuthPage from "./pages/AuthPage";
import ProfilePage from "./components/ProfilePage";
import MovieReviews from "./components/MovieReviews";
import SimilarMovies from "./components/SimilarMovies";
import MobileNavbar from "./components/MobileNavbar";
import MovieCard from "./components/MovieCard";
import MovieSkeleton from "./components/MovieSkeleton";
import ScrollToHash from "./components/ScrollToHash";
import HeroTrailer from "./components/HeroTrailer";
import { loadHeroDetails } from "./services/heroDetails";
import Navbar from "./components/Navbar";

const HERO_INTERVAL_MS = 5000;

/* "en" -> "English" (browser ke Intl.DisplayNames se) */
function languageLabel(code?: string): string | null {
  if (!code) return null;

  try {
    const DisplayNames = (
      Intl as unknown as {
        DisplayNames: new (
          locales: string[],
          options: { type: string }
        ) => { of: (code: string) => string | undefined };
      }
    ).DisplayNames;

    return new DisplayNames(["en"], { type: "language" }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/* ---------------------------------- */
/* Movie details page                 */
/* ---------------------------------- */

function MovieDetailsPage({ user }: { user: User | null }) {
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
      <main className="min-h-screen bg-[#070910] px-5 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="shimmer h-8 w-36 rounded-lg" />

          <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
            <div className="shimmer aspect-[2/3] rounded-2xl" />

            <div className="space-y-5 pt-3">
              <div className="shimmer h-10 w-3/4 rounded-lg" />
              <div className="shimmer h-5 w-1/3 rounded-lg" />
              <div className="shimmer h-28 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="min-h-screen bg-[#070910] px-5 py-20 text-center text-white">
        <Film className="mx-auto mb-4 text-slate-500" size={42} />

        <h1 className="text-2xl font-bold">Movie unavailable</h1>

        <p className="mt-3 text-sm text-red-300">
          {error || "Movie details could not be found."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            <RefreshCw size={15} />
            Try Again
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm transition hover:bg-white/5"
          >
            Home
          </button>
        </div>
      </main>
    );
  }

  const backdrop = movie.backdrop_path
    ? getPosterUrl(movie.backdrop_path, "original")
    : "";

  const poster = getPosterUrl(movie.poster_path);
  const videos = movie.videos?.results ?? [];

  const trailer =
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official
    ) ??
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer"
    ) ??
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Teaser"
    );

  const cast = [...(movie.credits?.cast ?? [])]
    .sort((a, b) => a.order - b.order)
    .slice(0, 12);

  const crew = movie.credits?.crew ?? [];

  const director = crew.find(
    (member) => member.job === "Director"
  );

  const writers = crew
    .filter(
      (member) =>
        member.job === "Writer" ||
        member.job === "Screenplay" ||
        member.job === "Story"
    )
    .filter(
      (member, index, list) =>
        list.findIndex((item) => item.id === member.id) === index
    )
    .slice(0, 3);

  const rating =
    typeof movie.vote_average === "number" &&
    movie.vote_average > 0
      ? movie.vote_average.toFixed(1)
      : "N/A";

  const formatMoney = (amount?: number) => {
    if (typeof amount !== "number" || amount <= 0) {
      return "Not available";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const releaseDate = (() => {
    if (!movie.release_date) return "Not available";

    const date = new Date(`${movie.release_date}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  })();

  const productionCompanies = movie.production_companies ?? [];

  const imdbUrl = movie.imdb_id
    ? `https://www.imdb.com/title/${movie.imdb_id}/`
    : null;

  const officialWebsite = movie.homepage?.trim() || null;

  const informationCards = [
    { label: "Release Date", value: releaseDate },
    {
      label: "Runtime",
      value:
        typeof movie.runtime === "number" && movie.runtime > 0
          ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
          : "Not available",
    },
    { label: "Budget", value: formatMoney(movie.budget) },
    {
      label: "Box Office Revenue",
      value: formatMoney(movie.revenue),
    },
    {
      label: "Original Language",
      value: movie.original_language
        ? movie.original_language.toUpperCase()
        : "Not available",
    },
    {
      label: "Release Status",
      value: movie.status || "Not available",
    },
    {
      label: "User Rating",
      value: rating === "N/A" ? "Not available" : `${rating} / 10`,
    },
    {
      label: "Rating Votes",
      value:
        typeof movie.vote_count === "number" && movie.vote_count > 0
          ? movie.vote_count.toLocaleString("en-US")
          : "Not available",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070910] px-4 py-6 text-white sm:px-7 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-violet-300"
        >
          <ArrowLeft size={17} />
          Back to movies
        </Link>

        <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#10131f]">
          {backdrop && (
            <img
              src={backdrop}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#070910] via-[#070910]/90 to-[#070910]/45" />

          <div className="relative grid gap-8 p-5 sm:p-10 md:grid-cols-[240px_1fr] lg:gap-12 lg:p-14">
            <div>
              {poster ? (
                <img
                  src={poster}
                  alt={`${movie.title} poster`}
                  className="mx-auto w-full max-w-[260px] rounded-xl shadow-2xl"
                />
              ) : (
                <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-white/5">
                  <Film size={48} className="text-slate-500" />
                </div>
              )}
            </div>

            <div className="self-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
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
                  {rating} / 10
                </span>

                <span>
                  {movie.release_date?.slice(0, 4) || "Release date unknown"}
                </span>

                {movie.runtime ? <span>{movie.runtime} min</span> : null}

                {movie.original_language && (
                  <span className="uppercase">
                    {movie.original_language}
                  </span>
                )}
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

              <div className="mt-6 space-y-2 text-sm text-slate-400">
                {director && (
                  <p>
                    <span className="font-semibold text-slate-200">
                      Director:
                    </span>{" "}
                    {director.name}
                  </p>
                )}

                {writers.length > 0 && (
                  <p>
                    <span className="font-semibold text-slate-200">
                      Writer:
                    </span>{" "}
                    {writers.map((writer) => writer.name).join(", ")}
                  </p>
                )}

                <p>
                  <span className="font-semibold text-slate-200">
                    Status:
                  </span>{" "}
                  {movie.status || "Unknown"}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold transition hover:bg-violet-500"
                  >
                    <Play size={17} fill="currentColor" />
                    Watch Trailer
                  </a>
                )}

                {officialWebsite && (
                  <a
                    href={officialWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    Official Website ↗
                  </a>
                )}

                {imdbUrl && (
                  <a
                    href={imdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
                  >
                    IMDb ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              At a glance
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Movie Information
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {informationCards.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-white/[0.08] bg-[#10131f] p-4 transition hover:border-violet-400/30 sm:p-5"
              >
                <p className="text-xs font-medium text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 break-words text-sm font-bold text-white sm:text-base">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Behind the film
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Production Companies
            </h2>
          </div>

          {productionCompanies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {productionCompanies.map((company) => (
                <article
                  key={company.id}
                  className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-[#10131f] p-5 text-center transition hover:border-violet-400/30"
                >
                  {company.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                      alt={`${company.name} logo`}
                      loading="lazy"
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <Film size={28} className="text-violet-300" />
                  )}

                  <h3 className="text-sm font-semibold text-slate-200">
                    {company.name}
                  </h3>

                  {company.origin_country && (
                    <p className="text-xs text-slate-400">
                      {company.origin_country}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 bg-[#10131f] p-6 text-sm text-slate-400">
              Production company information is not available.
            </p>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Watch preview
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Official Trailer
            </h2>
          </div>

          {trailer ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10131f] shadow-2xl">
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailer.key}?rel=0`}
                  title={`${movie.title} trailer`}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="p-4 sm:p-5">
                <h3 className="font-semibold">
                  {trailer.name || `${movie.title} Official Trailer`}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  YouTube · Movie preview
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-12 text-center">
              <Play size={32} className="mx-auto mb-3 text-slate-500" />
              <h3 className="font-semibold">Trailer not available</h3>
              <p className="mt-2 text-sm text-slate-400">
                TMDB does not currently list a compatible YouTube trailer for this movie.
              </p>
            </div>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Meet the cast
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Cast & Characters
            </h2>
          </div>

          {cast.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
              {cast.map((member) => (
                <article
                  key={`${member.id}-${member.order}`}
                  className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#10131f] transition duration-300 hover:-translate-y-1 hover:border-violet-400/30"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-white/[0.04]">
                    {member.profile_path ? (
                      <img
                        src={getPosterUrl(member.profile_path, "w185")}
                        alt={member.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <UserRound size={42} className="text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-100">
                      {member.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                      {member.character || "Character not listed"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/10 p-6 text-sm text-slate-400">
              Cast information is not available for this movie.
            </p>
          )}
        </section>

        <div className="mt-12">
          <MovieReviews movieId={movie.id} user={user} />
        </div>

        <div className="mt-10 pb-10">
          <SimilarMovies movieId={movie.id} />
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------- */
/* Watchlist page                     */
/* ---------------------------------- */

function WatchlistPage({
  watchlist,
  onToggleWatchlist,
  onClearWatchlist,
  user,
  onSignOut,
  isLoading,
}: {
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie) => void;
  onClearWatchlist: () => void;
  user: User | null;
  onSignOut: () => void;
  isLoading: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "recent" | "title" | "year" | "rating"
  >("recent");
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const filteredMovies = [...watchlist]
    .filter((movie) =>
      movie.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          return (
            (Number(b.release_date?.slice(0, 4)) || 0) -
            (Number(a.release_date?.slice(0, 4)) || 0)
          );
        case "rating":
          return (b.vote_average || 0) - (a.vote_average || 0);
        case "recent":
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070910] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070910]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-7 lg:px-12">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-700 shadow-lg shadow-violet-950/30">
              <Clapperboard size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Cine<span className="text-violet-300">Scope</span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="flex items-center gap-3 sm:gap-6"
          >
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <Compass size={16} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to="/#trending"
              className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <Film size={16} />
              <span className="hidden sm:inline">Movies</span>
            </Link>

            <Link
              to="/watchlist"
              aria-current="page"
              className="flex items-center gap-2 text-sm font-semibold text-violet-300"
            >
              <Bookmark size={16} />
              <span className="hidden sm:inline">Watchlist</span>
              <span className="rounded-full border border-violet-300/20 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-200">
                {watchlist.length}
              </span>
            </Link>

            <Link
              to="/profile"
              aria-label="Profile"
              title="Profile"
              className="text-slate-400 transition hover:text-violet-300"
            >
              <UserRound size={18} />
            </Link>
          </nav>

          {user ? (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              title={user.email ?? "Sign out"}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold transition hover:bg-violet-500"
            >
              <UserRound size={15} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-145px)] max-w-[1440px] px-4 py-8 sm:px-7 sm:py-12 lg:px-12">
        <section className="relative mb-9 overflow-hidden rounded-2xl border border-violet-300/10 bg-gradient-to-br from-[#17142b] via-[#111322] to-[#0d1020] p-6 sm:p-9 lg:p-11">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">
                <Bookmark size={13} />
                Your personal collection
              </div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                My <span className="text-violet-300">Watchlist</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Keep track of the movies you love and discover what to watch next.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Film size={20} />
              </div>
              <div>
                <p className="text-2xl font-black tabular-nums">
                  {watchlist.length}
                </p>
                <p className="text-xs text-slate-400">
                  Saved {watchlist.length === 1 ? "movie" : "movies"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {!isLoading && watchlist.length > 0 && (
          <section className="mb-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search your saved movies..."
                  aria-label="Search saved movies"
                  className="w-full rounded-xl border border-white/10 bg-[#10131f] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>

              <div className="flex items-center gap-3">
                <label
                  htmlFor="watchlist-sort"
                  className="shrink-0 text-xs font-medium text-slate-400"
                >
                  Sort by
                </label>
                <select
                  id="watchlist-sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | "recent"
                        | "title"
                        | "year"
                        | "rating"
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#10131f] px-3 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50 sm:flex-none"
                >
                  <option value="recent">Recently added</option>
                  <option value="title">Title: A–Z</option>
                  <option value="year">Release year: Newest</option>
                  <option value="rating">Highest rated</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Showing {filteredMovies.length} of {watchlist.length}{" "}
                {watchlist.length === 1 ? "movie" : "movies"}
              </p>
              <button
                type="button"
                onClick={() => setShowClearConfirmation(true)}
                className="rounded-lg border border-red-400/15 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              >
                Clear watchlist
              </button>
            </div>
          </section>
        )}

        {isLoading ? (
          <section aria-label="Loading watchlist">
            <div className="mb-5 flex items-center gap-3 text-sm text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
              Syncing your watchlist...
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }, (_, index) => (
                <MovieSkeleton key={index} />
              ))}
            </div>
          </section>
        ) : watchlist.length === 0 ? (
          <section className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-500/10 text-violet-300">
              <Bookmark size={30} />
            </div>
            <h2 className="mt-6 text-xl font-bold sm:text-2xl">
              {user ? "Your watchlist is waiting" : "Sign in to build your watchlist"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              {user
                ? "You haven't saved any movies yet. Explore trending films and bookmark the ones you want to watch."
                : "Sign in to save movies to your personal collection and access your watchlist."}
            </p>
            <Link
              to={user ? "/#trending" : "/login"}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-950/20 transition hover:-translate-y-0.5 hover:bg-violet-500"
            >
              {user ? <Film size={17} /> : <UserRound size={17} />}
              {user ? "Explore movies" : "Sign in"}
            </Link>
          </section>
        ) : filteredMovies.length === 0 ? (
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-14 text-center">
            <Search size={30} className="mx-auto text-slate-500" />
            <h2 className="mt-4 text-lg font-bold">No matching movies</h2>
            <p className="mt-2 text-sm text-slate-400">
              Try a different title or clear your search.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-white/5"
            >
              Clear search
            </button>
          </section>
        ) : (
          <section>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isSaved
                  onToggleWatchlist={onToggleWatchlist}
                />
              ))}
            </div>
            <div className="mt-10 border-t border-white/[0.07] pt-6 text-center">
              <p className="text-xs text-slate-500">
                Your collection, ready for your next movie night.
              </p>
            </div>
          </section>
        )}
      </main>

      {showClearConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowClearConfirmation(false);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-watchlist-title"
            aria-describedby="clear-watchlist-description"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111321] p-6 shadow-2xl shadow-black/40 sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
              <Bookmark size={22} />
            </div>
            <h2 id="clear-watchlist-title" className="mt-5 text-xl font-bold">
              Clear your watchlist?
            </h2>
            <p
              id="clear-watchlist-description"
              className="mt-3 text-sm leading-6 text-slate-400"
            >
              This will remove all {watchlist.length} saved{" "}
              {watchlist.length === 1 ? "movie" : "movies"} from your collection.
              This action cannot be undone.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowClearConfirmation(false)}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Keep my movies
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowClearConfirmation(false);
                  onClearWatchlist();
                }}
                className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-400"
              >
                Yes, clear watchlist
              </button>
            </div>
          </section>
        </div>
      )}

      <footer className="border-t border-white/[0.07] px-4 py-6 text-center text-xs text-slate-500">
        CineScope · Discover your next favourite story
      </footer>
    </div>
  );
}

/* ---------------------------------- */
/* Homepage                           */
/* ---------------------------------- */

function HomePage({
  watchlist,
  onToggleWatchlist,
  user,
  onSignOut,
}: {
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie) => void;
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [featuredMovieId, setFeaturedMovieId] = useState<number | null>(null);
  /* Browser autoplay rules: pehla trailer muted shuru hota hai, speaker se awaaz on */
  const [heroMuted, setHeroMuted] = useState(true);
  const [trailerUnavailableId, setTrailerUnavailableId] = useState<
    number | null
  >(null);
  const [heroDetails, setHeroDetails] = useState<MovieDetails | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);
  const trendingRowRef = useRef<HTMLDivElement | null>(null);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  /* Search debounce */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  /* First page load (trending / search) */
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
      setFeaturedMovieId(null);

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
            err instanceof Error ? err.message : "Unable to load movies."
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

  /* Load next page */
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
          err instanceof Error ? err.message : "Could not load more movies."
        );
      }
    } finally {
      if (requestId.current === currentRequest) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [loading, page, totalPages, movies.length, debouncedQuery]);

  /*
    Infinite scroll: sentinel horizontal row ke andar aakhri item hai aur
    observer ka root wahi row hai. Isliye naya page tabhi load hoga jab user
    row ko scroll karke end ke paas pahunche.
  */
  useEffect(() => {
    const target = observerTarget.current;
    const root = trendingRowRef.current;

    if (!target || !root || loading || error || page >= totalPages) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMoreMovies();
        }
      },
      { root, rootMargin: "0px 400px 0px 0px", threshold: 0 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loading, error, page, totalPages, loadMoreMovies, movies.length]);

  const featuredMovie =
    movies.find((movie) => movie.id === featuredMovieId) ?? movies[0];

  /* Hero rotation: sirf pehli 5 movies ke IDs par depend karta hai */
  const heroIds = movies.slice(0, 5).map((movie) => movie.id).join(",");

  const trailerActive = !loading && !debouncedQuery && Boolean(featuredMovie);

  /* Hero ki 5 movies ki details pehle se la lo, taaki switch turant ho */
  useEffect(() => {
    if (!heroIds) return;
    heroIds.split(",").forEach((id) => void loadHeroDetails(Number(id)));
  }, [heroIds]);

  /* Featured movie ki details (runtime, genres, overview) */
  const featuredId = featuredMovie?.id;

  useEffect(() => {
    if (featuredId == null) return;

    let cancelled = false;

    void loadHeroDetails(featuredId).then((details) => {
      if (!cancelled && details) setHeroDetails(details);
    });

    return () => {
      cancelled = true;
    };
  }, [featuredId]);

  /* Purani movie ki details naye hero par na dikhein */
  const heroInfo =
    heroDetails && heroDetails.id === featuredId ? heroDetails : null;

  const heroRuntime =
    heroInfo?.runtime && heroInfo.runtime > 0
      ? `${Math.floor(heroInfo.runtime / 60)}h ${heroInfo.runtime % 60}m`
      : null;

  const heroMetaItems = [
    featuredMovie?.release_date?.slice(0, 4) || null,
    heroRuntime,
    languageLabel(heroInfo?.original_language),
  ].filter((item): item is string => Boolean(item));

  const heroGenres = (heroInfo?.genres ?? []).slice(0, 4);

  /* Agli hero movie par jao (last ke baad wapas pehli par) */
  const goToNextHeroMovie = useCallback(() => {
    const ids = heroIds ? heroIds.split(",").map(Number) : [];
    if (ids.length < 2) return;

    const currentIndex = ids.indexOf(featuredMovieId ?? ids[0]);
    const nextIndex = (currentIndex + 1) % ids.length;
    setFeaturedMovieId(ids[nextIndex]);
  }, [heroIds, featuredMovieId]);

  /* Fallback timer: sirf tab jab current movie ka trailer available nahi hai */
  useEffect(() => {
    if (loading || debouncedQuery) return;

    const ids = heroIds ? heroIds.split(",").map(Number) : [];
    if (ids.length < 2) return;

    const currentId = featuredMovie?.id ?? ids[0];
    if (trailerUnavailableId !== currentId) return;

    const timeoutId = window.setTimeout(goToNextHeroMovie, HERO_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [
    heroIds,
    featuredMovie?.id,
    trailerUnavailableId,
    loading,
    debouncedQuery,
    goToNextHeroMovie,
  ]);

  const scrollToTrending = () => {
    document.getElementById("trending")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const isSaved = (movie: Movie) =>
    watchlist.some((savedMovie) => savedMovie.id === movie.id);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--cinema-bg)] text-white">
<Navbar
  user={user}
  watchlist={watchlist}
  onSignOut={onSignOut}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  activeNav={activeNav}
  setActiveNav={setActiveNav}
  searchOpen={searchOpen}
  setSearchOpen={setSearchOpen}
  isMobileMenuOpen={isMobileMenuOpen}
  setIsMobileMenuOpen={setIsMobileMenuOpen}
  scrollToTrending={scrollToTrending}
/>

      <main className="lg:pl-[118px]">
        {/* Cinematic hero */}
     
<section
  id="home"
  className="relative h-screen min-h-[600px] w-full overflow-hidden bg-[var(--cinema-bg)]"
>

          {/* Featured movie backgrounds (crossfade) */}
          {movies.slice(0, 5).map((movie) => {
            const src = movie.backdrop_path
              ? getPosterUrl(movie.backdrop_path, "w1280")
              : movie.poster_path
                ? getPosterUrl(movie.poster_path, "w780")
                : "";

            return src ? (
              <img
                key={movie.id}
                src={src}
                alt=""
                aria-hidden="true"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
                  featuredMovie?.id === movie.id ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null;
          })}

          {/* Trailer video: backdrop ke upar, overlays ke neeche */}
          <HeroTrailer
            movieId={featuredMovie?.id ?? null}
            enabled={trailerActive}
            muted={heroMuted}
            onEnded={goToNextHeroMovie}
            onUnavailable={setTrailerUnavailableId}
          />

          {/* Cinematic overlays (theme: --cinema-bg) */}
          <div className="absolute inset-0 bg-[var(--cinema-bg)]/25" />
          <div className="hero-fade" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--cinema-bg)] to-transparent" />

          {/* Hero content */}
          <div className="relative flex h-full min-h-[620px] items-center px-5 pb-32 pt-16 sm:min-h-[660px] sm:px-8 lg:min-h-[700px] lg:px-[21px] lg:pb-24 lg:pt-10">
            {featuredMovie && (
              <div key={featuredMovie.id} className="animate-fade-up w-full max-w-[600px]">
                <h1 className="text-4xl font-black uppercase leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)] sm:text-6xl lg:text-[68px]">
                  {featuredMovie.title}
                </h1>

                {featuredMovie.vote_average > 0 && (
                  <p className="mt-4 text-lg font-semibold text-[var(--cinema-accent-hover)]">
                    TMDB {featuredMovie.vote_average.toFixed(1)}
                  </p>
                )}

                {heroMetaItems.length > 0 && (
                  <p className="mt-6 flex flex-wrap items-center gap-x-3 text-base font-semibold text-slate-100 sm:text-lg">
                    {heroMetaItems.map((item, index) => (
                      <span key={item} className="flex items-center gap-3">
                        {index > 0 && (
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                        )}
                        {item}
                      </span>
                    ))}
                  </p>
                )}

                {heroInfo?.overview && (
                  <p className="mt-4 line-clamp-3 max-w-[520px] text-base leading-[30px] text-slate-300 sm:text-lg">
                    {heroInfo.overview}
                  </p>
                )}

                {heroGenres.length > 0 && (
                  <p className="mt-7 flex flex-wrap items-center gap-x-3 text-base font-semibold text-slate-200 sm:text-lg">
                    {heroGenres.map((genre, index) => (
                      <span key={genre.id} className="flex items-center gap-3">
                        {index > 0 && (
                          <span className="h-4 w-px bg-slate-400/60" />
                        )}
                        {genre.name}
                      </span>
                    ))}
                  </p>
                )}

                <div className="mt-9 flex items-center gap-5">
                  <Link
                    to={`/movie/${featuredMovie.id}`}
                    className="flex h-14 w-full max-w-[431px] items-center justify-center gap-3 rounded-md bg-gradient-to-r from-[var(--cinema-accent)] to-[var(--cinema-pink)] text-lg font-bold text-white transition duration-200 hover:scale-[1.02] hover:brightness-110 sm:h-16"
                  >
                    <Play size={22} fill="currentColor" />
                    Watch Now
                  </Link>

                  <button
                    type="button"
                    onClick={() => onToggleWatchlist(featuredMovie)}
                    aria-pressed={isSaved(featuredMovie)}
                    aria-label={
                      isSaved(featuredMovie)
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                    title={
                      isSaved(featuredMovie)
                        ? "Remove from watchlist"
                        : "Add to watchlist"
                    }
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30 sm:h-16 sm:w-16"
                  >
                    {isSaved(featuredMovie) ? (
                      <Check size={26} />
                    ) : (
                      <Plus size={28} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Sound toggle */}
            {trailerActive && (
              <button
                type="button"
                onClick={() => setHeroMuted((muted) => !muted)}
                aria-label={heroMuted ? "Unmute trailer" : "Mute trailer"}
                aria-pressed={!heroMuted}
                title={heroMuted ? "Unmute" : "Mute"}
                className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md transition hover:scale-110 hover:border-white/70 lg:right-10 lg:top-[68%]"
              >
                {heroMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
              </button>
            )}

            {/* Featured movie thumbnails (landscape strip) */}
            {!loading && !debouncedQuery && movies.length > 1 && (
              <div className="absolute inset-x-5 bottom-6 z-10 flex items-center justify-center gap-2 lg:inset-x-auto lg:bottom-[68px] lg:right-10 lg:justify-end lg:gap-2.5">
                {movies.slice(0, 5).map((movie) => {
                  const thumbnail = movie.backdrop_path
                    ? getPosterUrl(movie.backdrop_path, "w780")
                    : movie.poster_path
                      ? getPosterUrl(movie.poster_path, "w185")
                      : "";

                  const isActive = featuredMovie?.id === movie.id;

                  return (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => setFeaturedMovieId(movie.id)}
                      aria-label={`Feature ${movie.title}`}
                      aria-pressed={isActive}
                      title={movie.title}
                      className={`h-[44px] w-[74px] shrink-0 overflow-hidden rounded-md border-2 bg-[var(--cinema-surface-2)] transition duration-300 sm:h-[54px] sm:w-[96px] ${
                        isActive
                          ? "scale-105 border-white shadow-lg shadow-black/50"
                          : "border-transparent opacity-70 hover:scale-105 hover:opacity-100"
                      }`}
                    >
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={movie.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Film className="m-auto text-slate-400" size={20} />
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={goToNextHeroMovie}
                  aria-label="Next featured movie"
                  title="Next"
                  className="flex h-[44px] w-7 shrink-0 items-center justify-center text-white transition hover:scale-125 sm:h-[54px]"
                >
                  <ChevronRight size={26} />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Trending movies */}
        <section
          id="trending"
          className="mx-auto max-w-[1600px] scroll-mt-20 px-4 pb-12 pt-3 sm:px-7 sm:pb-16 lg:px-[21px]"
        >
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-400">
                {debouncedQuery ? "Search results" : "What everyone's watching"}
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {debouncedQuery
                  ? `Movies matching "${debouncedQuery}"`
                  : "Trending Movies"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {loading
                  ? "Finding movies for you..."
                  : `${movies.length} movies loaded`}
              </p>
            </div>

            {debouncedQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-sky-400 transition hover:text-sky-300"
              >
                Clear search
                <span aria-hidden="true">→</span>
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-5"
            >
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
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
              {Array.from({ length: 6 }, (_, index) => (
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
              <div
                ref={trendingRowRef}
                className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-5 sm:gap-5"
              >
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="w-[44%] min-w-[145px] max-w-[230px] shrink-0 snap-start sm:w-[30%] lg:w-[calc((100%-6.25rem)/6)]"
                  >
                    <MovieCard
                      movie={movie}
                      isSaved={isSaved(movie)}
                      onToggleWatchlist={onToggleWatchlist}
                    />
                  </div>
                ))}

                {/* Sentinel: row ke end par, scroll karne par hi trigger hoga */}
                <div
                  ref={observerTarget}
                  aria-hidden="true"
                  className="w-px shrink-0"
                />

                {loadingMore &&
                  Array.from({ length: 3 }, (_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="w-[44%] min-w-[145px] max-w-[230px] shrink-0 sm:w-[30%] lg:w-[calc((100%-6.25rem)/6)]"
                    >
                      <MovieSkeleton />
                    </div>
                  ))}
              </div>

              {!loadingMore && page < totalPages && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadMoreMovies()}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold transition hover:border-sky-400/40 hover:bg-sky-500/10"
                  >
                    Load More Movies
                  </button>
                </div>
              )}

              {page >= totalPages && movies.length > 0 && (
                <p className="mt-6 text-center text-sm text-slate-500">
                  You have reached the end of the results.
                </p>
              )}
            </>
          )}
        </section>

        {/* Watchlist preview */}
        <section
          id="watchlist"
          className="mx-auto mb-12 max-w-[1504px] scroll-mt-24 px-4 sm:px-7 lg:px-12"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0b1629] to-[#080f1d] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-400/15 bg-sky-400/10 text-sky-300">
                  <Bookmark size={21} />
                </div>
                <div>
                  <h2 className="font-bold">My List</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {watchlist.length} saved{" "}
                    {watchlist.length === 1 ? "movie" : "movies"}
                  </p>
                </div>
              </div>

              {watchlist.length > 0 && (
                <Link
                  to="/watchlist"
                  className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                >
                  View All →
                </Link>
              )}
            </div>

            {watchlist.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                <Bookmark
                  className="mx-auto mb-3 text-slate-500"
                  size={30}
                />
                <h3 className="font-semibold">Your list is empty</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Browse trending movies and bookmark the ones you want to watch.
                </p>
                {!user && (
                  <Link
                    to="/login"
                    className="mt-4 inline-flex rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-bold transition hover:bg-sky-400"
                  >
                    Sign in to save movies
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                {watchlist.slice(0, 6).map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isSaved
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-white/[0.07] px-4 py-7 text-center text-xs text-slate-500">
          CineScope · Discover your next favourite story
        </footer>
      </main>
    </div>
  );
}

/* ---------------------------------- */
/* App and Supabase session           */
/* ---------------------------------- */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error("Could not restore Supabase session:", error.message);
      }

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
              typeof movie.title === "string"
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

  const toggleWatchlist = useCallback(
    async (movie: Movie) => {
      if (!user) {
        window.alert("Please sign in to save movies to your watchlist.");
        window.location.assign("/login");
        return;
      }

      const isAlreadySaved = watchlist.some(
        (item) => item.id === movie.id
      );

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

        setWatchlist((previous) =>
          previous.filter((item) => item.id !== movie.id)
        );
        return;
      }

      const { error } = await supabase.from("watchlist").insert({
        user_id: user.id,
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
          : [movie, ...previous]
      );
    },
    [user, watchlist]
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
      <main className="flex min-h-screen items-center justify-center bg-[#070910] text-white">
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400 border-t-transparent" />
          Loading CineScope...
        </div>
      </main>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToHash />

      {watchlistLoading && (
        <div className="fixed bottom-4 right-4 z-[100] rounded-lg border border-white/10 bg-[#10131f] px-4 py-2 text-xs text-slate-300 shadow-xl">
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
              isLoading={watchlistLoading}
            />
          }
        />

        <Route
          path="/movie/:id"
          element={<MovieDetailsPage user={user} />}
        />

        <Route
          path="/login"
          element={<AuthPage mode="login" />}
        />

        <Route
          path="/signup"
          element={<AuthPage mode="signup" />}
        />

        <Route
          path="/profile"
          element={<ProfilePage user={user} />}
        />

        <Route
          path="*"
          element={
            <main className="min-h-screen bg-[#070910] px-5 py-20 text-center text-white">
              <h1 className="text-3xl font-bold">Page not found</h1>
              <Link
                to="/"
                className="mt-5 inline-block text-violet-300 hover:text-violet-200"
              >
                Return to CineScope
              </Link>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}