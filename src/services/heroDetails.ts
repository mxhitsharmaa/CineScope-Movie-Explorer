
import { getMovieDetails, type MovieDetails } from "./tmdb";

const cache = new Map<number, Promise<MovieDetails | null>>();

export function loadHeroDetails(
  movieId: number
): Promise<MovieDetails | null> {
  const cached = cache.get(movieId);

  if (cached) {
    return cached;
  }

  const request = getMovieDetails(String(movieId)).catch(() => {
    cache.delete(movieId);
    return null;
  });

  cache.set(movieId, request);

  return request;
}

export function pickTrailerKey(
  details: MovieDetails | null
): string | null {
  const videos = details?.videos?.results ?? [];

  const trailer =
    videos.find(
      (video) =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official
    ) ??
    videos.find(
      (video) =>
        video.site === "YouTube" && video.type === "Trailer"
    ) ??
    videos.find(
      (video) =>
        video.site === "YouTube" && video.type === "Teaser"
    );

  return trailer?.key ?? null;
}
