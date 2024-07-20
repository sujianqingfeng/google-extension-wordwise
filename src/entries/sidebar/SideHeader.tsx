import { IoIosCloseCircle } from "react-icons/io"

type SideHeaderProps = {
	onClose: () => void
}
export default function SideHeader({ onClose }: SideHeaderProps) {
	return (
		<header className="flex justify-between items-center p-2 border-b border-gray-100 border-1">
			<button onClick={onClose}>
				<IoIosCloseCircle size={22} className="text-gray-300" />
			</button>
			<p className="text-3xl font-bold">wordwise</p>
		</header>
	)
}
