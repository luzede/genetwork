import { UserMenu } from "@/components/UserMenu";

import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import ThemeSwitcherButton from "./ThemeSwitcherButton";

export default function NavBar() {
	return (
		<header className="w-full flex items-center justify-between px-3 sm:px-6 md:px-12 border-b shadow-sm py-3">
			<Button className="text-2xl" variant="ghost">
				<Link to="/">
					<b>GENetwork</b>
				</Link>
			</Button>
			<div className="flex items-center justify-between gap-3">
				<ThemeSwitcherButton />
				<UserMenu />
			</div>
		</header>
	);
}
