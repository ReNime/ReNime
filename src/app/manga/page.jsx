// app/manga/page.jsx

import MangaGrid from "@/app/components/MangaGrid";
import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import React from 'react';
import Navbar from "@/app/components/Navbar"; 
import { AuthUserSession } from "@/app/libs/auth-libs"; 

// Warning message component
function ApiWarningMessage({ sectionTitle }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-6 text-center">
        <p className="text-yellow-400 text-lg font-semibold">
          âš ï¸ Unable to load {sectionTitle} manga
        </p>
        <p className="text-zinc-400 text-sm mt-2">
          Please try again later or check your connection.
        </p>
      </div>
    </div>
  );
}

// Loading skeleton component
function MangaListSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-slate-800 aspect-[2/3] rounded-lg"></div>
            <div className="h-4 bg-slate-800 rounded mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to fetch and filter manga
async function fetchAndFilterManga(baseUrl, endpoint, desiredLimit = 10) {
  let filteredManga = [];
  let currentPage = 1;
  let hasNextPage = true;
  const maxPagesToFetch = 5;

  while (
    filteredManga.length < desiredLimit && 
    hasNextPage && 
    currentPage <= maxPagesToFetch
  ) {
    try {
      const response = await fetch(`${baseUrl}/${endpoint}?page=${currentPage}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch ${endpoint} page ${currentPage}: Status ${response.status}`);
        hasNextPage = false;
        continue;
      }

      const data = await response.json();
      const mangaOnThisPage = data.data || [];

      // Filter manga with cover art
      const validManga = mangaOnThisPage.filter(manga => 
        manga.relationships?.some((rel) => rel.type === 'cover_art')
      );

      // Add filtered results to main array
      for (const manga of validManga) {
        if (filteredManga.length < desiredLimit) {
          filteredManga.push(manga);
        } else {
          break;
        }
      }

      // Update pagination status
      hasNextPage = data.pagination?.hasNext || false;
      currentPage++;

    } catch (error) {
      console.error(`Error processing ${endpoint} page ${currentPage}:`, error);
      hasNextPage = false;
    }
  }

  return filteredManga;
}

// Main Manga Page Component
const MangaPage = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mangadex.org';
  const user = await AuthUserSession();

  let mangaOngoing = [];
  let mangaCompleted = [];
  let ongoingFetchFailed = false;
  let completedFetchFailed = false;

  try {
    // Fetch ongoing and completed manga in parallel
    const [ongoingResult, completedResult] = await Promise.allSettled([
      fetchAndFilterManga(apiUrl, 'manga?status[]=ongoing&order[followedCount]=desc', 10),
      fetchAndFilterManga(apiUrl, 'manga?status[]=completed&order[followedCount]=desc', 10)
    ]);

    if (ongoingResult.status === 'fulfilled') {
      mangaOngoing = ongoingResult.value;
      if (mangaOngoing.length === 0) ongoingFetchFailed = true;
    } else {
      console.error("Fetch ongoing manga failed:", ongoingResult.reason);
      ongoingFetchFailed = true;
    }

    if (completedResult.status === 'fulfilled') {
      mangaCompleted = completedResult.value;
      if (mangaCompleted.length === 0) completedFetchFailed = true;
    } else {
      console.error("Fetch completed manga failed:", completedResult.reason);
      completedFetchFailed = true;
    }
    
  } catch (error) {
    console.error("Global error while fetching manga:", error);
    ongoingFetchFailed = true;
    completedFetchFailed = true;
  }

  return (
    <>
      <Navbar user={user} />
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <Header title="Ongoing Manga" />
        {ongoingFetchFailed ? (
          <ApiWarningMessage sectionTitle="Ongoing" />
        ) : (
          <MangaGrid mangaList={mangaOngoing} />
        )}

        <React.Suspense fallback={<MangaListSkeleton />}>
          <div className="mt-12">
            <Header title="Completed Manga" />
            {completedFetchFailed ? (
              <ApiWarningMessage sectionTitle="Completed" />
            ) : (
              <MangaGrid mangaList={mangaCompleted} />
            )}
          </div>
        </React.Suspense>
      </div>
    </>
  );
}

export default MangaPage;
