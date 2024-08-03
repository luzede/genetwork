import { NavBar, Tabs } from "@/components";
import { Toaster } from "./components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<NavBar className="flex-none" />
			<main className="flex-auto">{children}</main>
			<Tabs />
			<Toaster />
		</>
	);
}
