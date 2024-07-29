import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  InlineStack,
  Page,
  Text,
  EmptyState,
  Layout,
  Banner,
  LegacyCard, 
  DataTable,
} from "@shopify/polaris";
import { useLoaderData } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import axios from "axios";
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return session;
};

const Test = () => {
  const shopName1 = useLoaderData();

  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Set globalShopName when shopName1 changes
    window.globalShopName = shopName1.shop;
    console.log("Global Shop Name:", window.globalShopName); // Log the global shop name
    headerData();
  }, [shopName1.shop]);

  useEffect(() => {
    // Store shopName in localStorage when it changes
    localStorage.setItem('shopName', shopName1.shop);
  }, [shopName1.shop]);

  async function headerData() {
    try {
      const response = await axios.get(
        `https://693a-122-161-94-27.ngrok-free.app/api/header?storename=${shopName1.shop}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'x-api-key': 'abcdefg',
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching header data:", error);
    }
  }

  const handleEdit = (id) => {
    navigate('/app/edit', {
      state: { id: id }
    });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://693a-122-161-94-27.ngrok-free.app/api/header/${id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'x-api-key': 'abcdefg',
        }
      });
      headerData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const rows = [
    ['Emerald Silk Gown', '$875.00', 124689, 140, '$122,500.00'],
    ['Mauve Cashmere Scarf', '$230.00', 124533, 83, '$19,090.00'],
    [
      'Navy Merino Wool Blazer with khaki chinos and yellow belt',
      '$445.00',
      124518,
      32,
      '$14,240.00',
    ],
  ];
  return (
    <Page>
       <LegacyCard>
        <DataTable
          columnContentTypes={[
            'text',
            'numeric',
            'numeric',
            'numeric',
            'numeric',
          ]}
          headings={[
            'Title',
            'Title',
          ]}
          rows={rows}
       
          pagination={{
            hasNext: true,
            onNext: () => {},
          }}
        />
      </LegacyCard>
      <Layout>
        <Layout.Section>
          <InlineStack align="space-between">
            <Text variant="headingXl" as="h4" alignment="start">
              Insert Code
            </Text>
            <Button variant="primary" onClick={() => navigate("/app/insert_data")}>
              Add Script
            </Button>
          </InlineStack>
        </Layout.Section>
        <Layout.Section>
          {showBanner && (
            <Banner
              title="Enable App Embed"
              onDismiss={() => setShowBanner(false)}
            >
              <InlineStack align="space-between">
                <Box>
                  <Text as="p">
                    Please make sure that the app is enabled from the Shopify
                    customization.
                  </Text>
                </Box>
                <Box>
                  <Button
                    url={`https://${shopName1.shop}/admin/themes/current/editor?context=apps`}
                    target="_blank"
                  >
                    Enable App Embed
                  </Button>
                </Box>
              </InlineStack>
            </Banner>
          )}
        </Layout.Section>
        <Layout.Section>
          {data.length === 0 ? (
            <Card>
              <EmptyState
                heading="You don't have any code"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Once you have a code it will display on this page.</p>
              </EmptyState>
            </Card>
          ) : (
            <Card roundedAbove="sm">
              {data.map((item, index) => (
                <div key={index}>
                  <Page
                    title={item.title}
                    secondaryActions={[
                      {
                        content: 'Edit',
                        icon: EditIcon,
                        onAction: () => handleEdit(item._id)
                      },
                      {
                        content: 'Delete',
                        destructive: true,
                        icon: DeleteIcon,
                        onAction: () => handleDelete(item._id)
                      }
                    ]}
                  />
                </div>
                
              ))}
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Test;
