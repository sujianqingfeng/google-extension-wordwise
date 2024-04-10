import { ImSpinner2 } from 'react-icons/im'

type LoadingProps = {
  size?: number
}
export default function Loading(props: LoadingProps) {
  const { size = 20 } = props
  return <ImSpinner2 size={size} className="animate-spin dark:text-gray-400 text-black" />
}
