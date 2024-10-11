import Loading from "@/components/Loading"

type AuthButtonProps = {
  onAuthClick: () => void
  loading?: boolean
}
export default function AuthButton({ onAuthClick, loading = false }: AuthButtonProps) {
  const onClick = () => {
    if (loading) {
      return
    }
    onAuthClick()
  }
  return (
    <button
      type="button"
      className="bg-primary-color rounded-md py-4 px-2 text-md flex align-center justify-center items-center gap-2 text-white"
      onClick={onClick}
    >
      {loading && <Loading color="white" />}
      Google Auth
    </button>
  )
}
