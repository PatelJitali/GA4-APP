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
        `https://bba5-110-226-19-196.ngrok-free.app/api/header?storename=${shopName1.shop}`,
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
      await axios.delete(`https://bba5-110-226-19-196.ngrok-free.app/api/header/${id}`, {
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

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setModalActive(true);
  };

  const handleModalChange = useCallback(() => setModalActive(!modalActive), [modalActive]);

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete);
      setModalActive(false);
      setItemToDelete(null);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const rows = currentItems.map(item => [
    <Text variant="bodyMd">{item.title}</Text>,
    <Button size="slim" icon={EditIcon} onClick={() => handleEdit(item._id)}>Edit</Button>,
    <Button size="slim" icon={DeleteIcon} onClick={() => handleDeleteClick(item._id)} destructive>Delete</Button>
  ]);

  const toggleToastActive = useCallback(() => setToastActive((active) => !active), []);

  const toastMarkup = toastActive ? (
    <Toast content="Update Data Successfully" onDismiss={toggleToastActive} />
  ) : null;

  return (
    <Frame>
      <Page>
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
                  label={`Page ${currentPage} of ${Math.ceil(data.length / itemsPerPage)}`}
                  hasPrevious={currentPage > 1}
                  onPrevious={() => setCurrentPage(prev => prev - 1)}
                  hasNext={indexOfLastItem < data.length}
                  onNext={() => setCurrentPage(prev => prev + 1)}
                />
              </div>
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
