import { type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Clapperboard,
  Home,
  LayoutGrid,
  LogOut,
  Search,
  Sparkles,
  Tv,
  UserRound,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Movie } from "../services/tmdb";
import MobileNavbar from "./MobileNavbar";

type NavbarProps = {
  user: User | null;
  watchlist: Movie[];
  onSignOut: () => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeNav: string;
  setActiveNav: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean | ((previous: boolean) => boolean)) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (
    value: boolean | ((previous: boolean) => boolean)
  ) => void;
  scrollToTrending: () => void;
};

export default function Navbar({
  user,
  watchlist,
  onSignOut,
  searchQuery,
  setSearchQuery,
  activeNav,
  setActiveNav,
  searchOpen,
  setSearchOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  scrollToTrending,
}: NavbarProps) {
  const navigationItems = [
    { label: "Home", icon: Home, href: "#home", nav: "Home" },
    { label: "Movies", icon: Tv, href: "#trending", nav: "Movies" },
    {
      label: "Trailers",
      icon: Clapperboard,
      href: "#trending",
      nav: "Trending",
    },
    {
      label: "My List",
      icon: LayoutGrid,
      href: "#watchlist",
      nav: "My List",
    },
  ];

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveNav("Movies");
    setIsMobileMenuOpen(false);
    setSearchOpen(false);
    scrollToTrending();
  }

  function handleHomeClick() {
    setSearchQuery("");
    setSearchOpen(false);
    setActiveNav("Home");
    setIsMobileMenuOpen(false);
  }

  function handleNavigationClick(nav: string) {
    setActiveNav(nav);
    setIsMobileMenuOpen(false);
  }

  function handleCloseSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[84px] flex-col items-center border-r border-white/[0.06] bg-[var(--cinema-bg)]/95 py-6 backdrop-blur-xl lg:flex">
        <Link
          to="/"
          aria-label="CineScope home"
          onClick={handleHomeClick}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-sky-400 transition hover:bg-sky-400/10 hover:text-sky-300"
        >
          <Sparkles size={26} strokeWidth={1.7} />
        </Link>

        <nav
          aria-label="Sidebar navigation"
          className="mt-14 flex flex-col items-center gap-4"
        >
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label="Search movies"
            aria-pressed={searchOpen}
            title="Search movies"
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
              searchOpen
                ? "bg-sky-400/10 text-sky-400"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            {searchOpen && (
              <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sky-400" />
            )}
            <Search size={21} />
          </button>

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.nav && !searchOpen;

            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => handleNavigationClick(item.nav)}
                aria-label={item.label}
                aria-current={isActive ? "location" : undefined}
                title={item.label}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
                  isActive
                    ? "bg-sky-400/10 text-sky-400"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-sky-400" />
                )}

                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  fill={
                    isActive && item.label === "Home"
                      ? "currentColor"
                      : "none"
                  }
                />
              </a>
            );
          })}

          <Link
            to="/watchlist"
            onClick={() => handleNavigationClick("My List")}
            aria-label={`Watchlist, ${watchlist.length} saved movies`}
            title="Watchlist"
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
              activeNav === "My List"
                ? "bg-sky-400/10 text-sky-400"
                : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Bookmark size={21} />

            {watchlist.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--cinema-bg)] bg-sky-500 px-1 text-[9px] font-bold text-white">
                {watchlist.length > 99 ? "99+" : watchlist.length}
              </span>
            )}
          </Link>
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4">
          {user && (
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              title={user.email ?? "Sign out"}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
            >
              <LogOut size={19} />
            </button>
          )}

          <Link
            to={user ? "/profile" : "/login"}
            aria-label={user ? "Open profile" : "Sign in"}
            title={user?.email ?? "Sign in"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-sky-400/50 hover:bg-sky-400/10 hover:text-sky-300"
          >
            <UserRound size={19} />
          </Link>
        </div>
      </aside>

      {/* Desktop search panel */}
      {searchOpen && (
        <form
          onSubmit={handleSearchSubmit}
          className="fixed left-[100px] top-5 z-[60] hidden w-[min(400px,45vw)] items-center gap-3 rounded-xl border border-white/10 bg-[var(--cinema-surface)] p-3 shadow-2xl lg:flex"
        >
          <Search size={19} className="shrink-0 text-sky-400" />

          <input
            autoFocus
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                handleCloseSearch();
              }
            }}
            placeholder="Search movies by title..."
            aria-label="Search movies"
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleCloseSearch}
            aria-label="Close search"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={17} />
          </button>
        </form>
      )}

      {/* Mobile and tablet header */}
      <header className="absolute inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--cinema-bg)]/25 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex h-[64px] max-w-[1600px] items-center justify-between gap-2 px-3 sm:px-5">
          <Link
            to="/"
            aria-label="CineScope home"
            onClick={handleHomeClick}
            className="flex shrink-0 items-center gap-2"
          >
            <Clapperboard
              size={24}
              strokeWidth={2}
              className="text-sky-400"
            />

            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              Cine<span className="text-sky-400">Scope</span>
            </span>
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 w-[clamp(100px,30vw,190px)] items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 transition focus-within:border-sky-400/50 sm:px-3"
            >
              <Search size={16} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveNav("Movies");
                }}
                placeholder="Search..."
                aria-label="Search movies"
                className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-slate-500 sm:text-sm"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="shrink-0 text-slate-400 transition hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            <Link
              to={user ? "/profile" : "/login"}
              aria-label={user ? "Open profile" : "Sign in"}
              title={user?.email ?? "Sign in"}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-slate-200 transition hover:border-sky-400/50 hover:text-sky-300 sm:flex"
            >
              <UserRound size={17} />
            </Link>

            <div className="shrink-0">
              <MobileNavbar
                isOpen={isMobileMenuOpen}
                onToggle={() => setIsMobileMenuOpen((open) => !open)}
                onClose={() => setIsMobileMenuOpen(false)}
                watchlistCount={watchlist.length}
              />
            </div>

            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                title={user.email ?? "Sign out"}
                className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300 sm:flex"
              >
                <LogOut size={14} />
                <span className="hidden xl:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-sky-500 px-2.5 text-xs font-bold text-white transition hover:bg-sky-400 sm:flex"
              >
                <UserRound size={14} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}