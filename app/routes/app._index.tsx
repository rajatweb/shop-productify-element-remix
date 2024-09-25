import { Page, Layout, LegacyCard, Banner, Link } from "@shopify/polaris";

function Index() {
  return (
    <div className="container mx-auto">
      <Page fullWidth>
        <Layout>
          <Layout.Section variant="oneThird">
            <LegacyCard title="Products SEO" sectioned>
              <p>
                Use to follow a normal section with a secondary section to
                create a 2/3 + 1/3 layout on detail pages (such as individual
                product or order pages). Can also be used on any page that needs
                to structure a lot of content. This layout stacks the columns on
                small screens.
              </p>
              <div className="pt-4">
                <Banner>
                  Learn more about{" "}
                  <Link url="/app/products">Go to products</Link>
                </Banner>
              </div>
            </LegacyCard>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <LegacyCard title="Theme Extension" sectioned>
              <p>
                Use to follow a normal section with a secondary section to
                create a 2/3 + 1/3 layout on detail pages (such as individual
                product or order pages). Can also be used on any page that needs
                to structure a lot of content. This layout stacks the columns on
                small screens.
              </p>
              <div className="pt-4">
                <Banner>
                  Learn more about{" "}
                  <Link url="/app/theme-extension">Go to Theme Extension</Link>
                </Banner>
              </div>
            </LegacyCard>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <LegacyCard title="Webhook" sectioned>
              <p>
                Use to follow a normal section with a secondary section to
                create a 2/3 + 1/3 layout on detail pages (such as individual
                product or order pages). Can also be used on any page that needs
                to structure a lot of content. This layout stacks the columns on
                small screens.
              </p>
              <div className="pt-4">
                <Banner>
                  Learn more about <Link url="/app/orders">Go to Orders</Link>
                </Banner>
              </div>
            </LegacyCard>
          </Layout.Section>
        </Layout>
      </Page>
    </div>
  );
}

export default Index;
