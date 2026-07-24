import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  compact?: boolean
  preload?: boolean
  className?: string
}

export function BrandLogo({
  compact = false,
  preload = false,
  className,
}: BrandLogoProps) {
  return (
    <Image
      src={compact ? "/logo.svg" : "/logo-horizontal.svg"}
      alt="Apolo Fit"
      width={compact ? 300 : 261}
      height={compact ? 239 : 57}
      unoptimized
      preload={preload}
      className={cn(
        "w-auto object-contain",
        compact ? "h-8" : "h-10",
        className
      )}
    />
  )
}
