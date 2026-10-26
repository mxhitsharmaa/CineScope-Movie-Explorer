import { useEffect, useRef, useState } from "react";
import { loadHeroDetails, pickTrailerKey } from "../services/heroDetails";

/* ------------------------------------------------------------------ */
/* Minimal YouTube IFrame API typings                                   */
/* ------------------------------------------------------------------ */

type YTPlayer = {
  loadVideoById: (options: { videoId: string }) => void;
  mute: () => void;
  unMute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube API failed to load"));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}

/* ------------------------------------------------------------------ */
/* Trailer lookup (details cache shared with the hero)                  */
/* ------------------------------------------------------------------ */

async function getTrailerKey(movieId: number): Promise<string | null> {
  return pickTrailerKey(await loadHeroDetails(movieId));
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

type HeroTrailerProps = {
  movieId: number | null;
  /** false => trailer band, sirf backdrop image dikhegi */
  enabled: boolean;
  muted: boolean;
  /** Trailer khatam hone par call hota hai */
  onEnded: () => void;
  /** Trailer nahi mila / play nahi ho paya */
  onUnavailable: (movieId: number) => void;
};

export default function HeroTrailer({
  movieId,
  enabled,
  muted,
  onEnded,
  onUnavailable,
}: HeroTrailerProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const visibleRef = useRef(true);

  const mutedRef = useRef(muted);
  const movieIdRef = useRef(movieId);
  const onEndedRef = useRef(onEnded);
  const onUnavailableRef = useRef(onUnavailable);

  mutedRef.current = muted;
  movieIdRef.current = movieId;
  onEndedRef.current = onEnded;
  onUnavailableRef.current = onUnavailable;

  const [playing, setPlaying] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });

  /* Video ko hero ke andar "object-cover" ki tarah fit karo */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const update = () => {
      const cw = wrap.clientWidth;
      const ch = wrap.clientHeight;
      if (!cw || !ch) return;

      let w = cw;
      let h = (w * 9) / 16;

      if (h < ch) {
        h = ch;
        w = (h * 16) / 9;
      }

      /* Thoda zoom taaki YouTube ke edges/title bar crop ho jayein */
      setSize({ w: w * 1.15, h: h * 1.15 });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrap);

    return () => observer.disconnect();
  }, []);

  /* Hero screen se bahar ho to trailer pause (awaaz bhi band) */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;

        if (!readyRef.current || !playerRef.current) return;

        if (entry.isIntersecting) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(wrap);

    return () => observer.disconnect();
  }, []);

  /* Mute / unmute (speaker button) */
  useEffect(() => {
    if (!readyRef.current || !playerRef.current) return;

    if (muted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
    }
  }, [muted]);

  /* Movie badalte hi uska trailer load karo */
  useEffect(() => {
    if (!enabled || movieId == null) {
      playerRef.current?.pauseVideo();
      setPlaying(false);
      return;
    }

    let cancelled = false;
    setPlaying(false);

    async function start(id: number) {
      const [key] = await Promise.all([
        getTrailerKey(id),
        loadYouTubeApi().catch(() => undefined),
      ]);

      if (cancelled) return;

      if (!key || !window.YT?.Player || !wrapRef.current) {
        onUnavailableRef.current(id);
        return;
      }

      if (playerRef.current) {
        playerRef.current.loadVideoById({ videoId: key });
        return;
      }

      /* Player ke liye alag div banao, React ke DOM se bahar */
      const mount = document.createElement("div");
      wrapRef.current
        .querySelector("[data-yt-slot]")
        ?.appendChild(mount);

      playerRef.current = new window.YT.Player(mount, {
        videoId: key,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          iv_load_policy: 3,
          mute: mutedRef.current ? 1 : 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: { target: YTPlayer }) => {
            readyRef.current = true;

            if (mutedRef.current) {
              event.target.mute();
            } else {
              event.target.unMute();
            }

            if (visibleRef.current) event.target.playVideo();
          },
          onStateChange: (event: { data: number }) => {
            /* 1 = playing, 0 = ended */
            if (event.data === 1) setPlaying(true);

            if (event.data === 0) {
              setPlaying(false);
              onEndedRef.current();
            }
          },
          onError: () => {
            if (movieIdRef.current != null) {
              onUnavailableRef.current(movieIdRef.current);
            }
          },
        },
      }) as YTPlayer;
    }

    void start(movieId);

    return () => {
      cancelled = true;
    };
  }, [movieId, enabled]);

  /* Unmount par player saaf karo */
  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      readyRef.current = false;
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ${
        playing && enabled ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        data-yt-slot
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [&_iframe]:h-full [&_iframe]:w-full"
        style={{ width: size.w, height: size.h }}
      />
    </div>
  );
}