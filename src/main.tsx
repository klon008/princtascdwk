import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./app/App";
import FishingPage from "./app/fishing/FishingPage";
import "./styles/index.css";

const router = createBrowserRouter(
  [
    { path: "/", element: <App /> },
    { path: "/fishing", element: <FishingPage /> },
  ],
  { basename: "/princtascdwk" },
);

createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
