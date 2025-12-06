// app/page.js
import AnimeCompleted from "@/app/components/AnimeCompleted";
import AnimeOngoing from "@/app/components/AnimeOngoing";
import BottomNav from "@/app/components/BottomNav";
import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import React from "react";
import Navbar from "./components/Navbar";
import { AuthUserSession } from "./libs/auth-libs";

// Helper fetch function (unchanged)
async function fetchAndFilterAnime(baseUrl, endpoint, desiredLimit = 10) {
  let filteredAnimes = [];
  let currentPage = 1;
  let hasNextPage = true;
  const validTypes = ["TV", "Movie", "Spesial"];
  const maxPagesToFetch = 5;

  while (
    filteredAnimes.length < desiredLimit &&
    hasNextPage &&
    currentPage <= maxPagesToFetch
  ) {
    try {
      const response = await fetch(`${baseUrl}/${endpoint}?page=${currentPage}`);
      if (!response.ok) break;

      const data = await response.json();
      const validAnimes = (data.animes || []).filter((anime) =>
        validTypes.includes(anime.type)
      );

      for (const anime of validAnimes) {
        if (filteredAnimes.length < desiredLimit) {
          filteredAnimes.push(anime);
        }
      }

      hasNextPage = data.pagination?.hasNext || false;
      currentPage++;
    } catch (err) {
      console.error(err);
      break;
    }
  }
  return filteredAnimes;
}

// Skeleton & Warning components (unchanged)
function ApiWarningMessage({ sectionTitle }) {
  return (
    <div className="p-4 text-theme-secondary bg-theme-secondary border border-theme rounded-lg mt-4">
      ⚠️ Data for {sectionTitle} could not be loaded.
    </div>
  );
}

function AnimeListSkeleton() {
  return (
    <div className="p-4 animate-pulse bg-theme-secondary rounded-lg border border-theme">
      <div className="h-6 bg-theme-tertiary rounded mb-2"></div>
      <div className="h-6 bg-theme-tertiary rounded w-2/3"></div>
    </div>
  );
}

// ===============================
//         HOME PAGE
// ===============================

const Home = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const user = await AuthUserSession();

  let animeOngoing = [];
  let animeComplete = [];

  let ongoingFetchFailed = false;
  let completedFetchFailed = false;

  try {
    const [ongoingResult, completedResult] = await Promise.allSettled([
      fetchAndFilterAnime(apiUrl, "ongoing", 10),
      fetchAndFilterAnime(apiUrl, "completed", 10),
    ]);

    if (ongoingResult.status === "fulfilled") {
      animeOngoing = ongoingResult.value;
      if (animeOngoing.length === 0) ongoingFetchFailed = true;
    } else {
      ongoingFetchFailed = true;
    }

    if (completedResult.status === "fulfilled") {
      animeComplete = completedResult.value;
      if (animeComplete.length === 0) completedFetchFailed = true;
    } else {
      completedFetchFailed = true;
    }
  } catch (err) {
    ongoingFetchFailed = true;
    completedFetchFailed = true;
  }

  return (
    <div className="bg-theme-primary text-theme-primary min-h-screen transition-all">

      {/* Navbar */}
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="bg-theme-secondary border-b border-theme shadow-lg">
        <HeroSection />
      </div>

      {/* Anime Ongoing */}
      <div className="px-4">
        <Header title="Anime OnGoing" />

        {ongoingFetchFailed ? (
          <ApiWarningMessage sectionTitle="OnGoing" />
        ) : (
          <AnimeOngoing api={animeOngoing} />
        )}
      </div>

      {/* Anime Completed */}
      <div className="px-4 mt-6">
        <Header title="Anime Completed" />

        <React.Suspense fallback={<AnimeListSkeleton />}>
          {completedFetchFailed ? (
            <ApiWarningMessage sectionTitle="Completed" />
          ) : (
            <AnimeCompleted api={animeComplete} />
          )}
        </React.Suspense>
      </div>

      {/* Bottom Nav */}
      <div className="mt-10">
        <BottomNav />
      </div>
    </div>
  );
};

export default Home;
