import { NavBar } from "@/components";
import { Toaster } from "./components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<NavBar />
			<main className="flex-auto">{children}</main>
			<Toaster />
		</>
	);
}
