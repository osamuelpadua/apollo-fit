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
      src="/logo.svg"
      alt="Apolo Fit"
      width={300}
      height={239}
      unoptimized
      preload={preload}
      className={cn("w-auto", compact ? "h-8" : "h-10", className)}
    />
  )
}
