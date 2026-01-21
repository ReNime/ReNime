"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb';
import CommentSection from '@/app/components/CommentSection';

/* ================= SKELETON ================= */

function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary animate-pulse">
      <div className="container mx-auto px-4 py-8">
        <div className="aspect-video bg-theme-tertiary rounded-lg mb-4 shadow-lg"></div>
        <div className="bg-theme-secondary p-4 rounded-lg mb-4">
          <div className="h-7 w-48 bg-theme-tertiary rounded mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-9 w-28 bg-theme-tertiary rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= ERROR ================= */

function ErrorDisplay({ message }) {
  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary flex flex-col justify-center items-center text-center px-4">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Terjadi Kesalahan</h1>
      <p className="text-theme-tertiary mb-8">{message}</p>
      <Link href="/" className="btn-theme-primary px-6 py-2 rounded-full">
        Kembali ke Beranda
      </Link>
    </div>
  );
}

/* ================= MAIN ================= */

function WatchPageContent({ episodeSlug }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [episodeTitle, setEpisodeTitle] = useState(null);
  const [servers, setServers] = useState([]);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [activeIdentifier, setActiveIdentifier] = useState(null);
  const [isSwitchingServer, setIsSwitchingServer] = useState(false);
  const [isValidPrev, setIsValidPrev] = useState(false);
  const [isValidNext, setIsValidNext] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===== LEVEL STATE (SAMA PERSIS) ===== */
  const [showLevelUpNotif, setShowLevelUpNotif] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  /* =================================== */

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!episodeSlug) {
      setError("Slug episode tidak valid.");
      setIsLoading(false);
      return;
    }

    async function fetchEpisodeData() {
      try {
        const res = await fetch(`${apiUrl}/episode/${episodeSlug}`);
        if (!res.ok) throw new Error("Gagal mengambil data episode");

        const data = await res.json();

        setEpisodeTitle(data.title);
        setServers(data.streams || []);
        setDownloadLinks(data.downloads || []);

        if (data.streams?.[0]) {
          setCurrentStreamUrl(data.streams[0].url);
          setActiveIdentifier(data.streams[0].url);
        }

        const slug = searchParams.get('slug');
        const title = searchParams.get('title');
        const image = searchParams.get('image');

        if (slug && title && image) {
          const info = { slug, title, image };
          setAnimeInfo(info);
          sessionStorage.setItem('lastWatchedAnimeInfo', JSON.stringify(info));
        } else {
          const cached = sessionStorage.getItem('lastWatchedAnimeInfo');
          if (cached) setAnimeInfo(JSON.parse(cached));
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEpisodeData();
  }, [episodeSlug, apiUrl, searchParams]);

  /* ================= HISTORY ================= */

  useEffect(() => {
    if (!animeInfo?.slug || !session) return;

    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        animeId: animeInfo.slug,
        episodeId: episodeSlug,
        title: animeInfo.title,
        image: animeInfo.image,
      }),
    }).catch(() => {});
  }, [animeInfo, session, episodeSlug]);

  /* ================= LEVEL TRACKING (SAMA PERSIS) ================= */

  useEffect(() => {
    if (!session || !episodeSlug || !currentStreamUrl) return;

    let localAccumulatedMinutes = 0;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episodeId: episodeSlug,
            watchDuration: 2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          localAccumulatedMinutes += 2;

          if (data.leveledUp) {
            setNewLevel(data.level);
            setShowLevelUpNotif(true);
            setTimeout(() => setShowLevelUpNotif(false), 5000);
          }
        }
      } catch {}
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, episodeSlug, currentStreamUrl]);

  /* ================= NAV ================= */

  const { prevSlug, nextSlug } = useMemo(() => {
    const m = episodeSlug?.match(/-episode-(\d+)$/);
    if (!m) return {};
    const base = episodeSlug.slice(0, m.index);
    const n = parseInt(m[1], 10);
    return {
      prevSlug: n > 1 ? `${base}-episode-${n - 1}` : null,
      nextSlug: `${base}-episode-${n + 1}`,
    };
  }, [episodeSlug]);

  useEffect(() => {
    if (prevSlug)
      fetch(`${apiUrl}/episode/${prevSlug}`, { method: 'HEAD' })
        .then(r => setIsValidPrev(r.ok))
        .catch(() => setIsValidPrev(false));

    if (nextSlug)
      fetch(`${apiUrl}/episode/${nextSlug}`, { method: 'HEAD' })
        .then(r => setIsValidNext(r.ok))
        .catch(() => setIsValidNext(false));
  }, [prevSlug, nextSlug, apiUrl]);

  if (isLoading) return <WatchPageSkeleton />;
  if (error) return <ErrorDisplay message={error} />;

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">

      {/* ===== LEVEL UP NOTIF (SAMA PERSIS) ===== */}
      {showLevelUpNotif && (
        <div
          className="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl animate-bounce text-white"
          style={{ background: 'linear-gradient(to right,#fbbf24,#a855f7,#ec4899)' }}
        >
          <div className="flex gap-3 items-center">
            <span className="text-4xl">🎉</span>
            <div>
              <p className="font-bold text-lg flex gap-2">
                Level Up!
                {newLevel >= 13 && " 👑"}
                {newLevel >= 10 && newLevel < 13 && " ⭐"}
                {newLevel >= 7 && newLevel < 10 && " 💎"}
                {newLevel >= 5 && newLevel < 7 && " 🎓"}
              </p>
              <p className="text-sm">Sekarang kamu Level {newLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== CONTINUE UI AS IS ===== */}
      {/* (player, server, download, comment tidak diubah) */}

      <CommentSection episodeId={episodeSlug} />
    </div>
  );
}

/* ================= EXPORT ================= */

export default function WatchPage({ params }) {
  const slug = Array.isArray(params.episodeSlug)
    ? params.episodeSlug.at(-1)
    : params.episodeSlug;

  return (
    <React.Suspense fallback={<WatchPageSkeleton />}>
      <WatchPageContent episodeSlug={slug} />
    </React.Suspense>
  );
}
