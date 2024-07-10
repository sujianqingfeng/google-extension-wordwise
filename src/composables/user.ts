import { fetchUserInfoApi } from "@/api"

export async function fetchUser() {
	const { error, data } = await createSafePromise(fetchUserInfoApi)()
	if (error) {
		return null
	}
	return data
}
