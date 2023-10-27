export type LoginReq = {
  token: string
  provider: string
}

export type LoginResp = {
  token: string
  name: string
  email: string
  avatar: string
}
