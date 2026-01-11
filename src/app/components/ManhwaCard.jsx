import Image from 'next/image'
import Link from 'next/link'

export default function ManhwaCard({ slug, title, image }) {
  const cover = image || '/default-cover.jpg'

  return (
    <Link
      href={`/manhwa/${slug}`}
      className="group block transition-transform duration-300 hover:scale-105"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800">
        <Image
          src={cover}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover"
          priority={false}
        />
      </div>

      <h3 className="mt-2 text-sm font-semibold text-center text-white truncate">
        {title}
      </h3>
    </Link>
  )
}
