import { describe, test, expect } from 'vitest'

import { isText, similarCamelCase, similarPascalCase } from '../text'

describe('text', () => {
  test('isText', () => {
    expect(isText('hello')).toBeFalsy()
    expect(isText('hello world')).toBeTruthy()
  })

  test('similarCamelCase', () => {
    expect(similarCamelCase('hello')).toBeFalsy()
    expect(similarCamelCase('helloWord')).toBeTruthy()
  })

  test('similarPascalCase', () => {
    expect(similarPascalCase('hello')).toBeFalsy()
    expect(similarPascalCase('HelloWord')).toBeTruthy()
  })
})
