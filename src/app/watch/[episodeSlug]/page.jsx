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

// Main Content
function WatchPageContent({ episodeSlug }) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [episodeTitle, setEpisodeTitle] = useState(null);
  const [servers, setServers] = useState([]);
  const [currentStreamUrl, setCurrentStreamUrl] = useState(null);
  const [activeIdentifier, setActiveIdentifier] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [isSwitchingServer, setIsSwitchingServer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValidPrev, setIsValidPrev] = useState(false);
  const [isValidNext, setIsValidNext] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch episode data
  useEffect(() => {
    if (!episodeSlug) return;

    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch(`${apiUrl}/episode/${episodeSlug}`);
        if (!res.ok) throw new Error("Gagal mengambil data episode");
        const data = await res.json();

        setEpisodeTitle(data.title);
        setServers(data.streams || []);
        setDownloadLinks(data.downloads || []);

        if (data.streams?.length > 0) {
          setCurrentStreamUrl(data.streams[0].url);
          setActiveIdentifier(data.streams[0].url);
        }

        const slug = searchParams.get("slug");
        const title = searchParams.get("title");
        const image = searchParams.get("image");

        if (slug && title && image) {
          const info = { slug, title, image };
          setAnimeInfo(info);
          sessionStorage.setItem("lastWatchedAnimeInfo", JSON.stringify(info));
        } else {
          const cached = sessionStorage.getItem("lastWatchedAnimeInfo");
          if (cached) setAnimeInfo(JSON.parse(cached));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [episodeSlug, apiUrl, searchParams]);

  // Prev / Next slug
  const { prevSlug, nextSlug } = useMemo(() => {
    const match = episodeSlug?.match(/-episode-(\d+)$/);
    if (!match) return {};
    const base = episodeSlug.substring(0, match.index);
    const num = parseInt(match[1], 10);
    return {
      prevSlug: num > 1 ? `${base}-episode-${num - 1}` : null,
      nextSlug: `${base}-episode-${num + 1}`,
    };
  }, [episodeSlug]);

  useEffect(() => {
    async function check() {
      if (prevSlug) {
        const r = await fetch(`${apiUrl}/episode/${prevSlug}`, { method: "HEAD" });
        setIsValidPrev(r.ok);
      }
      if (nextSlug) {
        const r = await fetch(`${apiUrl}/episode/${nextSlug}`, { method: "HEAD" });
        setIsValidNext(r.ok);
      }
    }
    check();
  }, [prevSlug, nextSlug, apiUrl]);

  if (isLoading) return <WatchPageSkeleton />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <div className="container mx-auto px-4 py-8">
        <ResponsiveBreadcrumb
          crumbs={
            animeInfo
              ? [
                  { title: animeInfo.title, href: `/detail/${animeInfo.slug}` },
                  { title: episodeTitle, href: `/watch/${episodeSlug}` },
                ]
              : [{ title: episodeTitle, href: `/watch/${episodeSlug}` }]
          }
        />

        {/* Video */}
        <div className="aspect-video bg-theme-tertiary rounded-lg overflow-hidden mb-6 shadow-lg">
          {isSwitchingServer ? (
            <div className="w-full h-full flex items-center justify-center">
              <PlayCircleIcon className="h-16 w-16 animate-pulse" />
            </div>
          ) : (
            <iframe
              src={currentStreamUrl}
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
        </div>

        {/* Episode Info & Navigation */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 gradient-theme-text">
            {episodeTitle}
          </h1>

          {/* Prev / Next */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {isValidPrev ? (
              <Link
                href={`/watch/${prevSlug}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-theme-primary transition-all hover:scale-105"
                style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Episode Sebelumnya
              </Link>
            ) : (
              <div className="px-6 py-3 rounded-lg bg-theme-tertiary opacity-50">
                Episode Sebelumnya
              </div>
            )}

            {isValidNext ? (
              <Link
                href={`/watch/${nextSlug}`}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-theme-primary transition-all hover:scale-105"
                style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}
              >
                Episode Selanjutnya
                <ChevronRightIcon className="h-5 w-5" />
              </Link>
            ) : (
              <div className="px-6 py-3 rounded-lg bg-theme-tertiary opacity-50">
                Episode Selanjutnya
              </div>
            )}
          </div>

          {/* 🔽 DOWNLOAD BUTTON (DI BAWAH EPISODE SELANJUTNYA) */}
          {downloadLinks.length > 0 && (
            <div className="mt-6 flex justify-end">
              <a
                href={downloadLinks[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 text-theme-primary"
                style={{
                  background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
                  boxShadow: '0 0 20px var(--shadow-theme)',
                }}
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Download Episode
              </a>
            </div>
          )}
        </div>

        {/* Server */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 gradient-theme-text">
            Pilih Server
          </h2>
          <div className="flex flex-wrap gap-3">
            {servers.map((server) => (
              <button
                key={server.url}
                onClick={() => {
                  setIsSwitchingServer(true);
                  setActiveIdentifier(server.url);
                  setCurrentStreamUrl(server.url);
                  setTimeout(() => setIsSwitchingServer(false), 300);
                }}
                className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                  activeIdentifier === server.url
                    ? 'text-theme-primary scale-105'
                    : 'bg-theme-tertiary'
                }`}
              >
                {server.name}
              </button>
            ))}
          </div>
        </div>

        <CommentSection episodeId={episodeSlug} />
      </div>
    </div>
  );
}

export default function WatchPage({ params }) {
  const episodeSlug = Array.isArray(params.episodeSlug)
    ? params.episodeSlug.at(-1)
    : params.episodeSlug;

  return (
    <React.Suspense fallback={<WatchPageSkeleton />}>
      <WatchPageContent episodeSlug={episodeSlug} />
    </React.Suspense>
  );
}
