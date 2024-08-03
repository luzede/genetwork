import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { HomeIcon, PlusCircle, Search, UserCircle } from "lucide-react";
import { useState } from "react";

type Props = {
	className?: string;
};

export function Tabs({ className }: Props) {
	const [activeTab, setActiveTab] = useState("home-button");

	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setActiveTab(e.currentTarget.id);
	};

	return (
		<div
			className={cn(
				className,
				"w-full mx-auto flex flex-row justify-around fixed bottom-0 align-middle",
			)}
		>
			<Button
				id="home-button"
				onClick={handleClick}
				variant="ghost"
				className={cn(
					activeTab === "home-button" ? "bg-accent text-accent-foreground" : "",
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
					activeTab === "plus-button" ? "bg-accent text-accent-foreground" : "",
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
					activeTab === "search-button"
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
					activeTab === "usercircle-button"
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
