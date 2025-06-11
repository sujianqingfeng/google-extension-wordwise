import { LoaderCircle, Sparkles } from "lucide-react"

type LoadingProps = {
	size?: number
	color?: string
	variant?: "default" | "dots" | "pulse"
	text?: string
}

export default function Loading({
	size = 20,
	color,
	variant = "default",
	text,
}: LoadingProps) {
	if (variant === "dots") {
		return (
			<div className="flex items-center gap-1">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className={`w-2 h-2 rounded-full animate-bounce ${
							color ? "" : "bg-primary-500"
						}`}
						style={{
							backgroundColor: color,
							animationDelay: `${i * 0.1}s`,
							animationDuration: "0.6s",
						}}
					/>
				))}
				{text && (
					<span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
						{text}
					</span>
				)}
			</div>
		)
	}

	if (variant === "pulse") {
		return (
			<div className="flex items-center gap-2">
				<div className="relative">
					<Sparkles
						size={size}
						className={`animate-pulse-soft ${color ? "" : "text-primary-500"}`}
						style={{ color }}
					/>
					<div className="absolute inset-0 animate-ping">
						<Sparkles
							size={size}
							className={`opacity-30 ${color ? "" : "text-primary-500"}`}
							style={{ color }}
						/>
					</div>
				</div>
				{text && (
					<span className="text-sm text-gray-500 dark:text-gray-400">
						{text}
					</span>
				)}
			</div>
		)
	}

	return (
		<div className="flex items-center gap-2">
			<LoaderCircle
				size={size}
				className={`animate-spin ${
					color ? "" : "text-primary-500 dark:text-primary-400"
				}`}
				style={{ color }}
			/>
			{text && (
				<span className="text-sm text-gray-500 dark:text-gray-400">{text}</span>
			)}
		</div>
	)
}
