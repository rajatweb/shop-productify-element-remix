import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { DataTable, Page, Link as PolarisLink } from "@shopify/polaris";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";

// Define the type for each product node
type ProductNode = {
  id: string;
  title: string;
  status: string;
  vendor: string;
  handle: string;
};

// Define the type for loader data
type LoaderData = {
  products: ProductNode[];
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

// GraphQL query to fetch products
const GET_PRODUCTS = `#graphql
  query ($numProducts: Int!, $cursor: String) {
    products(first: $numProducts, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        title
        status
        vendor
        handle
      }
    }
  }
`;

// Loader to fetch the initial set of products
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(GET_PRODUCTS, {
    variables: { numProducts: 5, cursor: null },
  });

  const responseJson = await response.json();
  const products = responseJson.data.products.nodes;
  const pageInfo = responseJson.data.products.pageInfo;

  return json({ products, pageInfo });
};

// Action to handle pagination
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const cursor = formData.get("cursor") as string;

  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(GET_PRODUCTS, {
    variables: { numProducts: 5, cursor },
  });

  const responseJson = await response.json();
  const products = responseJson.data.products.nodes;
  const pageInfo = responseJson.data.products.pageInfo;

  return json({ products, pageInfo });
};

const ProductsPage = () => {
  const { products: initialProducts, pageInfo: initialPageInfo } =
    useLoaderData<LoaderData>();
  const fetcher = useFetcher<LoaderData>();

  // State to hold current products and pageInfo
  const [products, setProducts] = useState<ProductNode[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);

  // Handle pagination - Fetch more products on "Next"
  const onPagination = () => {
    const formData = new FormData();
    formData.append("cursor", pageInfo.endCursor);
    fetcher.submit(formData, { method: "post" });
  };

  // Effect to update products and pageInfo when fetcher.data changes
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      setProducts(() => [
        ...(fetcher.data?.products ?? []),
      ]);
      setPageInfo(fetcher.data.pageInfo);
    }
  }, [fetcher.data, fetcher.state]); // Run this effect whenever fetcher.data or fetcher.state changes

  // Map the products into Polaris DataTable rows
  const rows = products.map((product) => [
    <PolarisLink
      key={product.id}
      url={`/app/product/${product.id.split("/").pop()}`}
    >
      {product.title}
    </PolarisLink>,
    "", // Placeholder for Description
    product.status,
    product.vendor,
    product.handle,
  ]);

  return (
    <div className="container mx-auto">
      <Page title="Sales by Product">
        <DataTable
          columnContentTypes={["text", "text", "text", "text", "text"]}
          headings={["Title", "Description", "Status", "Vendor", "Handle"]}
          rows={rows}
          pagination={{
            hasNext: pageInfo.hasNextPage,
            hasPrevious: pageInfo.hasPreviousPage,
            onNext: onPagination,
          }}
        />
      </Page>
    </div>
  );
};

export default ProductsPage;
