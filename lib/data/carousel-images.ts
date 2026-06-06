// Список фото для фонов каруселей
// Добавляй новые файлы в public/media/carousel/ и дописывай сюда

const rawImages = [
  "avatar_circle.png",
  "photo_2025-12-20_18-33-08.jpg",
  "photo_2025-12-20_23-29-29.jpg",
  "photo_2025-12-20_23-40-21.jpg",
  "photo_2025-12-20_23-58-06.jpg",
  "photo_2025-12-21_00-10-05.jpg",
  "photo_2025-12-21_15-25-54.jpg",
  "photo_2025-12-21_21-25-14.jpg",
  "photo_2025-12-21_23-15-23.jpg",
  "photo_2025-12-21_23-19-09.jpg",
  "photo_2025-12-25_01-34-05.jpg",
  "photo_2025-12-25_01-38-52.jpg",
  "photo_2025-12-25_02-08-46.jpg",
  "photo_2025-12-25_02-18-01.jpg",
  "photo_2025-12-25_16-14-31.jpg",
  "photo_2025-12-26_21-50-01.jpg",
  "photo_2025-12-27_21-01-43.jpg",
  "photo_2025-12-27_21-14-05.jpg",
  "photo_2025-12-27_21-35-31 (2).jpg",
  "photo_2025-12-27_21-35-31.jpg",
  "photo_2026-01-24_03-32-02.jpg",
  "photo_2026-01-24_03-32-32.jpg",
  "photo_2026-01-24_03-32-44.jpg",
  "photo_2026-01-25_19-58-07.jpg",
  "photo_2026-01-25_20-11-49 (2).jpg",
  "photo_2026-01-25_20-17-29.jpg",
  "photo_2026-01-25_20-35-27.jpg",
  "photo_2026-01-25_20-37-47 (2).jpg",
  "photo_2026-01-25_20-43-12.jpg",
  "photo_2026-01-25_22-31-07.jpg",
  "photo_2026-01-26_00-23-20.jpg",
  "photo_2026-01-26_01-33-11.jpg",
  "photo_2026-01-26_01-54-53.jpg",
  "photo_2026-03-02_01-11-50.jpg",
  "photo_2026-03-02_01-27-04.jpg",
  "photo_2026-03-02_01-28-44.jpg",
  "photo_2026-03-19_01-06-17.jpg",
  "photo_2026-03-19_01-06-39.jpg",
  "photo_2026-03-19_01-12-55.jpg",
  "photo_2026-03-19_01-28-41.jpg",
  "photo_2026-04-21_23-50-35.jpg",
];

export const carouselImages = rawImages.map(
  (name) => `/media/carousel/${encodeURIComponent(name)}`
);

// Возвращает случайный набор N фото из библиотеки
export function pickImages(count: number): string[] {
  const shuffled = [...carouselImages].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
