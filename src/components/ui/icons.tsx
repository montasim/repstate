import { forwardRef } from "react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HugeiconsIconProps, IconSvgElement } from "@hugeicons/react"
import HugeAlertIcon from "@hugeicons/core-free-icons/AlertCircleIcon"
import HugeArrowRightIcon from "@hugeicons/core-free-icons/ArrowRight02Icon"
import HugeCameraIcon from "@hugeicons/core-free-icons/CameraVideoIcon"
import HugeCopyIcon from "@hugeicons/core-free-icons/Copy01Icon"
import HugeDownloadIcon from "@hugeicons/core-free-icons/Download04Icon"
import HugeGithubIcon from "@hugeicons/core-free-icons/GithubIcon"
import HugePlayIcon from "@hugeicons/core-free-icons/PlayIcon"
import HugeRefreshIcon from "@hugeicons/core-free-icons/RefreshIcon"

export type IconProps = Omit<HugeiconsIconProps, "altIcon" | "icon">
export type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>

/** Wraps a Hugeicons glyph as a React component with consistent stroke and a11y defaults. */
function createIcon(icon: IconSvgElement, displayName: string): Icon {
  const Component = forwardRef<SVGSVGElement, IconProps>(function AppIcon(
    { strokeWidth = 1.5, ...props },
    ref
  ) {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        strokeWidth={strokeWidth}
        focusable="false"
        aria-hidden={props["aria-label"] ? undefined : true}
        {...props}
      />
    )
  })
  Component.displayName = displayName
  return Component
}

export const AlertIcon = createIcon(HugeAlertIcon, "AlertIcon")
export const ArrowRightIcon = createIcon(HugeArrowRightIcon, "ArrowRightIcon")
export const CameraIcon = createIcon(HugeCameraIcon, "CameraIcon")
export const CopyIcon = createIcon(HugeCopyIcon, "CopyIcon")
export const DownloadIcon = createIcon(HugeDownloadIcon, "DownloadIcon")
export const GithubIcon = createIcon(HugeGithubIcon, "GithubIcon")
export const PlayIcon = createIcon(HugePlayIcon, "PlayIcon")
export const RefreshIcon = createIcon(HugeRefreshIcon, "RefreshIcon")
