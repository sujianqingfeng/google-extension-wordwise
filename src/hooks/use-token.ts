import { createContext, useContext } from 'react'

export const TokenContext = createContext('token')

export function useToken() {
  const token = useContext(TokenContext)

  return {
    token
  }
}
