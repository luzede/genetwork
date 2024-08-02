import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	UserIcon,
	SettingsIcon,
	LogOutIcon,
	LogInIcon,
	UserPlus,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
	className?: string;
};

export function UserMenu({ className }: Props) {
	const navigate = useNavigate();
	const location = useLocation();
	const [TokenExists, setTokenExists] = useState(
		localStorage.getItem("token") !== null,
	);

	const handleLogout = () => {
		console.log("Logging out...");
		localStorage.removeItem("token");
		setTokenExists(false);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className={cn("", className)}>
					<UserIcon className="h-8 w-8" />
				</Button>
			</DropdownMenuTrigger>
			{TokenExists ? (
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Button variant="ghost">
							<UserIcon className="mr-2 h-5 w-5" />
							Profile
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Button variant="ghost">
							<SettingsIcon className="mr-2 h-5 w-5" />
							Settings
						</Button>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Button variant="ghost" onClick={handleLogout}>
							<LogOutIcon className="mr-2 h-5 w-5" />
							Logout
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			) : (
				<DropdownMenuContent>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							onClick={() =>
								location.pathname !== "/login" && navigate("/login")
							}
						>
							<LogInIcon className="mr-2 h-5 w-5" />
							Login
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							onClick={() =>
								location.pathname !== "/register" && navigate("/register")
							}
						>
							<UserPlus className="mr-2 h-5 w-5" />
							Register
						</Button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			)}
		</DropdownMenu>
	);
}
