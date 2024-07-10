import { Readability } from "@mozilla/readability"
import { format, isValid, toDate } from "date-fns"
import { useMutation } from "@tanstack/react-query"
import { fetchReadLaterApi } from "@/api"

export default function Later() {
	const mutation = useMutation({
		mutationFn: fetchReadLaterApi,
	})

	const onLater = () => {
		const documentClone = document.cloneNode(true) as Document
		const result = new Readability(documentClone).parse()
		console.log("🚀 ~ onLater ~ result:", result)

		if (!result) {
			return
		}

		const { title, excerpt, content, publishedTime: time, byline } = result
		const publishedTime = isValid(time) ? toDate(time) : new Date()

		mutation.mutate({
			title,
			desc: excerpt,
			author: byline || "",
			content,
			publishedTime: format(publishedTime, "yyyy-MM-dd HH:mm:ss"),
			source: location.href,
		})
	}

	return (
		<div>
			<button
				type="button"
				className="bg-slate-500 w-full rounded-md p-2"
				onClick={onLater}
			>
				Read later
			</button>
		</div>
	)
}
