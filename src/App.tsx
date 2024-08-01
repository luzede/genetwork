import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Toaster } from "./components/ui/toaster";

import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const App = () => {
	return (
		<>
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
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/" />
				</Routes>
			</Router>
			<Toaster />
		</>
	);
};

export default App;
