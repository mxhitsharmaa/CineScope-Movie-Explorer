
import { useEffect, useState } from "react";
import { Star, Trash2, Pencil, Send, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type Review = {
  id: number;
  movie_id: number;
  user_id: string;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
};

type MovieReviewsProps = {
  movieId: number;
  user: User | null;
};

export default function MovieReviews({
  movieId,
  user,
}: MovieReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const ownReview = reviews.find((review) => review.user_id === user?.id);

  async function loadReviews() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("movie_reviews")
      .select("*")
      .eq("movie_id", movieId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setReviews((data ?? []) as Review[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("movie_reviews")
        .select("*")
        .eq("movie_id", movieId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReviews((data ?? []) as Review[]);
      }

      setLoading(false);
    }

    void fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  function startEditing(review: Review) {
    setEditingId(review.id);
    setRating(review.rating);
    setReviewText(review.review);
    setMessage("");
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setRating(0);
    setReviewText("");
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!user) {
      setError("Please sign in to write a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    const trimmedReview = reviewText.trim();

    if (trimmedReview.length < 10 || trimmedReview.length > 1000) {
      setError("Your review must be between 10 and 1000 characters.");
      return;
    }

    setSaving(true);

    const payload = {
      movie_id: movieId,
      rating,
      review: trimmedReview,
    };

    const result = editingId !== null
      ? await supabase
          .from("movie_reviews")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)
          .eq("user_id", user.id)
      : await supabase
          .from("movie_reviews")
          .insert({
            ...payload,
            user_id: user.id,
          });

    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(editingId !== null ? "Review updated!" : "Review submitted!");
      cancelEditing();
      await loadReviews();
    }

    setSaving(false);
  }

  async function deleteReview(reviewId: number) {
    if (!user) return;

    const confirmed = window.confirm("Delete your review?");
    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from("movie_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setReviews((previous) =>
      previous.filter((review) => review.id !== reviewId)
    );

    if (editingId === reviewId) cancelEditing();
    setMessage("Review deleted.");
  }

  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) /
      reviews.length
    : 0;

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
            Community
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-bold">
            <MessageSquare size={21} />
            Reviews & Ratings
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
            {reviews.length > 0 && (
              <> · Average {averageRating.toFixed(1)} / 5</>
            )}
          </p>
        </div>
      </div>

      {user ? (
        <form
          onSubmit={submitReview}
          className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4 sm:p-5"
        >
          <h3 className="font-semibold">
            {editingId !== null ? "Edit your review" : ownReview ? "Your review" : "Write a review"}
          </h3>

          <div className="mt-4 flex items-center gap-2" aria-label="Choose a rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={rating === value}
                className="rounded-md p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Star
                  size={27}
                  className={value <= rating ? "text-amber-400" : "text-slate-600"}
                  fill={value <= rating ? "currentColor" : "none"}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-slate-400">
              {rating ? `${rating}/5` : "Select stars"}
            </span>
          </div>

          <label htmlFor="movie-review" className="mt-4 block text-sm font-medium text-slate-300">
            Your thoughts
          </label>
          <textarea
            id="movie-review"
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            minLength={10}
            maxLength={1000}
            rows={4}
            placeholder="What did you think about this movie?"
            className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#070b14] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
            required
          />
          <p className="mt-1 text-right text-xs text-slate-500">
            {reviewText.trim().length}/1000 characters (minimum 10)
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>
          )}
          {message && (
            <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={15} />
              {saving ? "Saving..." : editingId !== null ? "Update Review" : ownReview ? "Submit New Review" : "Submit Review"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
            )}
          </div>

          {ownReview && editingId === null && (
            <p className="mt-3 text-xs text-slate-500">
              You have already reviewed this movie. Select Edit below to change your review.
            </p>
          )}
        </form>
      ) : (
        <div className="mt-6 rounded-xl border border-white/10 p-5">
          <p className="text-sm text-slate-300">Sign in to rate this movie and write a review.</p>
          <a href="/login" className="mt-3 inline-block rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold hover:bg-blue-400">
            Sign in
          </a>
        </div>
      )}

      {error && !user && (
        <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>
      )}

      <div className="mt-7 space-y-4">
        <h3 className="font-semibold">What people are saying</h3>

        {loading ? (
          <div className="rounded-xl border border-white/10 p-5 text-sm text-slate-400">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
            <MessageSquare className="mx-auto mb-3 text-slate-500" size={30} />
            <p className="font-semibold">No reviews yet</p>
            <p className="mt-2 text-sm text-slate-400">
              Be the first to share your thoughts on this movie.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        size={14}
                        className={value <= review.rating ? "text-amber-400" : "text-slate-700"}
                        fill={value <= review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(review.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {review.updated_at !== review.created_at && " · Edited"}
                  </p>
                </div>

                {user?.id === review.user_id && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(review)}
                      aria-label="Edit your review"
                      className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-blue-400/30 hover:text-blue-300"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteReview(review.id)}
                      aria-label="Delete your review"
                      className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-red-400/30 hover:text-red-300"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {review.review}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
