import { Loader } from "lucide-react"

type LoadingProps = {
	size?: number
}
export default function Loading({ size }: LoadingProps) {
	return (
		<Loader
			size={size}
			className="animate-spin dark:text-gray-400 text-black"
		/>
	)
}
