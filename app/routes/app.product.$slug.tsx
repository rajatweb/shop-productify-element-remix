import { Page, Button, LegacyCard, Layout, TextField, Grid, Select, Text, Badge, Icon, } from "@shopify/polaris";
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
  const input = formData.get('inputTitle'); // Change to match your input name

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Generate an SEO title and description for: ${input}` }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content.split('\n');
    const title = content[0].replace(/^Title:\s*/, ''); 
    const description = content[1].replace(/^Description:\s*/,"") ; 

    return json({ title,description });
  } catch (error) {
    console.error('Error generating SEO content:', error);
    return json({ error: 'Failed to generate SEO content' }, { status: 500 });
  }
};

export default function UserPage() {
  const params = useParams();
  const productId = `gid://shopify/Product/${params.slug}`;
  const data = useLoaderData();
  const actionData = useActionData(); // Get action response data
  const newData = data.data.product;

  const [inputTitle, setInputTitle] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionData) {
      setInputTitle(actionData.title);
      setInputDescription(actionData.description);
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
  return (
    <div className="dark:shadow-zinc-800">
      <Page fullWidth>
        <Layout>
          <Layout.Section>
            <LegacyCard title="Order details" sectioned>
              <TextField
                label="Title"
                value={newData.title}
                autoComplete="off"
              />
              <TextField
                label="Description"
                value={newData.id}
                autoComplete="off"
                multiline={5}
              />

              <Grid>
                <Grid.Cell columnSpan={{ lg: 4 }}>
                  <LegacyCard title="" sectioned>
                    <img
                      alt=""
                      src={newData.featuredMedia.preview.image.url}
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

            <LegacyCard title="Search Engine Optimization" sectioned>
              <Text as='h1'>hydrogen-web</Text>
              <Text as="h3">SEO Optimizer</Text>
              <TextField
                name="inputTitle"
                label="Title"
                autoComplete="off"
                helpText="TITLE"
              />

              {actionData && actionData.title && (
                <div className="bg-slate-300 p-2">
                  <Badge tone='attention'>AI Recommended</Badge>
                  <p className="mt-1" >{actionData.title}</p>
                  
                  <div className=" flex justify-end">
                  <button onClick={copyTitleToClipboard}>
                    <Icon source={ClipboardIcon} tone="base" />
                  </button>
                  </div>
                </div>
              )}

              <TextField
                name="inputDescription"
                label="Description"
                autoComplete="off"
                multiline={5}
                helpText="DESCRIPTION"
                showCharacterCount
              />
              {actionData && actionData.title && (
                <div className="bg-slate-300 p-2">
                  <Badge tone='attention'>AI Recommended</Badge>
                  <p className="mt-1">{actionData.description}</p>

                  <div className=" flex justify-end">
                  <button onClick={copyTitleToClipboard}  >
                    <Icon source={ClipboardIcon} tone="base" />
                  </button>
                  </div>

                </div>
              )}

              <TextField
                label="URL Handle"
                value={newData.featuredMedia.preview.image.url}
                autoComplete="off"
                helpText="aasdasdas"
              />

              {/* Form for submitting SEO generation */}
              <Form method="post">
                <button type="submit" disabled={loading} className=" border-2 border-slate-400 p-2">
                  {loading ? 'Generating...' : 'Generate SEO Title and Description'}
                </button>
              </Form>
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

    </div>
  );
}
