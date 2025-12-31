import Image from "next/image"
import Link from "next/link"
import React from "react"

const AnimeCard = ({
  title,
  image,
  slug,
  episode,
  statusOrDay,
  type,
  priority = false,
}) => {
  return (
    <Link href={`/detail/${slug}`} className="group block will-change-transform">
      <div className="flex h-full flex-col">

        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-theme">
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="bg-theme-tertiary object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* TYPE badge */}
          {type && (
            <div
              className="absolute right-2 top-2 z-10 rounded-md px-2 py-1 text-xs font-bold text-theme-primary shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                background:
                  "linear-gradient(to right, var(--accent-from), var(--accent-to))",
              }}
            >
              {type}
            </div>
          )}

          {/* EPISODE badge */}
          {episode && (
            <div className="absolute bottom-2 left-2 z-10 rounded-full bg-theme-tertiary/90 px-2.5 py-1 text-xs font-semibold text-theme-primary">
              {episode.replace("Episode ", "Eps ")}
            </div>
          )}
        </div>

        <div className="mt-2 px-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-theme-primary transition-colors duration-300 group-hover:gradient-theme-text">
            {title}
          </h3>

          {statusOrDay && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-theme-tertiary">
              <span>{statusOrDay.replace("✓", "")}</span>
            </div>
          )}
        </div>

      </div>
    </Link>
  )
}

export default AnimeCard
