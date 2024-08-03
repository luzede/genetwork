// JWT Token Context

import { createContext, useContext, useState } from "react";

const TokenContext = createContext<{
	token: string | null;
	setToken: React.Dispatch<React.SetStateAction<string | null>>;
}>({
	token: null,
	setToken: () => {},
});

const TokenContextProvider = ({ children }: { children: React.ReactNode }) => {
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token"),
	);

	const value = { token, setToken };

	return (
		<TokenContext.Provider value={value}>{children}</TokenContext.Provider>
	);
};

const useToken = () => {
	const context = useContext(TokenContext);
	if (context === undefined) {
		throw new Error("useToken must be used within a TokenContextProvider");
	}
	return context;
};

export { TokenContextProvider, useToken };
