import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import indexStyles from "./style.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className="index">
      <div className="content">
      <img
          src="https://cdn.shopify.com/s/files/1/0656/2096/7579/files/ScriptInjector_New.png?v=1727415720"
          alt="login_logo"
          style={{ margin: "0 auto" }}
          height="100"
          width="100"
        />
        <h1>Welcome to ScripInjector App</h1>
        <p>Enhance Your Storefront with Flexible Script Integration.</p>
        {showForm && (
          <Form method="post" action="/auth/login">
            <label>
              <span className="labelSpan">Shop domain:</span>
              <input type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={indexStyles.button} type="submit">Log in</button>
          </Form>
        )}
      </div>
    </div>
  );
}
