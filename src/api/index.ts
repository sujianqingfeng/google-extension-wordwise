import type {
  IWordRespItem,
  LoginReq,
  LoginResp,
  TranslateParams,
  TranslateResp,
} from "./types";

export const fetchLoginApi = (body: LoginReq) => {
  return postWithTokenFetcher<LoginResp>({ url: "/auth" }, { arg: body });
};

export const fetchAllWordsApi = (token: string) => {
  return withTokenFetcher<IWordRespItem[]>({
    url: `/word/all`,
    token,
  });
};

// user
export const fetchUserInfoApi = (token: string) => {
  return withTokenFetcher<LoginResp>({
    url: "/user",
    token,
  });
};

// translation
export const fetchTranslateApi = (token: string, body: TranslateParams) => {
  return postWithTokenFetcher<TranslateResp>(
    { url: "/translator/translate", token },
    { arg: body },
  );
};
