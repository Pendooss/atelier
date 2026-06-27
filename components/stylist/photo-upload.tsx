"use client"

import { useRef } from "react"
import { Camera, Check, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

export function PhotoUpload({
  value,
  onChange,
  title,
  hint,
  compliment,
}: {
  value: string | null
  onChange: (dataUrl: string) => void
  title: string
  hint: string
  compliment?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        // Сжимаем до максимум 800px по большей стороне
        const MAX = 800
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = Math.round((height * MAX) / width)
            width = MAX
          } else {
            width = Math.round((width * MAX) / height)
            height = MAX
          }
        }
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0, width, height)
        // JPEG качество 0.85 — баланс качества и размера
        const compressed = canvas.toDataURL("image/jpeg", 0.85)
        onChange(compressed)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-dashed p-6 text-center transition-colors",
          value
            ? "border-accent bg-card"
            : "border-border bg-card hover:border-accent",
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value || "/placeholder.svg"}
              alt="Загруженное фото"
              className="h-44 w-auto rounded-lg object-cover"
            />
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              <Check className="h-4 w-4" /> Фото загружено — нажмите, чтобы заменить
            </span>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-accent">
              <Camera className="h-6 w-6" />
            </span>
            <span className="font-medium">{title}</span>
            <span className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {hint}
            </span>
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              <Upload className="h-4 w-4" /> Выбрать файл
            </span>
          </>
        )}
      </button>
      {value && compliment && (
        <p className="mt-3 rounded-lg bg-accent/10 px-4 py-3 text-sm leading-relaxed text-foreground">
          {compliment}
        </p>
      )}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        🔒 Фото не сохраняются · Только для анализа
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
