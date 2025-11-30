'use client';

import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

import { FaHistory, FaSpinner, FaClock } from 'react-icons/fa';

import Image from 'next/image';

import Link from 'next/link';

export default function WatchHistoryClient({ userId }) {

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadHistory();

  }, []);

  async function loadHistory() {

    try {

      const res = await fetch(`/api/watch-history?userId=${userId}`);

      const data = await res.json();

      setHistory(data.history || []);

    } catch (error) {

      console.error('Error loading history:', error);

    }

    setLoading(false);

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-7xl mx-auto">

        <motion.div

          initial={{ opacity: 0, y: -20 }}

          animate={{ opacity: 1, y: 0 }}

          className="mb-8"

        >

          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">

            <FaHistory />

            Watch History

          </h1>

          <p className="text-blue-300/70">Your recent anime viewing activity</p>

        </motion.div>

        {loading ? (

          <div className="flex justify-center items-center py-12">

            <FaSpinner className="animate-spin text-4xl text-blue-400" />

          </div>

        ) : history.length === 0 ? (

          <div className="text-center py-12 bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/20">

            <p className="text-blue-300/70 text-lg">No watch history yet. Start watching anime!</p>

          </div>

        ) : (

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">

            {history.map((item) => (

              <HistoryCard key={item.id} item={item} />

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

function HistoryCard({ item }) {

  return (

    <Link href={`/anime/${item.animeId}`}>

      <motion.div

        whileHover={{ scale: 1.05 }}

        className="group relative aspect-[2/3] rounded-xl overflow-hidden border border-blue-500/20 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all"

      >

        <Image src={item.coverImage} alt={item.animeTitle} fill className="object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">

          <div className="absolute bottom-0 left-0 right-0 p-3">

            <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">{item.animeTitle}</h3>

            {item.episode && (

              <p className="text-xs text-blue-300 flex items-center gap-1">

                <FaClock className="text-[10px]" />

                Episode {item.episode}

              </p>

            )}

          </div>

        </div>

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">

          <p className="text-xs text-blue-300">

            {new Date(item.watchedAt).toLocaleDateString()}

          </p>

        </div>

      </motion.div>

    </Link>

  );

}