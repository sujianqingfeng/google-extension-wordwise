import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react"
import { LoaderCircle } from "lucide-react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
	size?: "sm" | "md" | "lg"
	loading?: boolean
	leftIcon?: ReactNode
	rightIcon?: ReactNode
	children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading = false,
			leftIcon,
			rightIcon,
			children,
			className = "",
			disabled,
			...props
		},
		ref,
	) => {
		const baseClasses =
			"inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"

		const variantClasses = {
			primary:
				"bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-soft hover:shadow-medium focus:ring-primary-500",
			secondary:
				"bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
			outline:
				"border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-primary-500",
			ghost:
				"bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500",
			danger:
				"bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-soft hover:shadow-medium focus:ring-red-500",
		}

		const sizeClasses = {
			sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
			md: "px-4 py-2 text-sm rounded-lg gap-2",
			lg: "px-6 py-3 text-base rounded-xl gap-2.5",
		}

		const isDisabled = disabled || loading

		return (
			<button
				ref={ref}
				className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
				disabled={isDisabled}
				{...props}
			>
				{loading ? (
					<LoaderCircle
						size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
						className="animate-spin"
					/>
				) : (
					leftIcon
				)}

				{children}

				{!loading && rightIcon}
			</button>
		)
	},
)

Button.displayName = "Button"

export default Button
