import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { DataTable, Page, Link as PolarisLink } from "@shopify/polaris";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";

// Define the type for each row
type Row = [JSX.Element, string, string, string, string];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
        query {
        products(first: 10) {
            pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
            }
            nodes {
                id
                description
                seo {
                    description
                    title
                }
                status
                tags
                title
                updatedAt
                vendor
                category {
                    id
                    isRoot
                    name
                    fullName
                }
                descriptionHtml
                handle
                featuredMedia {
                    id
                    status
                    preview {
                        image {
                            url
                        }
                    }
                }
            }
        }
        }`,
    {
      variables: {},
    },
  );
  const responseJson = await response.json();
  const products = responseJson.data!.products!.nodes!;
  const pageInfo = responseJson.data!.products!.pageInfo!;

  return json({ success: true, products, pageInfo });
};

const ProductsPage = () => {
  const fetcher = useFetcher<typeof action>();
  const fetcherData = fetcher?.data?.products;
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetcher.submit(null, { method: "POST" });
  }, []);

  useEffect(() => {
    const newRows: Row[] = [];

    if (fetcherData && fetcherData.length) {
      fetcherData.forEach((item: any) => {
        const gid = item.id;
        const productUrl = `/app/product/${gid.split('/').pop()}`;
        const row: Row = [
          <PolarisLink url={productUrl} key={productUrl}>
            {item.title}
          </PolarisLink>,
          '',
          item.status,
          item.vendor,
          item.handle,
        ];

        newRows.push(row);
      });
    }

    setRows(newRows);
  }, [fetcherData]);

  return (
    <div className="container mx-auto">
      <Page title="Sales by product">
        <DataTable
          columnContentTypes={["text", "text", "text", "text", "text"]}
          headings={["Title", "Description", "Status", "Vendor", "Handle"]}
          rows={rows}
        />
      </Page>
    </div>
  );
};

export default ProductsPage;
