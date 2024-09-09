import { useNavigate, useLocation, useFetcher } from "@remix-run/react";
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
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    return session;
};

export const action = async ({ request }) => {
    const { admin, session } = await authenticate.admin(request);
    const updateformData = await request.formData();

    const value = updateformData.get('value');
    const head = updateformData.get('head');
    const body = updateformData.get('body');
    const id = updateformData.get('id');
    const shopName = session.shop;

    try {
        // Update existing data via API call
        await axios.put(
            `https://1222-110-225-99-87.ngrok-free.app/api/header/${id}`,
            {
                title: value,
                header: head,
                body: body,
            },
            {
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                    'x-api-key': 'abcdefg',
                },
            }
        );

        // Fetch shop data
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
        const scriptData = await fetch(`https://1222-110-225-99-87.ngrok-free.app/api/header?storename=${shopName}`, {
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
        console.error(error);
        return json({ success: false, error: error.message });
    }
};

const Edit = () => {
    const [editValue, setEditValue] = useState('');
    const [editHead, setEditHead] = useState('');
    const [editBody, setEditBody] = useState('');
    const [active, setActive] = useState(false);
    const [valueError, setValueError] = useState('');
    const [headError, setHeadError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const fetcher = useFetcher();

    let id = location?.state?.id;

    // Preload header data
    useEffect(() => {
        (async function fetchHeaderData() {
            try {
                const response = await axios.get(
                    `https://1222-110-225-99-87.ngrok-free.app/api/header/${id}`,
                    {
                        headers: {
                            'ngrok-skip-browser-warning': 'true',
                            'x-api-key': 'abcdefg',
                        },
                    }
                );
                const headerData = response.data.header;
                setEditValue(headerData.title);
                setEditBody(headerData.body);
                setEditHead(headerData.header);
            } catch (error) {
                console.error("Error fetching header data:", error);
            }
        })();
    }, [id]);

    // Show toast on successful update
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.success) {
            setActive(true);

            // Navigate to /app/display_data after 1.5 seconds
            const timeoutId = setTimeout(() => {
                setActive(false);
                navigate('/app/display_data');
            }, 1500);

            return () => clearTimeout(timeoutId); // Clean up timeout
        }
    }, [fetcher, navigate]);

    const handleSubmit = (event) => {
        if (!editValue) {
            setValueError('Subject Title is required');
            event.preventDefault();
            return;
        }
        if (!editHead) {
            setHeadError('Code in the header is required');
            event.preventDefault();
            return;
        }
        // Use fetcher to handle the form submission
        fetcher.submit(event.currentTarget, { method: "post" });
    };

    const toggleActive = useCallback(() => setActive((active) => !active), []);
    const toastMarkup = active ? <Toast content="Update Data Successfully" onDismiss={toggleActive} /> : null;

    const back = () => navigate('/app/display_data');

    return (
        <Frame>
            <Page backAction={{ content: 'Settings', onAction: back }} title="Edit Code">
                <fetcher.Form method="post" onSubmit={handleSubmit}>
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
                                    name="value"
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
                                    name="head"
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
                                    name="body"
                                />
                            </Card>
                            <input type="hidden" name="id" value={id} />
                            <input type="hidden" name="shopName" value={location?.state?.shopName} />
                            <PageActions
                                primaryAction={{ content: 'Update', submit: true }}
                                secondaryActions={{ content: 'Cancel', onAction: back }}
                            />
                        </Layout.Section>
                    </Layout>
                </fetcher.Form>
            </Page>
            {toastMarkup}
        </Frame>
    );
};

export default Edit;
