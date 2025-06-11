import { forwardRef, type HTMLAttributes, type ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "elevated" | "outlined" | "glass"
	padding?: "none" | "sm" | "md" | "lg"
	hover?: boolean
	children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
	(
		{
			variant = "default",
			padding = "md",
			hover = false,
			children,
			className = "",
			...props
		},
		ref,
	) => {
		const baseClasses = "rounded-xl transition-all duration-200"

		const variantClasses = {
			default:
				"bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 shadow-soft",
			elevated:
				"bg-white dark:bg-slate-800 shadow-medium border border-gray-200/30 dark:border-slate-700/30",
			outlined: "bg-transparent border-2 border-gray-200 dark:border-gray-700",
			glass:
				"glass-effect border border-gray-200/20 dark:border-gray-700/20 shadow-strong",
		}

		const paddingClasses = {
			none: "",
			sm: "p-4",
			md: "p-6",
			lg: "p-8",
		}

		const hoverClasses = hover
			? "hover-lift hover:shadow-medium cursor-pointer"
			: ""

		return (
			<div
				ref={ref}
				className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${hoverClasses}
          ${className}
        `}
				{...props}
			>
				{children}
			</div>
		)
	},
)

Card.displayName = "Card"

export default Card
