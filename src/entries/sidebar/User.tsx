type UserProps = {
	name: string
	email: string
	avatar: string
}
export default function User({ avatar, name, email }: UserProps) {
	return (
		<div className="p-6 flex justify-center items-center flex-col bg-gray-50 rounded-lg mx-4 mt-4">
			<div className="relative">
				<img
					src={avatar}
					alt="avatar"
					className="w-16 h-16 rounded-full border-2 border-primary-color p-0.5"
				/>
			</div>
			<p className="mt-3 text-lg font-medium text-gray-800">{name}</p>
			<p className="text-sm text-gray-500">{email}</p>
		</div>
	)
}
