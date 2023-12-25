import { FcGoogle } from 'react-icons/fc'

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
      className="bg-slate-100 rounded-md p-2 text-md flex align-center justify-center items-center gap-2"
      onClick={onClick}
    >
      <FcGoogle />
      Google Auth
      {loading && 'loading'}
    </button>
  )
}
