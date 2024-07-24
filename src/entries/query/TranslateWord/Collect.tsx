import { Heart } from "lucide-react"

type CollectProps = {
	onCollect: (next: boolean) => void
	isCollected: boolean
}

export default function Collect({ onCollect, isCollected }: CollectProps) {
	const onClick = () => {
		onCollect(!isCollected)
	}

	return (
		<button type="button" onClick={onClick}>
			{isCollected ? (
				<Heart size={20} fill="text-black dark:text-gray-300" />
			) : (
				<Heart size={20} />
			)}
		</button>
	)
}
