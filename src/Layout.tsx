import { NavBar, Tabs } from "@/components";
import { Toaster } from "./components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<NavBar className="fixed top-0 bg-background z-30" />
			<main className="flex-auto my-20">{children}</main>
			<Tabs />
			<Toaster />
		</>
	);
}
