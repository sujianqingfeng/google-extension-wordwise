import { Suspense } from "react"
import SideHeader from "./SideHeader"
import Loading from "@/components/Loading"
import IfAuth from "./IfAuth"
import QueryClientProvider from "@/components/QueryClientProvider"

type SideProps = {
	removeSidebar: () => void
}

export default function Sidebar({ removeSidebar }: SideProps) {
	return (
		<QueryClientProvider>
			<div className="fixed top-0 right-0 bottom-0 z-9999 w-[300px] bg-base shadow-sm">
				<SideHeader onClose={removeSidebar} />
				<Suspense fallback={<Loading />}>
					<IfAuth />
				</Suspense>
			</div>
		</QueryClientProvider>
	)
}
