

import { json } from "@remix-run/node";
import { Page, Button, LegacyCard } from "@shopify/polaris";


// Loader function to fetch user data
export const loader = async ({ params }: { params: any }) => {

  return json({ });
};

export default function UserPage() {
  return (
    <Page
        backAction={{content: 'Settings', url: '/app/products'}}
        title="General"
        primaryAction={<Button variant="primary">Save</Button>}
      >
        <LegacyCard title="Credit card" sectioned>
          <p>Credit card information</p>
        </LegacyCard>
      </Page>
  );
}
