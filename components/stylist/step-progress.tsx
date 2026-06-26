import { cn } from "@/lib/utils"

const steps = ["Знакомство", "Данные", "Анализ", "Результат"]

export function StepProgress({ current }: { current: number }) {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
      {steps.map((label, i) => {
        const active = i <= current
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px flex-1 transition-colors",
                    i < current ? "bg-accent" : "bg-border",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-center text-[11px] leading-tight",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
