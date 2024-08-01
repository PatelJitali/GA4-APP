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
        console.log(value, head, body, shopName1.shop, 'posted data');
        try {
            const response = await axios.post(
                `https://bba5-110-226-19-196.ngrok-free.app/api/header`,
                {
                    title: value,
                    header: head,
                    body: body,
                    storename: shopName1.shop // Pass shop name in the request
                },
                {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                        'x-api-key': 'abcdefg',
                    },
                }
            );
            console.log(response.data);
            setActive(true);
        } catch (error) {
            console.log(error);
        }
    }

    function back() {
        navigate('/app/display_data');
    }

    return (
        <Frame>
            <Page
                backAction={{ content: 'Settings', onAction: back }}
                title={`Add New Code`} // Display shop name in the title
                primaryAction={{ content: 'Save', onAction: headerSubmit }}
            >
                <Layout>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Subject Title"
                                value={value}
                                onChange={(value) => setValue(value)}
                                autoComplete="off"
                            />
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Code in the header"
                                value={head}
                                onChange={(value) => setHead(value)}
                                multiline={14}
                                helpText="The code will be printed in the <head> section."
                                autoComplete="off"
                            />
                        </Card>
                    </Layout.Section>
                    <Layout.Section>
                        <Card roundedAbove="sm">
                            <TextField
                                label="Code in the body"
                                value={body}
                                onChange={(value) => setBody(value)}
                                multiline={14}
                                helpText="The code will be printed above the </body> tag."
                                autoComplete="off"
                            />
                        </Card>
                        <PageActions
                            primaryAction={{ content: 'Save', onAction: headerSubmit }}
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
