// Hooks and other utilities
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDropzone } from "react-dropzone";
import type { z } from "zod";
import { useQuery } from "@tanstack/react-query";

// Components
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { ImagePlus } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
// import { toast } from "sonner";

// Requests
import { getUser } from "@/requests/user";

// Schemas
import { imageFormSchema } from "@/zodSchemas";

type Props = {
	className?: string;
	onSubmit: (values: z.infer<typeof imageFormSchema>) => void;
};

export const ImageUploader = React.forwardRef<HTMLFormElement, Props>(
	({ className, onSubmit }, ref) => {
		const userQuery = useQuery({
			queryKey: ["user"],
			queryFn: () => getUser(localStorage.getItem("token")),
			retry: false,
		});

		const [preview, setPreview] = React.useState<string | ArrayBuffer | null>(
			"",
		);

		const form = useForm<z.infer<typeof imageFormSchema>>({
			resolver: zodResolver(imageFormSchema),
			mode: "onBlur",
			defaultValues: {
				image: new File([""], "filename"),
			},
		});

		const onDrop = React.useCallback(
			(acceptedFiles: File[]) => {
				const reader = new FileReader();
				try {
					reader.onload = () => setPreview(reader.result);
					reader.readAsDataURL(acceptedFiles[0]);
					form.setValue("image", acceptedFiles[0]);
					form.clearErrors("image");
				} catch (error) {
					setPreview(null);
					form.resetField("image");
				}
			},
			[form],
		);

		const { getRootProps, getInputProps, fileRejections } = useDropzone({
			onDrop,
			maxFiles: 1,
			maxSize: 1000000,
			accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
		});

		if (userQuery.isLoading || userQuery.isError) return <></>;

		return (
			<Form {...form}>
				<form
					id="image-uploader"
					onSubmit={form.handleSubmit(onSubmit)}
					className={cn(className, "space-y-4")}
					ref={ref}
				>
					<FormField
						control={form.control}
						name="image"
						render={() => (
							<FormItem>
								<FormControl>
									<div
										{...getRootProps()}
										className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-full shadow-sm overflow-hidden"
									>
										<AspectRatio
											className="flex-col align-middle justify-center bg-secondary"
											ratio={1}
										>
											<img
												src={
													preview
														? (preview as string)
														: userQuery.data?.profile_url
												}
												alt="new profile upload"
												className={cn(
													preview || userQuery.data?.profile_url
														? ""
														: "hidden",
													"absolute top-0 min-w-full min-h-full rounded-lg object-cover hover:opacity-50 z-20",
												)}
											/>
											<ImagePlus className="min-w-full min-h-full absolute top-0 z-10 p-8 hover:opacity-50" />
										</AspectRatio>
										<Input {...getInputProps()} type="file" />
									</div>
								</FormControl>
								<FormMessage>
									{fileRejections.length !== 0 && (
										<p>
											Image must be less than 1MB and of type png, jpg, or jpeg
										</p>
									)}
								</FormMessage>
							</FormItem>
						)}
					/>
				</form>
			</Form>
		);
	},
);
