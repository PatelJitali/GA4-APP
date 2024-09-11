import React, { useEffect, useState, useCallback } from "react";
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
  Pagination,
  Frame,
  Modal,
  TextContainer,
  Toast,
  ButtonGroup,
} from "@shopify/polaris";
import { useLoaderData, useNavigate, useLocation, useSubmit, useActionData } from "@remix-run/react";
import axios from "axios";
import { DeleteIcon, EditIcon } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";


export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  return session;
};

export const action = async ({ request }) => {
  const { admin ,session  } = await authenticate.admin(request);
  
  if (request.method !== "DELETE") {
    return json({ message: "Method not allowed" }, { status: 405 });
  }

  const formData = await request.formData();
  const id = formData.get("id");

  try {
    await axios.delete(`https://7843-122-170-77-62.ngrok-free.app/api/header/${id}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'x-api-key': 'abcdefg',
      }
    });

    const response = await admin.graphql(`
      query {
          shop {
              id
              name
              email
              myshopifyDomain
          }
      }
  `);
  
  const responseBody = await response.json();
  const shopData = responseBody.data.shop;

  // Fetch updated script data
  const scriptData = await fetch(`https://7843-122-170-77-62.ngrok-free.app/api/header?storename=${session.shop}`, {
      headers: {
          'ngrok-skip-browser-warning': 'true',
          'x-api-key': 'abcdefg',
      },
  });

  if (!scriptData.ok) {
      throw new Error(`HTTP error! status: ${scriptData.status}`);
  }

  const responseData = await scriptData.json();

  // Update metafield
  await admin.graphql(`
      mutation {
          metafieldsSet(metafields: [
              {
                  ownerId: "${shopData.id}",  
                  namespace: "custom-script",
                  key: "header-script",
                  value: ${JSON.stringify(JSON.stringify(responseData))},
                  type: "json"
              }
          ]) {
              metafields {
                  id
              }
          }
      }
  `);

    return json({ success: true });


    


  } catch (error) {
    console.error("Error deleting item:", error);
    return json({ success: false, error: error.message }, { status: 500 });
  }
};


const Test = () => {
  const shopName1 = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = useSubmit();
  const actionData = useActionData();
  const [data, setData] = useState([]);
  const [showBanner, setShowBanner] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalActive, setModalActive] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toastActive, setToastActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;
  

  useEffect(() => {
    window.globalShopName = shopName1.shop;
    console.log("Global Shop Name:", window.globalShopName); // Log the global shop name
    headerData();
  }, [shopName1.shop]);

  useEffect(() => {
    localStorage.setItem('shopName', shopName1.shop);
  }, [shopName1.shop]);

  useEffect(() => {
    if (location.state && location.state.updated) {
      setToastActive(true);
      window.history.replaceState({}, document.title); // Clear state
    }
  }, [location]);
  useEffect(() => {
    if (actionData?.success) {
      setToastActive(true);
      headerData(); // Refresh data after successful delete
    }
  }, [actionData]);

  async function headerData() {
    try {
      const response = await axios.get(
        `https://7843-122-170-77-62.ngrok-free.app/api/header?storename=${shopName1.shop}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'x-api-key': 'abcdefg',
          },
        }
      );
  
      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setData(response.data);
      } else {
        console.error("Error: Data fetched is not an array:", response.data);
        setData([]); // Set to empty array to avoid map error
      }
    } catch (error) {
      console.error("Error fetching header data:", error);
      setData([]); // Set to empty array to avoid map error
    }
  }

  const handleEdit = (id) => {
    navigate('/app/edit', {
      state: { id: id }
    });
  };

   const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setModalActive(true);
  };

  const handleModalChange = useCallback(() => setModalActive(!modalActive), [modalActive]);

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('id', itemToDelete);
      
      // Set the current page instantly before submitting
      const newTotalItems = data.length - 1; // Decrease by 1 as one item is deleted
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      
      // Check if the current page will be empty after deletion
      const isCurrentPageEmpty = currentItems.length === 1; // The current page will be empty after deletion if only one item was left
      
      if (isCurrentPageEmpty && currentPage > 1) {
        // Redirect to the first page instantly
        setCurrentPage(1);
      } else if (currentPage > newTotalPages) {
        // Set to the last available page
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
      }
      
      await submit(formData, { method: 'delete' });
      setModalActive(false);
      setItemToDelete(null);
  
      // Fetch the updated data after adjusting the page
      await headerData();
  
      setIsLoading(false);
    }
  };
  
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(data) ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

  const rows = Array.isArray(currentItems) ? currentItems.map(item => [
    <Text variant="bodyMd">{item.title}</Text>,
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <ButtonGroup variant="segmented">
        <Button size="slim" icon={EditIcon} onClick={() => handleEdit(item._id)}>Edit</Button>
        <Button size="slim" icon={DeleteIcon} onClick={() => handleDeleteClick(item._id)} destructive>Delete</Button>
      </ButtonGroup>
    </div>
  ]) : [];

  const toggleToastActive = useCallback(() => setToastActive((active) => !active), []);

  const toastMarkup = toastActive ? (
    <Toast content="Delete Data Successfully" onDismiss={toggleToastActive} />
  ) : null;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return (
    <Frame>
      <Page>
      <ui-title-bar title="Configuration Data"></ui-title-bar>
        <Layout>
          <Layout.Section>
            <InlineStack align="space-between">
              <Text variant="headingXl" as="h4" alignment="start">
                Display Data
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
            <LegacyCard>
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
                <>
                  <DataTable
                    columnContentTypes={[
                      'text',
                      'text',
                      'text',
                    ]}
                    headings={[
                      <Text variant="bodyMd" fontWeight="bold">Title</Text>,
                      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Text variant="bodyMd" fontWeight="bold">Action</Text>
                      </div>,
                    ]}
                    rows={rows}
                    hideScrollIndicator
                  />
                  
                    {totalPages > 1 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '16px 0'
                    }}>
                      <Pagination
                        label={`Page ${currentPage} of ${totalPages}`}
                        hasPrevious={currentPage > 1}
                        onPrevious={() => setCurrentPage(prev => prev - 1)}
                        hasNext={indexOfLastItem < totalItems}
                        onNext={() => setCurrentPage(prev => prev + 1)}
                      />
                    </div>
                  )}
                
                </>
              )}
            </LegacyCard>
          </Layout.Section>
        </Layout>

        <Modal
          open={modalActive}
          onClose={handleModalChange}
          title="Confirm Deletion"
          primaryAction={{
            content: 'Delete',
            onAction: handleConfirmDelete,
            destructive: true,
            loading: isLoading,
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleModalChange,
            },
          ]}
        >
          <Modal.Section>
            <TextContainer>
              <p>Are you sure you want to delete this item?</p>
            </TextContainer>
          </Modal.Section>
        </Modal>
        {toastMarkup}
      </Page>
    </Frame>
  );
};

export default Test;