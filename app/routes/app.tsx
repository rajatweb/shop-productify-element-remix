import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useState } from "react";
import { Sidebar } from "app/components/atoms/sidebar/sidebar";
import { ThemeToggle } from "@/components/atoms/theme-toggle";
import { cn } from "app/lib/utils";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <AppProvider isEmbeddedApp={false} apiKey={apiKey}>
      {/* <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu> */}
      <main
        className={cn(
          "min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300",
          isOpen === false ? "lg:ml-[90px]" : "lg:ml-72",
        )}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <header className="sticky top-0 z-10 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
          <div className="mx-4 sm:mx-8 flex h-14 items-center">
            <div className="flex items-center space-x-4 lg:space-x-0">
              <h1 className="font-bold">Dashbord</h1>
            </div>
            <div className="flex flex-1 items-center justify-end">
            <ThemeToggle />
            </div>
          </div>
        </header>
        <Outlet />
      </main>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
