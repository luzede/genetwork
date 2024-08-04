import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
