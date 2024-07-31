import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";

import { Button } from "@/components/ui/button";

import Admin from "@/pages/Admin";

const App = () => {
	return (
		<Router>
			<Button>Click me</Button>
			<div>
				<Button>
					<Link to="/admin">Admin</Link>
				</Button>
				<Button>
					<Link to="/">Home</Link>
				</Button>
			</div>
			<Routes>
				<Route path="/admin" element={<Admin />} />
				<Route path="/" />
			</Routes>
		</Router>
	);
};

export default App;
