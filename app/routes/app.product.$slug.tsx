import { Page, Button, LegacyCard, Layout, TextField, Grid, Select, Text, Badge, Icon, Card, List, } from "@shopify/polaris";
import { useLoaderData, useParams, Form, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import {
  ClipboardIcon
} from '@shopify/polaris-icons';
import axios from 'axios';

// GraphQL query to fetch products
const SET_PRODUCTS = `#graphql
  query ($productId: ID!) {
    product(id:$productId) {
      description
      title
      id
      featuredMedia {
        preview {
          image {
            url
            src
            id
          }
        }
      }
    }
  }
`;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const productId = `gid://shopify/Product/${params.slug}`;
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(SET_PRODUCTS, {
    variables: { productId },
  });

  const productData = await response.json();
  return productData;
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const formData = new URLSearchParams(await request.text());
  const title = formData.get("inputTitle"); // Change to match your input name
  const description = formData.get("inputDescription")

  const prompt = `${title}${description}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Generate an SEO title and description for: ${prompt} ` }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content.split('\n');
    const title = content[0].replace(/^Title:\s*/, "");
    const description = content[1].replace(/^Description:\s*/, "");

    return json({ title, description });
  } catch (error) {
    console.error('Error generating SEO content:', error);
    return json({ error: 'Failed to generate SEO content' }, { status: 500 });
  }
};

export default function UserPage() {
  const params = useParams();
  const productId = `gid://shopify/Product/${params.slug}`;
  const backId = `https://penny-manager-organisations-angola.trycloudflare.com/app/products`
  const data = useLoaderData();
  const actionData = useActionData(); // Get action response data
  console.log(actionData)
  const newData = data.data.product;


  const [inputTitle, setInputTitle] = useState(newData.title);
  const [inputDescription, setInputDescription] = useState(newData.description);
  const [loading, setLoading] = useState(false);

  const replaceUnwantedStrings = (text) => {
    const unwantedStrings = /nullnull|NullNull|Nullnull|Null|null/gi; // Regex for unwanted strings
    return text.replace(unwantedStrings, newData.title); // Replace with newData.title
  };
  useEffect(() => {
    if (actionData) {
      const updatedTitle = replaceUnwantedStrings(actionData.title) || newData.title;
      const updatedDescription = replaceUnwantedStrings(actionData.description) || newData.description;

      setInputTitle(updatedTitle);
      setInputDescription(updatedDescription);
      setLoading(false)
    }
  }, [actionData]);

  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'lastWeek' },
  ];
  const copyTitleToClipboard = () => {
    navigator.clipboard.writeText(inputTitle).then(() => {
      console.log('Text copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };
  const copyDescriptionToClipboard = () => {
    navigator.clipboard.writeText(inputDescription).then(() => {
      console.log('Description copied to clipboard!');
    }).catch((err) => {
      console.error('Failed to copy description: ', err);
    });
  };
  const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1544208757-ddbaebce244e?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const getImageSrc = (data) => {
    return data?.featuredMedia?.preview?.image?.url || DEFAULT_IMAGE_URL; // Safely access the URL or return an empty string
  };
  
  return (
    <Page
      backAction={{ content: 'Products', url: backId }}
      title={newData.title}
      fullWidth>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned>
            <div className="flex justify-between items-center pt-1 pb-1">
              <Text variant='headingMd'> Order Details</Text>
              <Form method="post">
                <Button submit  onClick={()=>setLoading(true)}>
                  {loading ? 'Generating...' : 'Generate SEO Title and Description' }
                </Button>
              </Form>
            </div>

            <TextField
              label="Title"
              value={inputTitle}
              autoComplete="off"
              onChange={(e) =>setInputTitle(e)}
              />
            

            {actionData && actionData.title && (
              <div className="mt-2 mb-2">
                <Card>
                  <List>
                    <List.Item>
                      <Badge tone='attention' progress='partiallyComplete'>AI Recommended Title</Badge>
                    </List.Item>
                    <List.Item>
                      <Badge tone='success' progress='complete' >{replaceUnwantedStrings(actionData.title)}</Badge>
                    </List.Item>
                  </List>
                  <div className=" flex justify-end">
                    <button onClick={copyTitleToClipboard}>
                      <Icon source={ClipboardIcon} tone="base" />
                    </button>
                  </div>
                </Card>
              </div>
            )}

            <TextField
              label="Description"
              value={inputDescription}
              autoComplete="off"
              multiline={5}
              showCharacterCount
              onChange={(e)=>setInputDescription(e)}
            />

            {actionData && actionData.description && (
              <div className="mt-2 mb-2">
                <Card>
                  <List>
                    <List.Item>
                      <Badge tone='attention' progress='partiallyComplete'>AI Recommended Description</Badge>
                    </List.Item>
                    <List.Item>
                      <Badge tone='success' progress='complete' >{replaceUnwantedStrings(actionData.description)}</Badge>
                    </List.Item>
                  </List>
                  <div className=" flex justify-end">
                    <button onClick={copyDescriptionToClipboard}>
                      <Icon source={ClipboardIcon} tone="base" />
                    </button>
                  </div>
                </Card>
              </div>
            )}

            <Grid>
              <Grid.Cell columnSpan={{ lg: 4 }}>
                <LegacyCard title="" sectioned>
                  <img
                    alt=""
                    src={getImageSrc(newData)}
                  />
                </LegacyCard>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ lg: 2 }}>
                <LegacyCard title="" sectioned>
                  <Button onClick={() => console.log(newData.featuredMedia.preview.image.url)}>+</Button>
                </LegacyCard>
              </Grid.Cell>
            </Grid>
          </LegacyCard>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <LegacyCard title="Status" sectioned>
            <Select
              label="Date range"
              options={options}
            />
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
