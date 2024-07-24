import { X } from "lucide-react"

type SideHeaderProps = {
	onClose: () => void
}
export default function SideHeader({ onClose }: SideHeaderProps) {
	return (
		<header className="flex justify-between items-center p-2 border-b border-gray-100 border-1">
			<button type="button" onClick={onClose}>
				<X size={22} className="text-gray-300" />
			</button>
			<p className="text-3xl font-bold font-sassy-frass">
				<span className="text-primary-color">W</span>ordwise
			</p>
		</header>
	)
}
