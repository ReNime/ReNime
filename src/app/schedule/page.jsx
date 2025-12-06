"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb';
import AnimeCard from '@/app/components/AnimeCard';
import Header from '@/app/components/Header';

const DAYS = [
  { key: 'minggu', label: 'Minggu' },
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: "jum'at", label: "Jum'at" },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'random', label: 'Random' }
];

async function fetchSchedule() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/schedule`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data schedule');
    }
    const result = await response.json();
    return result.schedule || {};
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return {};
  }
}

export default function SchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current day from today
  const getCurrentDay = () => {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', "jum'at", 'sabtu'];
    const today = new Date().getDay();
    return days[today];
  };

  // Get initial day from URL or default to today
  const getInitialDay = () => {
    const dayParam = searchParams.get('day');
    if (dayParam && DAYS.some(d => d.key === dayParam)) {
      return dayParam;
    }
    return getCurrentDay();
  };

  const [schedule, setSchedule] = useState({});
  const [activeDay, setActiveDay] = useState(getInitialDay());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      const data = await fetchSchedule();
      setSchedule(data);
      setIsLoading(false);
    };
    loadSchedule();
  }, []);

  // Update URL when day changes
  const handleDayChange = (day) => {
    setActiveDay(day);
    router.push(`/schedule?day=${day}`, { scroll: false });
  };

  const breadcrumbs = [
    { title: 'Schedule', href: '/schedule' }
  ];

  const currentAnimes = schedule[activeDay] || [];
  const currentDayLabel = DAYS.find(d => d.key === activeDay)?.label;

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <div className="container mx-auto px-4 py-8">
        <ResponsiveBreadcrumb crumbs={breadcrumbs} />
        <Header title="Jadwal Anime" />

        {/* Current Day Indicator */}
        <div className="mb-4 flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-semibold text-theme-primary"
               style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}>
            Hari Ini: {DAYS.find(d => d.key === getCurrentDay())?.label}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max pb-2">
            {DAYS.map((day) => (
              <button
                key={day.key}
                onClick={() => handleDayChange(day.key)}
                className={`
                  px-4 py-2 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap
                  ${activeDay === day.key
                    ? 'text-theme-primary shadow-lg scale-105'
                    : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                  }
                `}
                style={activeDay === day.key ? {
                  background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
                  boxShadow: '0 0 20px var(--shadow-theme)'
                } : {}}
              >
                {day.label}
                {day.key === getCurrentDay() && (
                  <span className="ml-1 text-xs">â€¢</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-theme mx-auto mb-4"
                   style={{ borderTopColor: 'var(--accent-from)' }}></div>
              <p className="text-theme-tertiary">Memuat jadwal...</p>
            </div>
          </div>
        ) : currentAnimes.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold gradient-theme-text">
                {currentDayLabel}
              </h2>
              <span className="text-theme-tertiary text-sm md:text-base">
                {currentAnimes.length} anime
              </span>
            </div>

            {/* Anime Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentAnimes.map((anime, index) => (
                <AnimeCard
                  key={anime.slug || index}
                  title={anime.title}
                  image={anime.poster}
                  slug={anime.slug}
                  type={anime.type}
                  episode={anime.episode}
                  statusOrDay={anime.status_or_day}
                  priority={index < 10}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center p-8 rounded-xl bg-theme-secondary border border-theme">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-theme-secondary text-lg font-medium mb-2">
                Tidak ada anime untuk hari ini
              </p>
              <p className="text-theme-tertiary text-sm">
                Coba pilih hari lain untuk melihat jadwal
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
