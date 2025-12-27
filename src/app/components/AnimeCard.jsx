import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const AnimeCard = ({ title, image, slug, episode, statusOrDay, type, priority = false }) => {

  return (
    <Link
      href={`/detail/${slug}`}
      className="group will-change-transform block"
    >
      <div className="flex flex-col h-full">

        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-theme">
          <Image
            src={image}
            alt={title}
            unoptimized={true}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 bg-theme-tertiary"
          />

          {/* Optional gradient overlay */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div> */}

          {/* Badge TYPE (top right corner) */}
          {type && (
            <div className="absolute top-2 right-2 z-10 rounded-md px-2 py-1 text-xs font-bold text-theme-primary shadow-lg transition-all duration-300 group-hover:scale-105" 
                 style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}>
              <span>{type}</span>
            </div>
          )}

          {/* Badge Episode (bottom left corner) */}
          {episode && (
      {/*<div className="absolute bottom-2 left-2 z-10 rounded-full bg-theme-tertiary/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-theme-primary border border-theme shadow-md">*/}
      <div className="absolute bottom-2 left-2 z-10 rounded-full bg-theme-tertiary/90 px-2.5 py-1 text-xs text-theme-primary font-semibold text-white">
              {episode.replace('Episode ', 'Eps ')}
            </div>
          )}
        </div>

        <div className="mt-2 px-1">
          <h3 className="font-semibold text-sm text-theme-primary line-clamp-2 transition-colors duration-300 group-hover:gradient-theme-text">
            {title}
          </h3>

          {/* Subtitle text (Release day or status) */}
          {statusOrDay && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-theme-tertiary">
              <span>{statusOrDay.replace('✓', '')}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default AnimeCard;
