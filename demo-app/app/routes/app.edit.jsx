import { useNavigate, useLocation } from "@remix-run/react";
import {
    Button,
    Card,
    Page,
    TextField,
    Layout,
    PageActions,
} from "@shopify/polaris";
import { useState, useEffect } from 'react';
import axios from "axios";

const Edit = () => {
    const [formData, setFormData] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [editBody, setEditBody] = useState('');
    const [editHead, setEditHead] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    let id = location?.state?.id;

    useEffect(() => {
        (async function fetchHeaderData() {
            try {
                const response = await axios.get(
                    `https://693a-122-161-94-27.ngrok-free.app/api/header/${id}`,
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

    async function headerUpdate() {
        try {
            await axios.put(
                `https://693a-122-161-94-27.ngrok-free.app/api/header/${id}`,
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
        } catch (error) {
            console.error("Error updating header data:", error);
        }
        navigate('/app/display_data');
    }

    function back() {
        navigate('/app/display_data');
    }

    return (
        <Page
            backAction={{ content: 'Settings', onAction: back }}
            title=" Edit code"
            primaryAction={{ content: 'Update', onAction: headerUpdate }}
        >
            <Layout>
                <Layout.Section>
                    <Card roundedAbove="sm">
                        <TextField
                            label="Subject Title"
                            value={editValue}
                            onChange={(value) => setEditValue(value)}
                            autoComplete="off"
                        />
                    </Card>
                </Layout.Section>
                <Layout.Section>
                    <Card roundedAbove="sm">
                        <TextField
                            label="Code in the header"
                            value={editHead}
                            onChange={(value) => setEditHead(value)}
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
                            value={editBody}
                            onChange={(value) => setEditBody(value)}
                            multiline={14}
                            helpText="The code will be printed above the </body> tag."
                            autoComplete="off"
                        />
                    </Card>
                    <PageActions
                        primaryAction={{ content: 'Update', onAction: headerUpdate }}
                        secondaryActions={{ content: 'Cancel', onAction: back }}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default Edit;
