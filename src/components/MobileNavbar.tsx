import { Bookmark, Compass, Film, Menu, UserRound, X } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileNavbarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  watchlistCount: number;
}

export default function MobileNavbar({
  isOpen,
  onToggle,
  onClose,
  watchlistCount,
}: MobileNavbarProps) {
  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-200 ${
          isOpen
            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
            : "border-white/10 bg-[#0b1020] text-slate-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
        }`}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-black/50"
          />

          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] p-3 shadow-2xl shadow-black/50"
          >
            <div className="mb-3 flex items-center gap-3 border-b border-white/[0.08] px-3 pb-4 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
                <Film size={21} />
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-white">
                  CineScope
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Your world of cinema
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <a
                href="#home"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                <Compass
                  size={19}
                  className="text-slate-400 group-hover:text-cyan-300"
                />
                <span className="flex-1">Home</span>
              </a>

              <a
                href="#trending"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                <Film
                  size={19}
                  className="text-slate-400 group-hover:text-cyan-300"
                />
                <span className="flex-1">Movies</span>
              </a>

              <Link
                to="/watchlist"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                <Bookmark
                  size={19}
                  className="text-slate-400 group-hover:text-cyan-300"
                />
                <span className="flex-1">Watchlist</span>

                {watchlistCount > 0 && (
                  <span className="flex min-w-6 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[11px] font-bold tabular-nums text-cyan-300">
                    {watchlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/profile"
                onClick={onClose}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                <UserRound
                  size={19}
                  className="text-slate-400 group-hover:text-cyan-300"
                />
                <span className="flex-1">Profile</span>
              </Link>
            </div>

            <div className="mt-3 border-t border-white/[0.08] px-3 pb-1 pt-3">
              <p className="text-xs text-slate-500">
                Discover your next favorite movie.
              </p>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
