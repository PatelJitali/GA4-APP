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
  Toast
} from "@shopify/polaris";
import { useLoaderData, useNavigate, useLocation } from "@remix-run/react";
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
  const location = useLocation();
  const [data, setData] = useState([]);
  const [showBanner, setShowBanner] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalActive, setModalActive] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [toastActive, setToastActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
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

  async function headerData() {
    try {
      const response = await axios.get(
        `https://8008-122-166-143-212.ngrok-free.app/api/header?storename=${shopName1.shop}`,
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://8008-122-166-143-212.ngrok-free.app/api/header/${id}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'x-api-key': 'abcdefg',
        }
      });
      headerData(); // Refresh data
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setModalActive(true);
  };

  const handleModalChange = useCallback(() => setModalActive(!modalActive), [modalActive]);

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      setIsLoading(true); // Set loading state to true

      try {
        await handleDelete(itemToDelete);
        // Delay showing the toast to ensure loading state is visible
        setTimeout(() => {
          setToastActive(true); // Show toast message
        }, 500); // Adjust timeout duration as needed
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        // Delay turning off the loading state
        setTimeout(() => {
          setIsLoading(false); // Set loading state to false
        }, 1500); // Adjust timeout duration as needed
        setModalActive(false);
        setItemToDelete(null);
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(data) ? data.slice(indexOfFirstItem, indexOfLastItem) : [];

  const rows = Array.isArray(currentItems) ? currentItems.map(item => [
    <Text variant="bodyMd">{item.title}</Text>,
    <Button size="slim" icon={EditIcon} onClick={() => handleEdit(item._id)}>Edit</Button>,
    <Button size="slim" icon={DeleteIcon} onClick={() => handleDeleteClick(item._id)} destructive>Delete</Button>
  ]) : [];

  const toggleToastActive = useCallback(() => setToastActive((active) => !active), []);

  const toastMarkup = toastActive ? (
    <Toast content="Delete Data Successfully" onDismiss={toggleToastActive} />
  ) : null;

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
                      <Text variant="bodyMd" fontWeight="bold">Action</Text>,
                      <Text variant="bodyMd" fontWeight="bold"></Text>,
                    ]}
                    rows={rows}
                    hideScrollIndicator
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '16px 0'
                  }}>
                    <Pagination
                      label={`Page ${currentPage} of ${Math.ceil((Array.isArray(data) ? data.length : 0) / itemsPerPage)}`}
                      hasPrevious={currentPage > 1}
                      onPrevious={() => setCurrentPage(prev => prev - 1)}
                      hasNext={indexOfLastItem < (Array.isArray(data) ? data.length : 0)}
                      onNext={() => setCurrentPage(prev => prev + 1)}
                    />
                  </div>
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
            loading: isLoading // Add loading indicator to the button
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
