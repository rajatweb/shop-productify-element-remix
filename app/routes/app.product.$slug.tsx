import { Page, Button, LegacyCard, Layout, TextField, Grid, Select, Text, Badge } from "@shopify/polaris";
import { useLoaderData, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";
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
  console.log(request);
  const productId = `gid://shopify/Product/${params.slug}`;
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(SET_PRODUCTS, {
    variables: { productId },
  });

  const productData = await response.json();
  console.log(productData)
  return productData;
};
export default function UserPage() {
  const params = useParams();
  const productId = `gid://shopify/Product/${params.slug}`;
  const [product, setProduct] = useState<any>(null);
  const data = useLoaderData();

  const newData = data.data.product;

  useEffect(() => {
    setProduct(data);
  }, [data]);

  const options = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'lastWeek' },
  ];
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSeoContent = async () => {
    setLoading(true);
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
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`, // Replace with your OpenAI API key
          },
        }
      );

      const content = response.data.choices[0].message.content.split('\n')
      console.log(content)
      setTitle(content[0]);
      setDescription(content[1]);
    } catch (error) {
      console.error('Error generating SEO content:', error);
    } finally {
      setLoading(false);
    }
  }

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
                <Grid.Cell columnSpan={{ lg: 4, }} >
                  <LegacyCard title="" sectioned>
                    <img
                      alt=""
                      src={newData.featuredMedia.preview.image.url}
                    />
                  </LegacyCard>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ lg: 2 }} >
                  <LegacyCard title="" sectioned>
                    <Button onClick={() => console.log(newData.featuredMedia.preview.image.url)}>+</Button>
                  </LegacyCard>
                </Grid.Cell>
              </Grid>

            </LegacyCard>

            <LegacyCard title="Search EnginE Optimization" sectioned>
              <Text as='h1'>hydrogen-web</Text>
              <Text as="h3">hydrogen-web hydrogen-webhydrogen-webhydrogen-web</Text>
              <Text variant='heading2xl' tone='magic' fontWeight='medium'>Gift Card</Text>
              <Text as='h1'>hydrogen-web</Text>
              <Text as="h3">hydrogen-web hydrogen-webhydrogen-webhydrogen-web</Text>
              <TextField
                value={input}
                label="Title"
                autoComplete="off"
                helpText="aasdasdas"
              />
              <Badge progress="incomplete" tone="attention">Recommened</Badge>
              <TextField
                label="Description"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                multiline={5}
                helpText="aasdasdas"
                showCharacterCount
              />
              <Badge progress="incomplete" tone="attention">Recommened</Badge>

              <TextField
                label="URL Handle"
                value={newData.featuredMedia.preview.image.url}
                autoComplete="off"
                helpText="aasdasdas"
              />
              <Button onClick={generateSeoContent} disabled={loading}>
                {loading ? 'Generating...' : 'Generate SEO Title and Description'}
              </Button>
              {title && (
                <div>
                  <h2>Generated Title:</h2>
                  <p>{title}</p>
                  <h2>Generated Description:</h2>
                  <p>{description}</p>
                </div>
              )}
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