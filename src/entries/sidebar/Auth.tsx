import { useState } from "react"
import { createBackgroundMessage } from "@/messaging/background"
import AuthButton from "./AuthButton"

interface AuthProps {
	success: () => void
}

export default function Auth({ success }: AuthProps) {
	const [loading, setLoading] = useState(false)

	const onAuthClick = async () => {
		setLoading(true)
		// the user closing the Google window or a failed token exchange must
		// not leave the button spinning forever — this resets it either way
		try {
			const bgs = createBackgroundMessage()
			await bgs.auth()
			success()
		} catch (error) {
			console.error("登录失败:", error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="animate-slide-in-up">
			<AuthButton loading={loading} onAuthClick={onAuthClick} />
		</div>
	)
}
