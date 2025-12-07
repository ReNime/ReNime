"use client";

import { useEffect, useState } from "react";
import AnimeCompleted from "@/app/components/AnimeCompleted";
import AnimeOngoing from "@/app/components/AnimeOngoing";
import BottomNav from "@/app/components/BottomNav";
import Header from "@/app/components/Header";
import HeroSection from "@/app/components/HeroSection";
import Navbar from "./components/Navbar";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [animeOngoing, setAnimeOngoing] = useState([]);
  const [animeCompleted, setAnimeCompleted] = useState([]);

  const [ongoingFailed, setOngoingFailed] = useState(false);
  const [completedFailed, setCompletedFailed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const ongoingRes = await fetch(`${apiUrl}/ongoing?page=1`);
        if (!ongoingRes.ok) throw new Error("403 ongoing");
        const ongoingData = await ongoingRes.json();
        setAnimeOngoing(ongoingData.animes || []);
      } catch (e) {
        console.log("Fallback ongoing...");
        setOngoingFailed(true);
      }

      try {
        const completedRes = await fetch(`${apiUrl}/completed?page=1`);
        if (!completedRes.ok) throw new Error("403 completed");
        const completedData = await completedRes.json();
        setAnimeCompleted(completedData.animes || []);
      } catch (e) {
        console.log("Fallback completed...");
        setCompletedFailed(true);
      }
    }

    fetchData();
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-theme-primary">
      <Navbar />
      <HeroSection />

      <div className="container mx-auto px-4">
        <Header title="Anime OnGoing" />
        {ongoingFailed ? (
          <div>Gagal memuat ongoing</div>
        ) : (
          <AnimeOngoing api={animeOngoing} />
        )}

        <Header title="Anime Completed" />
        {completedFailed ? (
          <div>Gagal memuat completed</div>
        ) : (
          <AnimeCompleted api={animeCompleted} />
        )}
      </div>
    </div>
  );
}
