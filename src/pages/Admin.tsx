import { useState } from "react";

import { Login } from "@/components";

const Admin = () => {
	const [loggedIn] = useState(false);

	return <>{loggedIn ? <h1>Logged In</h1> : <Login />}</>;
};

export default Admin;
