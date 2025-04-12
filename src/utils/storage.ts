import { storage, type StorageItemKey } from "#imports"
import { REFRESH_TOKEN, TOKEN } from "@/constants"

function createStorage<T = any>(key: StorageItemKey) {
	return {
		set(value: T) {
			return storage.setItem(key, value)
		},
		get() {
			return storage.getItem<T>(key)
		},
	}
}

export const tokenStorage = createStorage<string>(TOKEN)
export const refreshTokenStorage = createStorage<string>(REFRESH_TOKEN)
