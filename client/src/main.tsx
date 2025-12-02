import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { PostHogProvider } from "./lib/analytics";

createRoot(document.getElementById("root")!).render(
  <PostHogProvider>
    <App />
  </PostHogProvider>
);
