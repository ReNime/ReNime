'use client';

import { useEffect, useState } from 'react';
import { fetchChapterImages } from '@/app/libs/mangadex';
import { useRouter } from 'next/navigation';

export default function ChapterReader({ chapterId, mode = 'manga' }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (!chapterId) return;

    setLoading(true);
    setPage(0);

    fetchChapterImages(chapterId)
      .then((res) => {
        if (!res) throw new Error('Failed load chapter');
        setData(res);
      })
      .catch(() => setError('Gagal load chapter'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const images = data.data.map(
    (img) => `${data.baseUrl}/data/${data.hash}/${img}`
  );

  return (
    <div className={`${dark ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen`}>

      {/* Header */}
      <header className="fixed top-0 w-full z-10 flex justify-between items-center p-3 backdrop-blur bg-opacity-70">
        <div className="flex gap-3">
          {data.prev && (
            <button onClick={() => router.push(`/manga/${data.prev}`)}>
              ⏮ Prev
            </button>
          )}
          {data.next && (
            <button onClick={() => router.push(`/manga/${data.next}`)}>
              Next ⏭
            </button>
          )}
        </div>

        <button onClick={() => setDark(!dark)}>
          {dark ? '🌙' : '☀️'}
        </button>
      </header>

      {/* Content */}
      <main className="pt-16 px-2 flex justify-center">

        {/* PAGE MODE (MANGA) */}
        {mode === 'manga' && (
          <div className="flex items-center gap-4">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-2xl"
            >
              ◀
            </button>

            <img
              src={images[page]}
              alt={`page-${page}`}
              className="max-h-[90vh] object-contain"
            />

            <button
              disabled={page === images.length - 1}
              onClick={() => setPage((p) => p + 1)}
              className="text-2xl"
            >
              ▶
            </button>
          </div>
        )}

        {/* SCROLL MODE (MANHWA) */}
        {mode === 'manhwa' && (
          <div className="max-w-3xl w-full">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`page-${i}`}
                className="w-full mb-2"
                loading="lazy"
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
