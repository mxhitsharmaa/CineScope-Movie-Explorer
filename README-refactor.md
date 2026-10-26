# CineScope Refactor Notes

This refactor keeps the existing app behavior and separates reusable UI into focused files.

## Components extracted

- `src/components/MovieCard.tsx` renders a movie poster, rating, title, release year, and watchlist action.
- `src/components/MovieSkeleton.tsx` renders the movie loading placeholder.
- `src/components/ScrollToHash.tsx` handles route changes and in-page hash scrolling.

Existing components for trailers, reviews, similar movies, mobile navigation, profile, and authentication remain in their existing files.

## Run the project

1. Install Node.js.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your Supabase project URL and publishable key to `.env.local`.
5. Run `npm run dev`.
6. Check the production build with `npm run build`.

Do not commit `.env.local` or any real secret values.
