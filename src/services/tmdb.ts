
const API_BASE_URL = "https://api.themoviedb.org/3";
const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  tagline: string;
  status: string;
}

interface MovieResponse {
  results: Movie[];
  page: number;
  total_pages: number;
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  if (!token) {
    throw new Error(
      "TMDB token missing. Add VITE_TMDB_ACCESS_TOKEN to .env.local."
    );
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function getTrendingMovies(page = 1) {
  return tmdbFetch<MovieResponse>(
    `/trending/movie/week?language=en-US&page=${page}`
  );
}

export function searchMovies(query: string, page = 1) {
  return tmdbFetch<MovieResponse>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
  );
}

export function getMovieDetails(id: string | number) {
  return tmdbFetch<MovieDetails>(
    `/movie/${id}?language=en-US`
  );
}

export function getPosterUrl(
  path: string | null,
  size = "w500"
): string | null {
  return path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : null;
}
