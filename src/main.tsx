import { createRoot } from "react-dom/client";
import { loader } from "@monaco-editor/react";
import App from "./app/App";
import "./styles/index.css";

// Configure Monaco to fetch from Cloudflare CDN instead of cdn.jsdelivr.net
loader.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
  },
});

createRoot(document.getElementById("root")!).render(<App />);