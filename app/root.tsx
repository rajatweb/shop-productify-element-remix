import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { ThemeProvider } from "./context/ThemeContext";

import stylesheet from "~/styles/tailwind.css?url";
import globalStyle from "~/styles/global.css?url";

export const links = () => {
  return [
    { rel: "stylesheet", href: stylesheet },
    { rel: "stylesheet", href: globalStyle },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Expo+2&display=swap",
    },
  ];
};

export default function App() {
  return (
    <ThemeProvider>
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <link rel="preconnect" href="https://cdn.shopify.com/" />
          <link
            rel="stylesheet"
            href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
          />
          <meta
            name="shopify-api-key"
            content="b00c508b4ecab2ec0678722751bc7f3b"
          />
          <Meta />
          <Links />
        </head>
        <body>
          <Outlet />
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </ThemeProvider>
  );
}
