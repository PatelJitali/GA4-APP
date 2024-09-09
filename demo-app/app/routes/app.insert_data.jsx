import { useNavigate, useActionData, Form } from "@remix-run/react";
import { Button, Card, Page, TextField, Layout, PageActions, Toast, Frame } from "@shopify/polaris";
import { useState, useEffect, useCallback } from 'react';
import React from "react";
import axios from "axios";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";   
import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    return session ;
};

export const action = async ({ request }) => {

    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const value = formData.get('value');
    const head = formData.get('head');
    const body = formData.get('body');
    const shopName = formData.get('shopName');

    try {
        // Your existing API call
        const headerData = await axios.post(
            `https://1222-110-225-99-87.ngrok-free.app/api/header`,
            {
                title: value,
                header: head,
                body: body,
                storename: shopName
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

        // Fetch script data
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
        const metafieldUpdateResponse = await admin.graphql(`
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

const Test = () => {
    const  shopName1  = useLoaderData();
    const actionData = useActionData();
    
    const navigate = useNavigate();

    const [value, setValue] = useState('');
    const [head, setHead] = useState('');
    const [body, setBody] = useState('');
    const [active, setActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [valueError, setValueError] = useState('');
    const [headError, setHeadError] = useState('');

    const toggleActive = useCallback(() => {
        setActive((active) => !active);
    }, []);
   
    useEffect(() => {
        if (actionData?.success) {
            setActive(true);
            const timer = setTimeout(() => {
                setActive(false);
                navigate('/app/display_data');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [actionData, navigate]);

    const toastMarkup = active ? (
        <Toast content="Insert Data Successfully" onDismiss={toggleActive} />
    ) : null;

    function handleSubmit(event) {
        if (!value) {
            setValueError('Subject Title is required');
            event.preventDefault();
            return;
        }
        if (!head) {
            setHeadError('Code in the header is required');
            event.preventDefault();
            return;
        }
        setIsLoading(true);
    }

    function back() {
        navigate('/app/display_data');
    }

    return (
        <Frame>
            <Page
                backAction={{ content: 'Settings', onAction: back }}
                title={`Add New Code`}
            >
                <Form method="post" onSubmit={handleSubmit}>
                    <Layout>
                        <Layout.Section>
                            <Card roundedAbove="sm">
                                <TextField
                                    label="Subject Title"
                                    value={value}
                                    onChange={(newValue) => {
                                        setValue(newValue);
                                        if (newValue) setValueError('');
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
                                    value={head}
                                    onChange={(newValue) => {
                                        setHead(newValue);
                                        if (newValue) setHeadError('');
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
                                    value={body}
                                    onChange={(newValue) => setBody(newValue)}
                                    multiline={14}
                                    helpText="The code will be printed above the </body> tag."
                                    autoComplete="off"
                                    name="body"
                                />
                            </Card>
                            <input type="hidden" name="shopName" value={shopName1.shop} />
                            <PageActions
                                primaryAction={{ content: 'Save', submit: true, disabled: isLoading }}
                                secondaryActions={{ content: 'Cancel', onAction: back }}
                            />
                        </Layout.Section>
                    </Layout>
                </Form>
            </Page>
            {toastMarkup}
            
        </Frame>
    );
};

export default Test;