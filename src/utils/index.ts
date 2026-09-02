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
	// cap on how long repeated calls may postpone the trailing call
	maxWait?: number
}

export function debounce<F extends (...args: any[]) => any>(
	func: F,
	wait: number,
	options: Options = {},
) {
	let timeout: null | ReturnType<typeof setTimeout> = null
	let maxWaitTimeout: null | ReturnType<typeof setTimeout> = null

	function cancel() {
		if (timeout) {
			clearTimeout(timeout)
		}
		if (maxWaitTimeout) {
			clearTimeout(maxWaitTimeout)
		}
		timeout = null
		maxWaitTimeout = null
	}

	function call(this: any, ...args: Parameters<F>) {
		if (timeout) {
			clearTimeout(timeout)
		}

		if (options.leading && !timeout) {
			func.apply(this, args)
		}

		timeout = setTimeout(() => {
			timeout = null
			if (options.trailing !== false) {
				func.apply(this, args)
			}
			if (maxWaitTimeout) {
				clearTimeout(maxWaitTimeout)
				maxWaitTimeout = null
			}
		}, wait)

		// anchored to the first call of a burst, not reset by later calls; useless
		// in leading-only mode where the call already fired at the leading edge
		if (options.trailing !== false && options.maxWait && !maxWaitTimeout) {
			maxWaitTimeout = setTimeout(() => {
				if (timeout) {
					clearTimeout(timeout)
				}
				timeout = null
				maxWaitTimeout = null
				func.apply(this, args)
			}, options.maxWait)
		}
	}

	call.cancel = cancel
	return call
}

export function throttle<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): T {
	let timeout: ReturnType<typeof setTimeout> | null = null
	let lastArgs: Parameters<T> | null = null
	let lastThis: ThisParameterType<T> | null = null

	const throttled = function (
		this: ThisParameterType<T>,
		...args: Parameters<T>
	) {
		lastArgs = args
		lastThis = this

		if (timeout === null) {
			timeout = setTimeout(() => {
				if (lastArgs) {
					func.apply(lastThis, lastArgs)
					lastArgs = null
					lastThis = null
					timeout = null
				}
			}, wait)
		}
	}

	return throttled as T
}

export function objectToQueryString(obj: Record<string, any>) {
	return Object.keys(obj)
		.map((key) => `${key}=${encodeURIComponent(obj[key])}`)
		.join("&")
}
