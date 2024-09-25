import { useLoaderData, Form, useFetcher } from "@remix-run/react";
import { authenticate } from "~/shopify.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Banner } from "@shopify/polaris";

interface Webhook {
  id: string;
  topic: string;
  endpoint: {
    callbackUrl: string;
  };
}

interface LoaderData {
  webhooks: Webhook[];
}
// GraphQL queries
const GET_WEBHOOKS_QUERY = `#graphql
  query GetWebhooks ($first: Int!) {
    webhookSubscriptions(first: $first) {
      edges {
        node {
          id
          topic
          endpoint {
            ... on WebhookHttpEndpoint {
              callbackUrl
            }
          }
        }
      }
    }
  }
`;

const REGISTER_WEBHOOK_MUTATION = `#graphql
 mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
      webhookSubscription {
        id
        topic
        filter
        format
        endpoint {
          __typename
          ... on WebhookHttpEndpoint {
            callbackUrl
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Loader function to fetch existing webhooks
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(GET_WEBHOOKS_QUERY, {
    variables: { first: 5 },
  });

  const responseJson = await response.json();
  const webhooks = responseJson.data.webhookSubscriptions.edges.map(
    (edge: any) => edge.node,
  );
  return json({
    webhooks,
  });
};

// Action function to register a new webhook
export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const topic = formData.get("topic");
  const callbackUrl = formData.get("callbackUrl");

  // Register webhook using GraphQL mutation
  const response = await admin.graphql(REGISTER_WEBHOOK_MUTATION, {
    variables: {
      topic,
      webhookSubscription: {
        callbackUrl,
        format: "JSON",
        filter: "type:lookbook",
      },
    },
  });

  const responseJson = await response.json();

  if (responseJson.data.webhookSubscriptionCreate.userErrors.length > 0) {
    return json({
      error: responseJson.data.webhookSubscriptionCreate.userErrors,
    });
  }

  return json({ success: true });
};

export default function Webhooks() {
  const { webhooks } = useLoaderData<LoaderData>(); // Fetch existing webhooks
  const fetcher = useFetcher<LoaderData>();

  const handleRegisterWebhook = () => {
    const formData = new FormData();
    formData.append("topic", 'ORDERS_CREATE');
    formData.append("callbackUrl", `${window.location.protocol}//${window.location.hostname}`);
    fetcher.submit(formData, { method: "post" });
  };

  return (
    <div>
      <h1>Existing Webhooks</h1>
      <ul>
        {webhooks.map((webhook) => (
          <li key={webhook.id}>
            <strong>Topic:</strong> {webhook.topic} <br />
            <strong>Callback URL:</strong> {webhook.endpoint.callbackUrl}
          </li>
        ))}
      </ul>

      <h2>Register a New Webhook</h2>
      <Form method="post">
        <label>
          Webhook Topic:
          <input type="text" name="topic" required />
        </label>
        <br />
        <label>
          Callback URL:
          <input type="url" name="callbackUrl" required />
        </label>
        <br />
        <Banner
          title="Some of your product variants are missing weights"
          tone="info"
          action={{ content: "Register Webhook", onAction: () => { handleRegisterWebhook() } }}
        >
          <p>
            Add weights to show accurate rates at checkout and when buying
            shipping labels in Shopify.
          </p>
        </Banner>

        <Banner
          title="Some of your product variants are missing weights"
          tone="info"
          action={{ content: "Edit variant weights", onAction: () => {} }}
        >
          <p>
            Add weights to show accurate rates at checkout and when buying
            shipping labels in Shopify.
          </p>
        </Banner>
      </Form>
    </div>
  );
}
