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
          ⚠️ Unable to load {sectionTitle} manga
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
async function fetchAndFilterManga(desiredLimit = 20) {
  let filteredManga = [];
  let offset = 0;
  const limit = 20; // MangaDex API limit per request
  const maxRequests = 3; // Max 3 requests to get enough manga
  let requestCount = 0;

  while (filteredManga.length < desiredLimit && requestCount < maxRequests) {
    try {
      const url = `https://api.mangadex.org/manga?limit=${limit}&offset=${offset}&order[followedCount]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`;
      
      const response = await fetch(url, {
        next: { revalidate: 3600 } // Cache for 1 hour
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch manga: Status ${response.status}`);
        break;
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

      // Update offset for next request
      offset += limit;
      requestCount++;

      // Stop if no more data
      if (mangaOnThisPage.length < limit) break;

    } catch (error) {
      console.error(`Error processing manga request:`, error);
      break;
    }
  }

  return filteredManga;
}

// Main Manga Page Component
const MangaPage = async () => {
  const user = await AuthUserSession();

  let mangaList = [];
  let fetchFailed = false;

  try {
    mangaList = await fetchAndFilterManga(20);
    if (mangaList.length === 0) fetchFailed = true;
  } catch (error) {
    console.error("Error while fetching manga:", error);
    fetchFailed = true;
  }

  return (
    <>
      <Navbar user={user} />
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <Header title="Manga List" />
        {fetchFailed ? (
          <ApiWarningMessage sectionTitle="Manga" />
        ) : (
          <MangaGrid mangaList={mangaList} />
        )}
      </div>
    </>
  );
}

export default MangaPage;
