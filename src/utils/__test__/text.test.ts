import { describe, test, expect } from 'vitest'

import { isText } from '../text'

describe('text', () => {
  test('isText', () => {
    expect(isText('hello')).toBeFalsy()
    expect(isText('hello world')).toBeTruthy()
  })
})
