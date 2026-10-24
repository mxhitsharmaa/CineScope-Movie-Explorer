import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clapperboard, Eye, EyeOff, LoaderCircle, Mail, LockKeyhole } from "lucide-react";
import { supabase } from "../lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (signupError) throw signupError;

        if (data.session) {
          navigate("/", { replace: true });
        } else {
          setSuccess("Account created. Check your email for a confirmation link, then sign in.");
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (loginError) throw loginError;
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Unable to ${isSignup ? "create your account" : "sign in"}. Please try again.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b14] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(37,99,235,0.2),transparent_38%),radial-gradient(ellipse_at_85%_80%,rgba(79,70,229,0.16),transparent_38%)]" />
      <Link to="/" className="absolute left-4 top-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white sm:left-8 sm:top-8">
        <ArrowLeft size={16} /> Back to CineScope
      </Link>

      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1423]/95 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-700">
            <Clapperboard size={23} />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">Cine<span className="text-blue-400">Scope</span></span>
        </Link>

        <div className="mt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Your movie journey</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isSignup ? "Sign up to get started with CineScope." : "Sign in to continue exploring movies."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-400/10">
              <Mail size={17} className="shrink-0 text-slate-500" />
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-600" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-400/10">
              <LockKeyhole size={17} className="shrink-0 text-slate-500" />
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-600" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="shrink-0 text-slate-500 transition hover:text-white">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 focus-within:border-blue-400/60 focus-within:ring-2 focus-within:ring-blue-400/10">
                <LockKeyhole size={17} className="shrink-0 text-slate-500" />
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter password again" className="min-w-0 flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-600" />
              </div>
            </div>
          )}

          {error && <p role="alert" className="rounded-lg border border-red-400/20 bg-red-400/[0.08] px-3.5 py-3 text-sm leading-5 text-red-300">{error}</p>}
          {success && <p role="status" className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] px-3.5 py-3 text-sm leading-5 text-emerald-300">{success}</p>}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 text-sm font-bold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60">
            {loading && <LoaderCircle size={17} className="animate-spin" />}
            {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignup ? "Already have an account?" : "New to CineScope?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-blue-400 transition hover:text-blue-300">
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <p className="mt-5 text-center text-xs leading-5 text-slate-600">Your account is managed securely by Supabase Authentication.</p>
      </section>
    </main>
  );
}
