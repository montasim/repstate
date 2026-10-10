import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { GithubIcon } from "@/components/ui/icons"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <Link to="/" className="font-semibold">
        {site.name}
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link to="/benchmark">Benchmark</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link to="/how-it-works">How it works</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={site.repoUrl} rel="noreferrer">
            <GithubIcon /> GitHub
          </a>
        </Button>
      </nav>
    </header>
  )
}
