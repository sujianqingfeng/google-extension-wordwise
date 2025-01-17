import { X } from "lucide-react"

type SideHeaderProps = {
	onClose: () => void
}
export default function SideHeader({ onClose }: SideHeaderProps) {
	return (
		<header className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
			<button
				type="button"
				onClick={onClose}
				className="hover:bg-gray-100 p-1 rounded-full transition-colors duration-200"
			>
				<X size={20} className="text-gray-500" />
			</button>
			<p className="text-3xl font-bold font-sassy-frass tracking-wide">
				<span className="text-primary-color">W</span>ordwise
			</p>
		</header>
	)
}
