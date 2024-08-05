// Hooks and other utilities
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

// Components
import { Button } from "./ui/button";
import { HomeIcon, PlusCircle, Search, UserCircle } from "lucide-react";

// Types

type Props = {
	className?: string;
};

// ####################################################
// COMPONENT
// ####################################################
export function Tabs({ className }: Props) {
	const location = useLocation();
	const navigate = useNavigate();

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		let navigateTo: string;

		if (e.currentTarget.id === "home-button") navigateTo = "/";
		else if (e.currentTarget.id === "plus-button") navigateTo = "/create";
		else if (e.currentTarget.id === "search-button") navigateTo = "/search";
		else navigateTo = "/profile";

		if (location.pathname === navigateTo) {
			navigate(navigateTo, { replace: true });
		} else {
			navigate(navigateTo);
		}
	};

	return (
		<div
			className={cn(
				className,
				"w-full mx-auto flex flex-row justify-around fixed bottom-0 align-middle bg-background",
			)}
		>
			<Button
				id="home-button"
				onClick={handleClick}
				variant="ghost"
				className={cn(
					location.pathname === "/" ? "bg-accent text-accent-foreground" : "",
					"flex-auto py-8",
				)}
			>
				<HomeIcon className="h-8 w-8" />
			</Button>
			<Button
				id="plus-button"
				onClick={handleClick}
				variant="ghost"
				className={cn(
					location.pathname === "/create"
						? "bg-accent text-accent-foreground"
						: "",
					"flex-auto py-8",
				)}
			>
				<PlusCircle className="h-8 w-8" />
			</Button>
			<Button
				id="search-button"
				onClick={handleClick}
				variant="ghost"
				className={cn(
					location.pathname === "/search"
						? "bg-accent text-accent-foreground"
						: "",
					"flex-auto py-8",
				)}
			>
				<Search className="h-8 w-8" />
			</Button>
			<Button
				id="usercircle-button"
				onClick={handleClick}
				variant="ghost"
				className={cn(
					location.pathname === "/profile"
						? "bg-accent text-accent-foreground"
						: "",
					"flex-auto py-8",
				)}
			>
				<UserCircle className="h-8 w-8" />
			</Button>
		</div>
	);
}
