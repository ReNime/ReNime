import ChapterReader from '@/app/components/ChapterReader';

export default function MangaReaderPage({ params }) {
  const { slug } = params; // slug = chapterId

  return (
    <ChapterReader
      chapterId={slug}
      mode="manga" // ganti "manhwa" kalau mau scroll
    />
  );
}
