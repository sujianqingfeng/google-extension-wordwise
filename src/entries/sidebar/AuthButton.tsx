import Loading from "@/components/Loading"

type AuthButtonProps = {
	onAuthClick: () => void
	loading?: boolean
}
export default function AuthButton({
	onAuthClick,
	loading = false,
}: AuthButtonProps) {
	const onClick = () => {
		if (loading) {
			return
		}
		onAuthClick()
	}
	return (
		<button
			type="button"
			className={`
        bg-primary-color hover:bg-primary-color/90 
        rounded-lg py-3 px-6 
        text-base font-medium
        flex items-center justify-center gap-3 
        text-white shadow-sm
        transition-all duration-200
        disabled:opacity-70 disabled:cursor-not-allowed
        w-[200px]
      `}
			onClick={onClick}
			disabled={loading}
		>
			{loading && <Loading color="white" size={20} />}
			<span>使用谷歌登录</span>
		</button>
	)
}
