
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  CalendarDays,
  Bookmark,
  Save,
  LogOut,
  Film,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface ProfilePageProps {
  user: User | null;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedName = user?.user_metadata?.full_name;

    setDisplayName(
      typeof savedName === "string"
        ? savedName
        : user?.email?.split("@")[0] ?? ""
    );
  }, [user]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!user) {
      setError("Please sign in to update your profile.");
      return;
    }

    const name = displayName.trim();

    if (!name) {
      setError("Please enter your display name.");
      return;
    }

    if (name.length > 50) {
      setError("Display name must be 50 characters or fewer.");
      return;
    }

    setSaving(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            full_name: name,
          },
        });

      if (updateError) {
        throw updateError;
      }

      setMessage("Your profile was updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");
    setLoggingOut(true);

    try {
      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not log out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-20 text-white">
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <UserRound className="mx-auto mb-4 h-12 w-12 text-indigo-400" />

          <h1 className="text-2xl font-bold">Your Profile</h1>

          <p className="mt-3 text-slate-400">
            Please sign in to view and manage your profile.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Movies
          </Link>
        </div>
      </main>
    );
  }

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  const avatarLetter =
    displayName.trim().charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
            CineScope Account
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your account and movie experience.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex flex-col gap-5 border-b border-slate-800 bg-gradient-to-r from-indigo-950 to-slate-900 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold">
              {avatarLetter}
            </div>

            <div className="min-w-0">
              <h2 className="break-words text-2xl font-bold">
                {displayName || "Movie Lover"}
              </h2>

              <p className="mt-1 break-all text-slate-300">
                {user.email}
              </p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Account signed in
              </span>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <Mail className="h-5 w-5 text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-400">
                    Email Address
                  </p>
                  <p className="mt-1 break-all font-medium">
                    {user.email || "Not available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-500/10 p-2">
                  <CalendarDays className="h-5 w-5 text-indigo-400" />
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Member Since
                  </p>
                  <p className="mt-1 font-medium">{joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Personal Information</h2>
            <p className="mt-1 text-sm text-slate-400">
              Update the name displayed on your profile.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Display Name
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={50}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                value={user.email ?? ""}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-slate-400"
              />

              <p className="mt-2 text-xs text-slate-500">
                Your email is shown for reference and cannot be changed here.
              </p>
            </div>

            {message && (
              <p
                role="status"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400"
              >
                {message}
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Your Movies</h2>

          <p className="mt-2 text-sm text-slate-400">
            Continue exploring and keep track of movies you love.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/watchlist"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-medium transition hover:border-indigo-500 hover:bg-indigo-500/10"
            >
              <Bookmark className="h-4 w-4" />
              My Watchlist
            </Link>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-medium transition hover:border-indigo-500 hover:bg-indigo-500/10"
            >
              <Film className="h-4 w-4" />
              Explore Movies
            </Link>
          </div>
        </section>

        <section className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-red-500/20 bg-slate-900 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-bold">Sign out</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sign out of your CineScope account on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out..." : "Logout"}
          </button>
        </section>
      </div>
    </main>
  );
}
