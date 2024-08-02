import { Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
};

export default function ThemeSwitcherButton({ className }: Props) {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className={cn("", className)}
		>
			<Sun className="h-8 w-8 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-8 w-8 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
		</Button>
	);
}
