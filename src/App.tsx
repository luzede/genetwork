import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Layout from "./Layout";

const App = () => {
	return (
		<>
			<Router>
				<Layout>
					<Routes>
						<Route path="/" />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
					</Routes>
				</Layout>
			</Router>
		</>
	);
};

export default App;
