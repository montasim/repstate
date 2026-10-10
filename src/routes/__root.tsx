import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import type { ErrorComponentProps } from "@tanstack/react-router"
import appCss from "../styles.css?url"
import { SiteHeader } from "@/components/layout/site-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertIcon } from "@/components/ui/icons"
import { Toaster } from "@/components/ui/sonner"
import { createMeta, site } from "@/lib/site"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...createMeta(site.name),
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  component: () => <Outlet />,
  errorComponent: RootError,
  notFoundComponent: () => (
    <RouteMessage title="Page not found" description="That route does not exist." />
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}

function RootError({ error, reset }: ErrorComponentProps) {
  return (
    <RouteMessage
      title="Something went wrong"
      description={error instanceof Error ? error.message : String(error)}
    >
      <Button onClick={reset}>Try again</Button>
    </RouteMessage>
  )
}

function RouteMessage({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <Alert variant="destructive" className="my-8">
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {children}
    </Alert>
  )
}
