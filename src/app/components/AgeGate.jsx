'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function AgeGate() {
  const [allowed, setAllowed] = useState(false)
  const [checked, setChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('age_verified_18')
    if (stored === 'true') {
      setAllowed(true)
    }
    setChecked(true)
  }, [])

  const confirmAge = () => {
    localStorage.setItem('age_verified_18', 'true')
    setAllowed(true)
  }

  const denyAge = () => {
    localStorage.removeItem('age_verified_18')
    router.push('/')
  }

  if (!checked || allowed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur flex items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-2xl bg-zinc-900 p-6 text-center text-white shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-3">
            Age Verification
          </h2>

          <p className="text-sm text-gray-400 mb-6">
            This page may contain content intended for adults.
            Please confirm that you are at least <b>18 years old</b>.
          </p>

          <div className="flex gap-3">
            <button
              onClick={confirmAge}
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 transition py-3 font-semibold"
            >
              I am 18+
            </button>

            <button
              onClick={denyAge}
              className="flex-1 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition py-3"
            >
              Under 18
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
