import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { login } from "~/shopify.server";
import { Page, Card } from "@shopify/polaris";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app/`);
  }

  return json({ showForm: Boolean(login) });
};

export default function Callback() {
  return (
    <div>
      <Page>
        <Card>callback</Card>
      </Page>
    </div>
  );
}
