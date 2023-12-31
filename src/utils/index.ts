export function createSafePromise<R = any, T extends any[] = any[]>(
  promiseFn: (...rest: T) => Promise<R>
) {
  if (typeof promiseFn !== 'function') {
    throw new Error('createSafePromise: promiseFn must be a function')
  }
  return async (
    ...rest: Parameters<typeof promiseFn>
  ): Promise<[true, R] | [false, any]> => {
    try {
      const data = await promiseFn(...rest)
      return [true, data]
    } catch (error) {
      return [false, error]
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
  options: Options = {}
) {
  let timeout: null | ReturnType<typeof setTimeout> = null

  function cancel() {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = null
  }

  function call(this: any, ...args: Parameters<F>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this

    if (timeout) {
      clearTimeout(timeout)
    }

    if (options.leading && !timeout) {
      func.apply(context, args)
    }

    timeout = setTimeout(() => {
      if (!options.trailing || timeout) {
        func.apply(context, args)
      }

      timeout = null
    }, wait)
  }

  call.cancel = cancel
  return call
}
