
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

const TMDB_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  original_title?: string;
  original_language?: string;
  adult?: boolean;
  genre_ids?: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at?: string;
  size?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string;
  status: string;

  videos: {
    results: MovieVideo[];
  };

  credits: MovieCredits;

  budget?: number;
  revenue?: number;
  homepage?: string;
  imdb_id?: string | null;
  production_companies?: ProductionCompany[];
}

export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

interface TMDBErrorResponse {
  status_message?: string;
}

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  if (!TMDB_TOKEN) {
    throw new Error(
      "TMDB API token is missing. Add VITE_TMDB_ACCESS_TOKEN to your .env.local file."
    );
  }

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TMDB_TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    let message = `TMDB request failed (${response.status}).`;

    try {
      const errorData =
        (await response.json()) as TMDBErrorResponse;

      if (errorData.status_message) {
        message = errorData.status_message;
      }
    } catch {
      // Keep the default error message if the response is not JSON.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getTrendingMovies(
  page = 1
): Promise<MovieListResponse> {
  return tmdbFetch<MovieListResponse>(
    `/trending/movie/week?language=en-US&page=${page}`
  );
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<MovieListResponse> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    language: "en-US",
    include_adult: "false",
  });

  return tmdbFetch<MovieListResponse>(
    `/search/movie?${params.toString()}`
  );
}

export async function getMovieDetails(
  id: string | number
): Promise<MovieDetails> {
  const params = new URLSearchParams({
    language: "en-US",
    append_to_response: "videos,credits",
  });

  return tmdbFetch<MovieDetails>(
    `/movie/${encodeURIComponent(String(id))}?${params.toString()}`
  );
}

export function getPosterUrl(
  path: string | null | undefined,
  size = "w500"
): string {
  if (!path) {
    return "https://placehold.co/500x750/111827/FFFFFF?text=No+Poster";
  }

  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}
