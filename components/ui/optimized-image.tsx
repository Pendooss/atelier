// components/ui/optimized-image.tsx
// Используй вместо <img> для фото с Unsplash
// Автоматически показывает мобильный размер на телефонах

"use client"

import { useState } from "react"
import type { UnsplashPhoto } from "@/lib/unsplash"

interface OptimizedImageProps {
  photo: UnsplashPhoto
  className?: string
  alt?: string
  priority?: boolean // true для первого экрана (не lazy)
}

export function OptimizedImage({
  photo,
  className = "",
  alt,
  priority = false,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden" style={{ background: "#f4ede4" }}>
      {/* Плейсхолдер пока грузится */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-secondary" />
      )}
      <img
        // srcSet — браузер выбирает подходящий размер сам
        srcSet={`${photo.urlMobile} 400w, ${photo.url} 800w`}
        sizes="(max-width: 640px) 400px, 800px"
        src={photo.url}
        alt={alt || photo.alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

// Упрощённая версия для использования прямо в img тегах
// просто добавь эти атрибуты к существующим img тегам
export function getOptimizedImgProps(photo: UnsplashPhoto, priority = false) {
  return {
    srcSet: `${photo.urlMobile} 400w, ${photo.url} 800w`,
    sizes: "(max-width: 640px) 400px, 800px",
    src: photo.url,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
  }
}
