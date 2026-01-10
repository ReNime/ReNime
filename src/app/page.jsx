// app/page.js

import AnimeCompleted from "@/app/components/AnimeCompleted";
import AnimeOngoing from "@/app/components/AnimeOngoing";
import BottomNav from "@/app/components/BottomNav";
import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import React from 'react';
//import Navbar from "./components/Sidebar"; 
import Navbar from "./components/Navbar"; 
import { AuthUserSession } from "./libs/auth-libs"; 

// Warning Message Component with Theme
function ApiWarningMessage({ sectionTitle }) {
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="text-center p-8 rounded-xl bg-theme-secondary border border-theme max-w-md">
        <svg 
          className="w-16 h-16 mx-auto mb-4 text-theme-tertiary" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="text-lg font-semibold text-theme-primary mb-2">
          Gagal Memuat {sectionTitle}
        </h3>
        <p className="text-theme-tertiary text-sm">
          Terjadi kesalahan saat mengambil data. Silakan coba lagi nanti.
        </p>
      </div>
    </div>
  );
}

// Skeleton Loading with Theme
function AnimeListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 my-8">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[2/3] w-full bg-theme-tertiary rounded-lg"></div>
          <div className="mt-2 h-4 bg-theme-tertiary rounded w-3/4"></div>
          <div className="mt-1 h-3 bg-theme-tertiary rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Helper function to fetch and filter anime
async function fetchAndFilterAnime(baseUrl, endpoint, desiredLimit = 10) {
  let filteredAnimes = [];
  let currentPage = 1;
  let hasNextPage = true;
  const validTypes = ['TV', 'Movie', 'Spesial'];
  const maxPagesToFetch = 5; 

  while (
    filteredAnimes.length < desiredLimit && 
    hasNextPage && 
    currentPage <= maxPagesToFetch
  ) {
    try {
      const response = await fetch(`${baseUrl}/${endpoint}?page=${currentPage}`);
      
      if (!response.ok) {
        console.error(`Gagal fetch ${endpoint} page ${currentPage}: Status ${response.status}`);
        hasNextPage = false;
        continue;
      }

      const data = await response.json();
      const animesOnThisPage = data.animes || [];

      const validAnimes = animesOnThisPage.filter(anime => 
        validTypes.includes(anime.type)
      );

      for (const anime of validAnimes) {
        if (filteredAnimes.length < desiredLimit) {
          filteredAnimes.push(anime);
        } else {
          break;
        }
      }

      hasNextPage = data.pagination?.hasNext || false;
      currentPage++;

    } catch (error) {
      console.error(`Error saat processing ${endpoint} page ${currentPage}:`, error);
      hasNextPage = false;
    }
  }

  return filteredAnimes;
}

// Home Component
const Home = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const user = await AuthUserSession();

  let animeOngoing = [];
  let animeComplete = [];
  let ongoingFetchFailed = false;
  let completedFetchFailed = false;

  try {
    const [ongoingResult, completedResult] = await Promise.allSettled([
      fetchAndFilterAnime(apiUrl, 'ongoing', 10),
      fetchAndFilterAnime(apiUrl, 'completed', 10)
    ]);

    if (ongoingResult.status === 'fulfilled') {
      animeOngoing = ongoingResult.value;
      if (animeOngoing.length === 0) ongoingFetchFailed = true; 
    } else {
      console.error("Fetch ongoing gagal:", ongoingResult.reason);
      ongoingFetchFailed = true;
    }

    if (completedResult.status === 'fulfilled') {
      animeComplete = completedResult.value;
      if (animeComplete.length === 0) completedFetchFailed = true; 
    } else {
      console.error("Fetch completed gagal:", completedResult.reason);
      completedFetchFailed = true;
    }
    
  } catch (error) {
    console.error("Error global saat fetch di Home:", error);
    ongoingFetchFailed = true;
    completedFetchFailed = true;
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      <Navbar user={user} />
      <HeroSection />

      <div className="container mx-auto px-4">
        {/* Anime Ongoing Section with Themed Title */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl text-center font-bold mb-6">
            <span className="gradient-theme-text">Anime OnGoing</span>
          </h2>
          {ongoingFetchFailed ? (
            <ApiWarningMessage sectionTitle="OnGoing" />
          ) : (
            <AnimeOngoing api={animeOngoing} />
          )}
        </div>

        {/* Anime Completed Section with Themed Title */}
        <React.Suspense fallback={<AnimeListSkeleton />}>
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl text-center font-bold mb-6">
              <span className="gradient-theme-text">Anime Completed</span>
            </h2>
            {completedFetchFailed ? (
              <ApiWarningMessage sectionTitle="Completed" />
            ) : (
              <AnimeCompleted api={animeComplete} />
            )}
          </div>
        </React.Suspense>
      </div>
    </div>
  );
}

export default Home;
