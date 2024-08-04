import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "./Layout";
import Home from "@/pages/Home";
import Settings from "@/pages/Settings";
import { TokenContextProvider } from "./tokenContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Router>
				<TokenContextProvider>
					<Layout>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/settings" element={<Settings />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
						</Routes>
					</Layout>
				</TokenContextProvider>
			</Router>
		</QueryClientProvider>
	);
};

export default App;
