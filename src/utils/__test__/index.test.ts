import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { debounce } from "../index"

beforeEach(() => {
	vi.useFakeTimers()
})

afterEach(() => {
	vi.useRealTimers()
})

describe("debounce", () => {
	test("trailing call fires once after the quiet period", () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 300)

		debounced()
		vi.advanceTimersByTime(200)
		debounced()
		vi.advanceTimersByTime(299)
		expect(fn).not.toHaveBeenCalled()

		vi.advanceTimersByTime(1)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	test("maxWait fires despite continuous calls", () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 300, { maxWait: 800 })

		debounced()
		for (let tick = 0; tick < 5; tick++) {
			vi.advanceTimersByTime(200)
			// the burst never quiets down, so the 300ms trailing timer
			// keeps getting pushed out
			debounced()
		}

		// maxWait is anchored to the first call (t=0) and fires at t=800
		// even though the burst is still running
		expect(fn).toHaveBeenCalledTimes(1)
	})

	test("cancel prevents any pending call", () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 300, { maxWait: 800 })

		debounced()
		debounced.cancel()
		vi.advanceTimersByTime(1000)

		expect(fn).not.toHaveBeenCalled()
	})

	test("trailing:false fires only at the leading edge of a burst", () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 300, { leading: true, trailing: false })

		debounced()
		expect(fn).toHaveBeenCalledTimes(1)

		debounced()
		vi.advanceTimersByTime(1000)
		// the trailing callback must stay suppressed
		expect(fn).toHaveBeenCalledTimes(1)

		// a fresh burst after the quiet period leads again
		debounced()
		expect(fn).toHaveBeenCalledTimes(2)
	})

	test("trailing (default) does not double-fire with leading enabled", () => {
		const fn = vi.fn()
		const debounced = debounce(fn, 300, { leading: true })

		debounced()
		expect(fn).toHaveBeenCalledTimes(1)

		debounced()
		vi.advanceTimersByTime(300)
		// leading call + one trailing call, not three
		expect(fn).toHaveBeenCalledTimes(2)
	})
})
