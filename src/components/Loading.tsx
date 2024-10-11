import { LoaderCircle } from "lucide-react"

type LoadingProps = {
  size?: number
  color?: string
}
export default function Loading({ size, color }: LoadingProps) {
  return (
    <LoaderCircle
      size={size}
      color={color}
      className="animate-spin dark:text-gray-400 text-black"
    />
  )
}
