import { authenticate } from "~/shopify.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

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
            edges {
                node {
                    id
                    title
                    handle
                }
                cursor
            }
            pageInfo {
                hasNextPage
            }
            }
        }`,
        {
            variables: {
            },
        },
    );
    const responseJson = await response.json();
    const products = responseJson.data!.products!.edges!;
    const pageInfo = responseJson.data!.products!.pageInfo!;

    console.log("🚀 ~ action ~ products:", products)
    return json({ success: true, products, pageInfo });
}

export default function ProductsPage() {
    const fetcher = useFetcher<typeof action>();

    useEffect(() => {
        // Trigger the action programmatically on page load
        fetcher.submit(null, { method: "POST" });
    }, []);

    return (
        <div className="container mx-auto">
            <div className="grid gap-4 grid-cols-2">
                {fetcher.data?.products?.map((product: any) => (
                    <div key={product.node.id}>{product.node.title}</div>
                ))}
            </div>

            {/* {fetcher.data?.products?.map((product: any) => (
                <div key={product.node.id}>{product.node.title}</div>
            ))}
            Product */}
        </div>
    );
}
