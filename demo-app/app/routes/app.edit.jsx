import { useNavigate, useLocation } from "@remix-run/react";
import {
    Button,
    Card,
    Page,
    TextField,
    Layout,
    PageActions,
    Toast,
    Frame,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from 'react';
import axios from "axios";

const Edit = () => {
    const [formData, setFormData] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editBody, setEditBody] = useState('');
    const [editHead, setEditHead] = useState('');
    const [active, setActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [valueError, setValueError] = useState('');
    const [headError, setHeadError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    let id = location?.state?.id;

    useEffect(() => {
        (async function fetchHeaderData() {
            try {
                const response = await axios.get(
                    `https://74c8-106-215-34-180.ngrok-free.appapi/header/${id}`,
                    {
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                            'x-api-key': 'abcdefg',
                        },
                    }
                );
                const headerData = response.data.header;
                setFormData(headerData);
                setEditValue(headerData.title);
                setEditBody(headerData.body);
                setEditHead(headerData.header);
                
            } catch (error) {
                console.error("Error fetching header data:", error);
            }
        })();
    }, [id]);
  
    const toggleActive = useCallback(() => {
        setActive((active) => !active);
    }, []);

    useEffect(() => {
        let timer;
        if (active) {
            timer = setTimeout(() => {
                setActive(false);
                navigate('/app/display_data');
            }, 1500);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [active]);

    const toastMarkup = active ? (
        <Toast content="Update Data Successfully" onDismiss={toggleActive} />
    ) : null;

    async function headerUpdate() {
        if (!editValue) {
            setValueError('Subject Title is required');
            return;
        }
        if (!editHead) {
            setHeadError('Code in the header is required');
            return;
        }
        
        setIsLoading(true); // Set local loading state to true
        shopify.loading(true); // Set Shopify loading state to true

        try {
            await axios.put(
                `https://74c8-106-215-34-180.ngrok-free.appapi/header/${id}`,
                {
                    title: editValue,
                    header: editHead,
                    body: editBody,
                },
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-key': 'abcdefg',
                    },
                }
            );

            // Delay showing the toast to ensure loading state is visible
            setTimeout(() => {
                setActive(true); // Show the toast message
            }, 500); // Adjust timeout duration as needed

        } catch (error) {
            console.error("Error updating header data:", error);
        } finally {
            // Delay turning off the loading state
            setTimeout(() => {
                setIsLoading(false); // Set local loading state to false
                shopify.loading(false); // Set Shopify loading state to false
            }, 1500); // Adjust timeout duration as needed
        }
    }

    function back() {
        navigate('/app/display_data');
    }

    return (
        <Frame>
            <Page
                backAction={{ content: 'Settings', onAction: back }}
                title="Edit code"
                primaryAction={{ content: 'Update', onAction: headerUpdate, disabled: isLoading }}
            >
                <Layout>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Subject Title"
                                value={editValue}
                                onChange={(value) => {
                                    setEditValue(value);
                                    if (value) setValueError('');
                                }}
                                autoComplete="off"
                                error={valueError}
                            />
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Code in the header"
                                value={editHead}
                                onChange={(value) => {
                                    setEditHead(value);
                                    if (value) setHeadError('');
                                }}
                                multiline={14}
                                helpText="The code will be printed in the <head> section."
                                autoComplete="off"
                                error={headError}
                            />
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Code in the body (optional)"
                                value={editBody}
                                onChange={(value) => setEditBody(value)}
                                multiline={14}
                                helpText="The code will be printed above the </body> tag."
                                autoComplete="off"
                            />
                        </Card>
                        <PageActions
                            primaryAction={{ content: 'Update', onAction: headerUpdate, disabled: isLoading }}
                            secondaryActions={{ content: 'Cancel', onAction: back }}
                        />
                    </Layout.Section>
                </Layout>
            </Page>
            {toastMarkup}
        </Frame>
    );
};

export default Edit;
