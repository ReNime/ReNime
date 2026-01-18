"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, PlayCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb';
import CommentSection from '@/app/components/CommentSection';

// Skeleton Component
function WatchPageSkeleton() {
  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary animate-pulse">
      <div className="container mx-auto px-4 py-8">
        <div className="aspect-video bg-theme-tertiary rounded-lg mb-4 shadow-lg"></div>
        <div className="bg-theme-secondary p-4 rounded-lg mb-4">
          <div className="h-7 w-48 bg-theme-tertiary rounded mb-3"></div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-9 w-28 bg-theme-tertiary rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Display Component
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

// Main Content Component
function WatchPageContent({ params, episodeSlug }) {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();

  const [episodeTitle, setEpisodeTitle] = useState(null);
  const [servers, setServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [activeIdentifier, setActiveIdentifier] = useState(null);
  const [isSwitchingServer, setIsSwitchingServer] = useState(false);
  const [isValidPrev, setIsValidPrev] = useState(false);
  const [isValidNext, setIsValidNext] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);

  const [watchStartTime, setWatchStartTime] = useState(null);
  const [accumulatedMinutes, setAccumulatedMinutes] = useState(0);
  const [showLevelUpNotif, setShowLevelUpNotif] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch Episode Data
  useEffect(() => {
    if (!episodeSlug) {
      setError("Slug episode tidak valid.");
      setIsLoading(false);
      return;
    }

    async function fetchEpisodeData() {
      setIsLoading(true);
      setError(null);
      setCurrentStreamUrl(null);
      setServers([]);
      setEpisodeTitle(null);
      setDownloadLinks([]);
      setIsValidPrev(false);
      setIsValidNext(false);

      try {
        const episodeResponse = await fetch(`${apiUrl}/episode/${episodeSlug}`);
        if (!episodeResponse.ok) {
          throw new Error(`Gagal mengambil data episode. Status: ${episodeResponse.status}`);
        }
        const episodeData = await episodeResponse.json();

        setEpisodeTitle(episodeData.title);
        setServers(episodeData.streams || []);
        setDownloadLinks(episodeData.downloads || []);

        const defaultStream = episodeData.streams?.[0];
        if (defaultStream) {
          setCurrentStreamUrl(defaultStream.url);
          setActiveIdentifier(defaultStream.url);
        }

        const slugFromUrl = searchParams.get('slug');
        const titleFromUrl = searchParams.get('title');
        const imageFromUrl = searchParams.get('image');

        if (slugFromUrl && titleFromUrl && imageFromUrl) {
          const info = { slug: slugFromUrl, title: titleFromUrl, image: imageFromUrl };
          setAnimeInfo(info);
          sessionStorage.setItem('lastWatchedAnimeInfo', JSON.stringify(info));
        } else {
          const cachedInfo = sessionStorage.getItem('lastWatchedAnimeInfo');
          if (cachedInfo) {
            setAnimeInfo(JSON.parse(cachedInfo));
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEpisodeData();
  }, [episodeSlug, apiUrl, searchParams]);

  // Save History
  useEffect(() => {
    if (animeInfo?.slug && session) {
      const saveHistory = async () => {
        try {
          await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              animeId: animeInfo.slug,
              episodeId: episodeSlug,
              title: animeInfo.title,
              image: animeInfo.image,
            }),
          });
        } catch (err) {
          console.error("Gagal menyimpan riwayat:", err);
        }
      };
      saveHistory();
    }
  }, [animeInfo, session, episodeSlug]);

  // Watch Progress Tracking
  useEffect(() => {
    if (!session || !episodeSlug || !currentStreamUrl) return;

    const startTime = Date.now();
    setWatchStartTime(startTime);
    let localAccumulatedMinutes = 0;

    const trackingInterval = setInterval(async () => {
      const minutesWatched = 2;
      try {
        const response = await fetch('/api/watch-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ episodeId: episodeSlug, watchDuration: minutesWatched }),
        });

        if (response.ok) {
          const data = await response.json();
          localAccumulatedMinutes += minutesWatched;
          setAccumulatedMinutes(localAccumulatedMinutes);
          
          if (data.leveledUp) {
            setNewLevel(data.level);
            setShowLevelUpNotif(true);
            setTimeout(() => setShowLevelUpNotif(false), 5000);
          }
        }
      } catch (err) {
        console.error("Gagal menyimpan progress:", err);
      }
    }, 2 * 60 * 1000);

    return () => clearInterval(trackingInterval);
  }, [session, episodeSlug, currentStreamUrl]);

  const handleServerClick = (server) => {
    setIsSwitchingServer(true);
    setActiveIdentifier(server.url);
    setCurrentStreamUrl(server.url);
    setTimeout(() => setIsSwitchingServer(false), 300);
  };

  const { prevSlug, nextSlug } = useMemo(() => {
    if (!episodeSlug) return { prevSlug: null, nextSlug: null };
    const match = episodeSlug.match(/-episode-(\d+)$/);
    if (!match) return { prevSlug: null, nextSlug: null };
    const baseSlug = episodeSlug.substring(0, match.index);
    const currentEpisodeNumber = parseInt(match[1], 10);
    const nextSlug = `${baseSlug}-episode-${currentEpisodeNumber + 1}`;
    const prevSlug = currentEpisodeNumber > 1 ? `${baseSlug}-episode-${currentEpisodeNumber - 1}` : null;
    return { prevSlug, nextSlug };
  }, [episodeSlug]);

  useEffect(() => {
    const checkEpisodeExistence = async () => {
      if (prevSlug) {
        try {
          const response = await fetch(`${apiUrl}/episode/${prevSlug}`, { method: 'HEAD' });
          setIsValidPrev(response.ok);
        } catch { setIsValidPrev(false); }
      }
      if (nextSlug) {
        try {
          const response = await fetch(`${apiUrl}/episode/${nextSlug}`, { method: 'HEAD' });
          setIsValidNext(response.ok);
        } catch { setIsValidNext(false); }
      }
    };
    if (prevSlug || nextSlug) checkEpisodeExistence();
  }, [prevSlug, nextSlug, apiUrl]);

  if (isLoading) return <WatchPageSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  if (!servers || servers.length === 0) return <ErrorDisplay message="Data episode tidak ditemukan." />;

  const breadcrumbs = animeInfo?.slug ? [
    { title: animeInfo.title, href: `/detail/${animeInfo.slug}` },
    { title: episodeTitle || 'Loading...', href: `/watch/${episodeSlug}` }
  ] : [{ title: episodeTitle || 'Loading...', href: `/watch/${episodeSlug}` }];

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      {/* Level Up Notification */}
      {showLevelUpNotif && (
        <div className="fixed top-4 right-4 z-50 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce"
             style={{ background: 'linear-gradient(to right, #fbbf24, #a855f7, #ec4899)' }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">ðŸŽ‰</span>
            <div>
              <p className="font-bold text-lg">Level Up! ðŸ‘‘</p>
              <p className="text-sm">Sekarang kamu Level {newLevel}</p>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <ResponsiveBreadcrumb crumbs={breadcrumbs} />

        {/* Video Player */}
        <div className="aspect-video bg-theme-tertiary rounded-lg overflow-hidden mb-6 shadow-lg border border-theme">
          {isSwitchingServer && (
            <div className="w-full h-full flex flex-col justify-center items-center bg-theme-secondary">
              <PlayCircleIcon className="h-16 w-16 mb-4 animate-pulse" style={{ color: 'var(--accent-from)' }} />
              <h2 className="text-xl font-bold animate-pulse">Memuat Server...</h2>
            </div>
          )}
          {!isSwitchingServer && currentStreamUrl && (
            <iframe src={currentStreamUrl} allowFullScreen className="w-full h-full border-0" key={currentStreamUrl}></iframe>
          )}
        </div>

        {/* Episode Info & Navigation */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 gradient-theme-text">{episodeTitle}</h1>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            {isValidPrev ? (
              <Link href={`/watch/${prevSlug}`} 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-theme-primary"
                    style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))', boxShadow: '0 0 20px var(--shadow-theme)' }}>
                <ChevronLeftIcon className="h-5 w-5" />
                Episode Sebelumnya
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-theme-tertiary text-theme-tertiary opacity-50 cursor-not-allowed">
                <ChevronLeftIcon className="h-5 w-5" />
                Episode Sebelumnya
              </div>
            )}

            {isValidNext ? (
              <Link href={`/watch/${nextSlug}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-theme-primary"
                    style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))', boxShadow: '0 0 20px var(--shadow-theme)' }}>
                Episode Selanjutnya
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-theme-tertiary text-theme-tertiary opacity-50 cursor-not-allowed">
                Episode Selanjutnya
                <ChevronRightIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Server Selection */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 gradient-theme-text">Pilih Server</h2>
          <div className="bg-theme-tertiary rounded-lg p-4 mb-4 border-l-4" style={{ borderColor: 'var(--accent-from)' }}>
            <p className="text-sm text-theme-secondary">
              ðŸ’¡ Server error? Coba beralih ke server lain di bawah ini.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {servers.map((server) => (
              <button
                key={server.url}
                onClick={() => handleServerClick(server)}
                disabled={isSwitchingServer}
                className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeIdentifier === server.url
                    ? 'text-theme-primary scale-105'
                    : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-primary'
                }`}
                style={activeIdentifier === server.url ? {
                  background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
                  boxShadow: '0 0 20px var(--shadow-theme)'
                } : {}}
              >
                {server.name}
              </button>
            ))}
          </div>
        </div>

        {/* Download Section */}
        {downloadLinks.length > 0 && (
          <div className="bg-theme-secondary border border-theme rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ArrowDownTrayIcon className="h-6 w-6" style={{ color: 'var(--accent-from)' }} />
              <span className="gradient-theme-text">Download Episode</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {downloadLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 text-theme-primary border border-theme"
                  style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  {link.quality || `Download ${index + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Comment Section */}
        {episodeSlug && <CommentSection episodeId={episodeSlug} />}
      </div>
    </div>
  );
}

export default function WatchPage({ params }) {
  const resolvedParams = React.use ? React.use(params) : params;
  const episodeSlugArray = resolvedParams?.episodeSlug;
  const episodeSlug = Array.isArray(episodeSlugArray) ? episodeSlugArray[episodeSlugArray.length - 1] : episodeSlugArray || null;

  return (
    <React.Suspense fallback={<WatchPageSkeleton />}>
      <WatchPageContent params={params} episodeSlug={episodeSlug} />
    </React.Suspense>
  );
}
