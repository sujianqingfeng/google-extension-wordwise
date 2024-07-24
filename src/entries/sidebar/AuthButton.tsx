import Loading from "../../components/Loading"

type AuthButtonProps = {
	onAuthClick: () => void
	loading?: boolean
}
export default function AuthButton(props: AuthButtonProps) {
	const { onAuthClick, loading = false } = props
	const onClick = () => {
		if (loading) {
			return
		}
		onAuthClick()
	}
	return (
		<button
			type="button"
			className="bg-primary-color rounded-md p-2 text-md flex align-center justify-center items-center gap-2"
			onClick={onClick}
		>
			{loading && <Loading />}
			Google Auth
		</button>
	)
}
