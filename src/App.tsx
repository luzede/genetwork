import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "./Layout";
import { TokenContextProvider } from "./tokenContext";

const App = () => {
	return (
		<>
			<Router>
				<TokenContextProvider>
					<Layout>
						<Routes>
							<Route path="/" />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
						</Routes>
					</Layout>
				</TokenContextProvider>
			</Router>
		</>
	);
};

export default App;
