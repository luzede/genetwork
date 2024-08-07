// Hooks and other utilities
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToken } from "@/tokenContext";
// import { useEffect } from "react";

// Components
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

// Requests

// Types
type Props = {
	className?: string;
};

// ####################################################
// COMPONENT
// ####################################################
export function UserMenu({ className }: Props) {
	const { token, setToken } = useToken();
	const queryClient = useQueryClient();

	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = () => {
		localStorage.removeItem("token");
		queryClient.invalidateQueries({ queryKey: ["user"] });
		queryClient.resetQueries({ queryKey: ["user"] });
		setToken(null);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className={cn("", className)}>
					<UserIcon className="h-8 w-8" />
				</Button>
			</DropdownMenuTrigger>
			{token ? (
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Button
							variant="ghost"
							onClick={() =>
								location.pathname !== "/profile" && navigate("/profile")
							}
							className="w-full h-full"
						>
							<UserIcon className="mr-2 h-5 w-5" />
							Profile
						</Button>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Button
							variant="ghost"
							onClick={() =>
								location.pathname !== "/settings" && navigate("/settings")
							}
							className="w-full h-full"
						>
							<SettingsIcon className="mr-2 h-5 w-5" />
							Settings
						</Button>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<Button
							variant="ghost"
							onClick={handleLogout}
							className="w-full h-full"
						>
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
							className="w-full h-full"
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
							className="w-full h-full"
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
