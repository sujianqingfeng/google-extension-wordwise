import { storage } from "wxt/storage"
import { REFRESH_TOKEN, TOKEN } from "@/constants"

export function setToken(token: string) {
	return storage.setItem(TOKEN, token)
}

export function getToken() {
	return storage.getItem<string>(TOKEN)
}

export function setRefreshToken(refreshToken: string) {
	return storage.setItem(REFRESH_TOKEN, refreshToken)
}

export function getRefreshToken() {
	return storage.getItem<string>(REFRESH_TOKEN)
}
