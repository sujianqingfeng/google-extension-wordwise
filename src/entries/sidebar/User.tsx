type UserProps = {
	name: string
	email: string
	avatar: string
}
export default function User({ avatar, name }: UserProps) {
	return (
		<div className="p-4 flex justify-center items-center flex-col">
			<img src={avatar} alt="avatar" className="w-10 h-10 rounded-full" />
			<p className="text-md">{name}</p>
		</div>
	)
}
