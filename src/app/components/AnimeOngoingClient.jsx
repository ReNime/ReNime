"use client";

import { useState } from "react";
import AnimeOngoing from "./AnimeOngoing";

const AnimeOngoingClient = ({ initialData, apiUrl }) => {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;

    try {
      const res = await fetch(`${apiUrl}/ongoing?page=${nextPage}`);
      const result = await res.json();

      if (!result.animes || result.animes.length === 0) {
        setHasMore(false);
      } else {
        setData(prev => [...prev, ...result.animes]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error("Load more ongoing gagal:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimeOngoing api={data} />

      {hasMore && (
        <div className="flex justify-center mb-12">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-theme-secondary hover:opacity-80 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
};

export default AnimeOngoingClient;
