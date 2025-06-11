import { useState } from "react"
import AuthButton from "./AuthButton"
import { createBackgroundMessage } from "@/messaging/background"

interface AuthProps {
	success: () => void
}

export default function Auth({ success }: AuthProps) {
	const [loading, setLoading] = useState(false)

	const onAuthClick = async () => {
		setLoading(true)
		const bgs = createBackgroundMessage()
		await bgs.auth()
		setLoading(false)
		success()
	}

	return (
		<div className="animate-slide-in-up">
			<AuthButton loading={loading} onAuthClick={onAuthClick} />
		</div>
	)
}
