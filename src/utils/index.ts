export function createSafePromise<R = any, T extends any[] = any[]>(
	promiseFn: (...rest: T) => Promise<R>,
) {
	if (typeof promiseFn !== "function") {
		throw new Error("createSafePromise: promiseFn should be a function")
	}

	return async (
		...rest: Parameters<typeof promiseFn>
	): Promise<{ data: R; error: null } | { data: null; error: unknown }> => {
		try {
			const data = await promiseFn(...rest)
			return { data, error: null }
		} catch (error) {
			return { data: null, error }
		}
	}
}

interface Options {
	leading?: boolean
	trailing?: boolean
}

export function debounce<F extends (...args: any[]) => any>(
	func: F,
	wait: number,
	options: Options = {},
) {
	let timeout: null | ReturnType<typeof setTimeout> = null

	function cancel() {
		if (timeout) {
			clearTimeout(timeout)
		}
		timeout = null
	}

	function call(this: any, ...args: Parameters<F>) {
		if (timeout) {
			clearTimeout(timeout)
		}

		if (options.leading && !timeout) {
			func.apply(this, args)
		}

		timeout = setTimeout(() => {
			if (!options.trailing || timeout) {
				func.apply(this, args)
			}

			timeout = null
		}, wait)
	}

	call.cancel = cancel
	return call
}

export function objectToQueryString(obj: Record<string, any>) {
	return Object.keys(obj)
		.map((key) => `${key}=${obj[key]}`)
		.join("&")
}
