import { useNavigate } from "@remix-run/react";
import { Button, Card, Page, TextField, Layout, PageActions, Toast, Frame } from "@shopify/polaris";
import { useState, useEffect, useCallback } from 'react';
import React from "react";
import axios from "axios";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";


export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    return session;
};

const Test = () => {
    const shopName1 = useLoaderData();
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
        <Toast content="Insert Data Successfully" onDismiss={toggleActive} />
    ) : null;

    async function headerSubmit() {
        if (!value) {
            setValueError('Subject Title is required');
            return;
        }
        if (!head) {
            setHeadError('Code in the header is required');
            return;
        }
        console.log(value, head, body, shopName1.shop, 'posted data');
        setIsLoading(true); 
        shopify.loading(true); 
    
        try {
            const response = await axios.post(
                `https://b873-122-170-56-160.ngrok-free.app/api/header`,
                {
                    title: value,
                    header: head,
                    body: body,
                    storename: shopName1.shop
                },
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-key': 'abcdefg',
                    },
                }
            );
            console.log(response.data);
            setTimeout(() => {
                setActive(true);
            }, 500);
    
        } catch (error) {
            console.log(error);
        } finally {
            setTimeout(() => {
                setIsLoading(false); 
                shopify.loading(false); 
            }, 1500); 
        }
    }

    function back() {
        navigate('/app/display_data');
    }

    return (
        <Frame>
            <Page
                backAction={{ content: 'Settings', onAction: back }}
                title={`Add New Code`}
                primaryAction={{ content: 'Save', onAction: headerSubmit }}
            >
                <Layout>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Subject Title"
                                value={value}
                                onChange={(value) => {
                                    setValue(value);
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
                                value={head}
                                onChange={(value) => {
                                    setHead(value);
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
                                value={body}
                                onChange={(value) => setBody(value)}
                                multiline={14}
                                helpText="The code will be printed above the </body> tag."
                                autoComplete="off"
                            />
                        </Card>
                        <PageActions
                            primaryAction={{ content: 'Save', onAction: headerSubmit, disabled: isLoading }}
                            secondaryActions={{ content: 'Cancel', onAction: back }}
                        />
                    </Layout.Section>
                </Layout>
            </Page>
            {toastMarkup}
        </Frame>
    );
};

export default Test;
