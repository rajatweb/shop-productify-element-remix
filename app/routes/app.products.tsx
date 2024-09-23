import React, { useEffect } from "react";
import { Link, Page, LegacyCard, DataTable } from "@shopify/polaris";
import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";

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

export default function ProductsPage() {
  const fetcher = useFetcher<typeof action>();
  console.log("🚀 ~ ProductsPage ~ fetcher:", fetcher)

  useEffect(() => {
    fetcher.submit(null, { method: "POST" });
  }, []);

  const rows = [
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="emerald-silk-gown"
      >
        Emerald Silk Gown
      </Link>,
      "$875.00",
      124689,
      140,
      "$122,500.00",
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="mauve-cashmere-scarf"
      >
        Mauve Cashmere Scarf
      </Link>,
      "$230.00",
      124533,
      83,
      "$19,090.00",
    ],
    [
      <Link
        removeUnderline
        url="https://www.example.com"
        key="navy-merino-wool"
      >
        Navy Merino Wool Blazer with khaki chinos and yellow belt
      </Link>,
      "$445.00",
      124518,
      32,
      "$14,240.00",
    ],
  ];

  return (
    <div className="container mx-auto">
      <Page title="Sales by product">
        <LegacyCard>
          <DataTable
            columnContentTypes={[
              "text",
              "numeric",
              "numeric",
              "numeric",
              "numeric",
            ]}
            headings={[
              "Product",
              "Price",
              "SKU Number",
              "Quantity",
              "Net sales",
            ]}
            rows={rows}
            totals={["", "", "", 255, "$155,830.00"]}
          />
        </LegacyCard>
      </Page>
    </div>
  );
}

// import { authenticate } from "~/shopify.server";
// import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useFetcher } from "@remix-run/react";
// import { useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const { admin } = await authenticate.admin(request);

//   const response = await admin.graphql(
//     `#graphql
//         query {
//         products(first: 10) {
//             pageInfo {
//                 endCursor
//                 hasNextPage
//                 hasPreviousPage
//                 startCursor
//             }
//             nodes {
//                 description
//                 seo {
//                     description
//                     title
//                 }
//                 status
//                 tags
//                 title
//                 updatedAt
//                 vendor
//                 category {
//                     id
//                     isRoot
//                     name
//                     fullName
//                 }
//                 descriptionHtml
//                 handle
//                 featuredMedia {
//                     id
//                     status
//                     preview {
//                         image {
//                             url
//                         }
//                     }
//                 }
//             }
//         }
//         }`,
//     {
//       variables: {},
//     },
//   );
//   const responseJson = await response.json();
//   const products = responseJson.data!.products!.nodes!;
//   const pageInfo = responseJson.data!.products!.pageInfo!;

//   return json({ success: true, products, pageInfo });
// };

// export default function ProductsPage() {
//   const fetcher = useFetcher<typeof action>();

//   useEffect(() => {
//     // Trigger the action programmatically on page load
//     fetcher.submit(null, { method: "POST" });
//   }, []);

//   return (
//     <div className="container mx-auto">
//       <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
//         {fetcher.data?.products?.map((product: any) => (
//            <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 transform">
//            <div className="relative overflow-hidden rounded-t-xl">
//              <img className="w-full h-56 object-cover transition-transform duration-500 hover:scale-110" src="https://via.placeholder.com/200" alt="Product" />
//            </div>
//            <div className="p-5">
//              <h5 className="text-lg font-semibold text-gray-900">Stylish Product Name</h5>
//              <p className="mt-1 text-sm text-gray-500">A brief description of the product.</p>
//              <p className="mt-3 text-xl font-bold text-gray-900">$79.99</p>
//              <div className="mt-4 flex justify-between items-center">
//                <button className="bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300">
//                  Add to Cart
//                </button>
//                <button className="text-blue-600 text-sm font-medium hover:underline">Wishlist</button>
//              </div>
//            </div>
//          </div>

//         ))}
//       </div>

//       {/* {fetcher.data?.products?.map((product: any) => (
//                 <div key={product.node.id}>{product.node.title}</div>
//             ))}
//             Product */}
//     </div>
//   );
// }
