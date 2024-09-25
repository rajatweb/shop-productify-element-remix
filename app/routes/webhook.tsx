import { json, type ActionFunctionArgs } from "@remix-run/node";
// import { authenticate } from "../shopify.server";
// import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  try {
    const hmacHeader = request.headers.get("X-Shopify-Hmac-SHA256") || "";
    const bodyText = await request.json(); // Read body as text
    console.log("🚀 ~ action ~ hmacHeader:", hmacHeader, JSON.stringify(bodyText))


    
    // const { shop, session, topic } = await authenticate.webhook(request);
    // const payload = await request.json();

    // console.log("🚀 ~ action ~ payload:", payload)
    // console.log(`Received ${topic} webhook for ${shop}`);

    // // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // // If this webhook already ran, the session may have been deleted previously.
    // if (session) {
    //   const shopData = db.session.findFirst({ where: { shop } });
    //   console.log("🚀 ~ action ~ shopData:", shopData);
    // }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return json({ error: "Something went wrong" }, { status: 500 });
  }

  return new Response();
};
