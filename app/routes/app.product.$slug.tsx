import { Page, Button, LegacyCard, Layout, TextField, Grid, Select, Text, Badge, Icon, Card, } from "@shopify/polaris";
import { useLoaderData, useParams, Form, useActionData, useLocation } from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "~/shopify.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { ClipboardIcon, XIcon } from '@shopify/polaris-icons';
import axios from 'axios';

// GraphQL query to fetch products
const SET_PRODUCTS = `#graphql
  query ($productId: ID!) {
    product(id:$productId) {
      description
      title
      id
      status
      handle
      vendor
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
  }`

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
  const title = formData.get("inputTitle");
  const description = formData.get("inputDescription");
  const category = formData.get("category")


  const prompt = `Generate an SEO-optimized title and description for the product with the following details: 
  - Category: "${category}" 
  - Title:"${title}"
  - Description: "${description}".

  Focus solely on the Category and generate Meta-Title, Meta-Description and Meta-Tags as per.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: `Generate an SEO title and description for: ${prompt}` }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`,
        },
      }
    );
    const content = response.data.choices[0].message.content.split('\n');
    const filterContent = content.filter(e => e.trim() !== "");
    const newtitle = filterContent[0].replace(/^Title:\s*/, "");    
    const title = newtitle.replace(/^Meta-Title:\s*/, "");
    const newDesc = filterContent[1].replace(/^Description:\s*/, "");
    const description = newDesc.replace(/Meta-Description:/gi, "");
    const metaTags = filterContent[2].replace(/Tags:/gi, "Keywords:");

    return json({ title, description, metaTags, content });
  } catch (error) {
    console.error('Error generating SEO content:', error);
    return json({ error: 'Failed to generate SEO content' }, { status: 500 });
  }
};

export default function UserPage() {
  const params = useParams();
  const productId = `gid://shopify/Product/${params.slug}`;
  const data = useLoaderData();
  const actionData = useActionData();
  const newData = data.data.product;

  const [inputTitle, setInputTitle] = useState(newData.title);
  const [metaTitle, setMetaTitle] = useState("");
  const [inputDescription, setInputDescription] = useState(newData.description);
  const [metaTags, setMetaTags] = useState("");
  const [category, setSelectedCategory] = useState("");

  const [addCategory, setAddedCategory] = useState("");

  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedTags, setGeneratedTags] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');

  const [message, setMessage] = useState("")

  const [titleLoading, setTitleLoading] = useState(false);

  const [closeTitle, setCloseTitle] = useState(true)
  const [closeTags, setCloseTags] = useState(true)
  const [closeDesc, setCloseDesc] = useState(true)

  const location = useLocation();
  const currentUrl = location.pathname;
  const newPathname = currentUrl.replace(/\d+/g, '');
  const backId = newPathname.replace("product", "products");


  useEffect(() => {
    if (actionData) {
      const { title, description, metaTags } = actionData;
      if (title && description && metaTags) {
        setGeneratedTitle(title);
        setGeneratedDescription(description);
        setGeneratedTags(metaTags);
        setTitleLoading(false);
        setCloseTitle(false);
        setCloseTags(false);
        setCloseDesc(false);
      }
    }

  }, [actionData]);

  const copy = (prop: any) => {
    navigator.clipboard.writeText(prop)
  };

  const DEFAULT_IMAGE_URL = 'https://images.unsplash.com/photo-1544208757-ddbaebce244e?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const getImageSrc = (data) => {
    return data?.featuredMedia?.preview?.image?.url || DEFAULT_IMAGE_URL; // Safely access the URL or return an empty string
  };
  const [options, setOptions] = useState([
    { label: 'Sports', value: 'sports' },
    { label: 'Clothing', value: 'clothing' },
    { label: 'Farming', value: 'farming' },
    { label: 'Electronic', value: 'electronic' },
    { label: 'Literary', value: 'literary' },
  ]);


  const handleAddCategory = () => {
    const trimmedCategory = addCategory.trim();
    if (trimmedCategory && !options.some(option => option.value.toLowerCase() === trimmedCategory.toLowerCase())) {
      const newCategory = { label: trimmedCategory, value: trimmedCategory.toLocaleUpperCase() };
      setOptions(prevOptions => [newCategory, ...prevOptions]);
      setAddedCategory("");
      setSelectedCategory(newCategory.value);
    } else {
      setMessage("Category already added or invalid");
    }
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
              <Button>
                Submit
              </Button>
            </div>

            <div className="pt-2 pb-2">
              <TextField
                label="Title"
                value={newData.title}
                autoComplete="off"
              />
            </div>

            <TextField
              label="Description"
              value={newData.description}
              autoComplete="off"
              multiline={5}
              showCharacterCount
            />

            <div className="mt-3">
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
                    <Button onClick={() => console.log(newData)}>+</Button>
                  </LegacyCard>
                </Grid.Cell>
              </Grid>
            </div>
          </LegacyCard>
        </Layout.Section>
      </Layout>
      {/* Seo Optimization */}
      <div className="mt-4">
        <Layout>
          <Layout.Section>
            <Form method="post">
              <LegacyCard sectioned>
                <div className="flex justify-between items-center pt-1 pb-1">
                  <div>
                    <Text variant='heading2xl' tone='magic'> SEO Optimization</Text>
                    <Text variant='headingLg' tone='magic-subdued'> {newData.title}</Text>
                    <Text variant='headingxl' tone='success'> {newData.id}</Text>
                  </div>
                  <div className="w-[50%]">
                    <TextField
                      label="Title"
                      value={inputTitle}
                      name="inputTitle"
                      onChange={(e) => setInputTitle(e)}
                      autoComplete="off"
                      clearButton
                      onClearButtonClick={() => setInputTitle("")}
                    />
                    <div className="mt-2">
                      <Button submit onClick={() => setTitleLoading(true)}>
                        {titleLoading ? 'Generating...' : 'Generate SEO META-Title/Description/Keywords'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-2">
                  <TextField
                    label="Meta-Title"
                    value={metaTitle}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setMetaTitle("")}
                    onChange={(e) => setMetaTitle(e)}
                    name="metaTags"
                  />
                </div>

                {/* title */}
                {generatedTitle &&(
                  <div >
                    {!closeTitle && (
                    <Card>
                      <div className=" flex justify-between pb-2">
                        <Badge tone='attention' progress='partiallyComplete'>AI Recommended META-TITLE</Badge>
                        <button onClick={() => setCloseTitle(true)} className="hover:scale-[120%]">
                          <Icon source={XIcon} tone='textWarning' />
                        </button>
                      </div>
                      <Badge tone='success' progress='complete' >
                        {generatedTitle}
                      </Badge>

                      <div className=" flex justify-end mt-2">
                        <button onClick={() => copy(generatedTitle)}>
                          <Icon source={ClipboardIcon} tone="base" />
                        </button>

                        <Button onClick={() => setMetaTitle(generatedTitle)}>
                          useThis
                        </Button>
                      </div>
                    </Card>
                    )}
                  </div>
                )}
                  <TextField
                    label="Meta-Keywords"
                    value={metaTags}
                    autoComplete="off"
                    clearButton
                    onClearButtonClick={() => setMetaTags("")}
                    onChange={(e) => setMetaTags(e)}
                    name="metaTags"
                  />
                {/* metaTags */}
                {generatedTags && (
                  <div >
                    {!closeTags &&(
                    <Card>
                          <div className=" flex justify-between pb-2">
                            <Badge tone='attention' progress='partiallyComplete'>AI Recommended meta-tags</Badge>
                            <button onClick={() => setCloseTags(true)} className="hover:scale-[120%]">
                              <Icon source={XIcon} tone='textWarning' />
                            </button>
                          </div>
                          <Badge tone='success' progress='complete' >
                            {generatedTags}
                          </Badge>
                          <div className=" flex justify-end mt-2">
                            <button onClick={() => copy(generatedTags)}>
                              <Icon source={ClipboardIcon} tone="base" />
                            </button>

                            <Button onClick={() => setMetaTags(generatedTags)}>
                              useThis
                            </Button>
                          </div>
                  </Card>
                  )}
                </div>
                )}

              <TextField
                label="Meta-Description"
                value={inputDescription}
                autoComplete="off"
                multiline={5}
                showCharacterCount
                onChange={(e) => setInputDescription(e)}
                name="inputDescription"
                clearButton
                onClearButtonClick={() => setInputDescription("")}
              />
              {/* Description */}
              {generatedDescription && (
                <div >
                  {!closeDesc && (
                  <Card>
                    <div className=" flex justify-between pb-2">
                      <Badge tone='attention' progress='partiallyComplete'>AI Recommended META-DESCRIPTION</Badge>
                      <button onClick={() => setCloseDesc(true)} className="hover:scale-[120%]">
                        <Icon source={XIcon} tone='textWarning' />
                      </button>
                    </div>
                    <Badge tone='success' progress='complete' >
                      {generatedDescription}
                    </Badge>
                    <div className=" flex justify-end mt-2">
                      <button onClick={() => copy(generatedDescription)}>
                        <Icon source={ClipboardIcon} tone="base" />
                      </button>

                      <Button onClick={() => setInputDescription(generatedDescription)}>
                        useThis
                      </Button>
                    </div>
                  </Card>
                  )}
                </div>
              )}

              <div className="mt-3">
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
                      <Button onClick={() => console.log(data)}>+</Button>
                    </LegacyCard>
                  </Grid.Cell>
                </Grid>
              </div>

            </LegacyCard>

          </Form>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <LegacyCard title="Select a Category" sectioned>

            <div className="flex items-start justify-between mb-2 )">
              <div className="flex-1 mr-2">
                <TextField
                  placeholder="Create a Category"
                  value={addCategory}
                  onChange={(e) => setAddedCategory(e)}
                  clearButton
                  showCharacterCount
                  onClearButtonClick={() => setAddedCategory('')

                  }
                />
                {message && ((
                  <div className="flex items-center justify-center mt-2">
                    <Badge progress='complete' tone='warning'>{message}</Badge>
                    <button onClick={() => setMessage("")}>
                      <Icon source={XIcon} tone='textWarning' />
                    </button>
                  </div>
                ))}

              </div>
              <Button variant='primary' onClick={handleAddCategory}>Submit</Button>
            </div>
            <Select
              label="Select a category"
              options={options}
              name="category"
              value={category}
              onChange={(e) => setSelectedCategory(e)}
            />
          </LegacyCard>


        </Layout.Section>

      </Layout>

    </div>
    </Page >
  );
}

