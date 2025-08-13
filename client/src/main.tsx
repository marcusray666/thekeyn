import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/premium.css";
import { ThemeProvider } from "./theme/ThemeProvider";
import BackgroundGlow from "./components/layout/BackgroundGlow";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <BackgroundGlow />
    <App />
  </ThemeProvider>
);
