import {
  Layout,
  Page,
  EmptyState,
  Card,
  Box,
  Text,
  InlineStack,
  BlockStack,
  Button,
} from "@shopify/polaris";
// import main_whatsapp from "../assets/whatsapp_banner.png";
import { useLoaderData } from "@remix-run/react";
import { apiVersion, authenticate } from "../shopify.server";
import { useEffect, useState } from "react";
// import Logo from "../assets/logo.png";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    const { shop, accessToken } = session;
    const responseOfShop = await fetch(
      `https://${shop}/admin/api/${apiVersion}/shop.json`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      },
    );

    if (!responseOfShop.ok) {
      throw new Error(
        `Failed to fetch shop details: ${responseOfShop.status} ${responseOfShop.statusText}`,
      );
    }

    const shopDetails = await responseOfShop.json();
    return { shopDetails };
  } catch (error) {
    console.log(error, "ErrorResponse");
    return { error: error.message };
  }
};

export default function FirstPagePage() {
  const data = useLoaderData();
  const [shopOwnerName, setShopOwnerName] = useState("");
  useEffect(() => {
    const shop = data?.shopDetails?.shop?.shop_owner;
    setShopOwnerName(shop);
  }, [data]);

  const greetings = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Afternoon";
    } else {
      return "Evening";
    }
  };
  return (
    <Page>
      <ui-title-bar title="HomePage"></ui-title-bar>
      <Layout>
        <Layout.Section>
          <Card>
            <Box
              style={{
                display: "flex",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <>
                <Box>
                  <Box style={{ display: "flex" }}>
                    <Text as="h1" variant="headingXl">
                      Good {greetings()},&nbsp;
                    </Text>
                    {shopOwnerName && (
                      <Text
                        as="h1"
                        variant="headingXl"
                        style={{ display: "none" }}
                      >
                        {shopOwnerName} 👋😊
                      </Text>
                    )}
                  </Box>
                  <Box paddingBlockStart="100">
                    <Text as="p" variant="bodyLg">
                      Welcome to GA4 App
                    </Text>
                  </Box>
                </Box>
                <img
                  src="https://cc-app-store.myshopify.com/cdn/shop/files/Synergy_ZR01_-_Made_with_PosterMyWall.jpg?v=1718617479&width=1780"
                  alt="ChatNest"
                  style={{ maxWidth: 70, height: 70, marginRight: "20px" }}
                />
              </>
            </Box>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card>
            <Box padding="500">
              <BlockStack gap="300">
                <Box>
                  <InlineStack align="center">
                    <img
                      src="https://cc-app-store.myshopify.com/cdn/shop/files/Synergy_ZR01_-_Made_with_PosterMyWall.jpg?v=1718617479&width=1780"
                      alt="main_whatsapp"
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 5,
                        boxShadow:
                          "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
                      }}
                    />
                  </InlineStack>
                </Box>
                <Box paddingBlockStart="500">
                  <InlineStack align="center">
                    <Text as="h2" variant="headingLg">
                      Welcome to GA4 App
                    </Text>
                  </InlineStack>
                </Box>
                <Box paddingBlockStart="100">
                  <InlineStack align="center">
                    <Text as="p" variant="bodyLg">
                      Track and analyze user behavior across your website 
                      and app with Google Analytics 4 for advanced 
                      insights and optimization.
                    </Text>
                  </InlineStack>
                </Box>
                <Box paddingBlockStart="100">
                  <InlineStack align="center">
                    <Button size="large" url="/app/display_data">
                      Configure Data
                    </Button>
                  </InlineStack>
                </Box>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}