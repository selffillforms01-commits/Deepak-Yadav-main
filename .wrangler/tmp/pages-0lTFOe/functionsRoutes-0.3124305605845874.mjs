import { onRequestOptions as __api_auth_send_email_otp_ts_onRequestOptions } from "C:\\Users\\karun\\Desktop\\SFFv2\\Deepak-Yadav-main\\functions\\api\\auth\\send-email-otp.ts"
import { onRequestPost as __api_auth_send_email_otp_ts_onRequestPost } from "C:\\Users\\karun\\Desktop\\SFFv2\\Deepak-Yadav-main\\functions\\api\\auth\\send-email-otp.ts"
import { onRequestOptions as __api_auth_verify_email_otp_ts_onRequestOptions } from "C:\\Users\\karun\\Desktop\\SFFv2\\Deepak-Yadav-main\\functions\\api\\auth\\verify-email-otp.ts"
import { onRequestPost as __api_auth_verify_email_otp_ts_onRequestPost } from "C:\\Users\\karun\\Desktop\\SFFv2\\Deepak-Yadav-main\\functions\\api\\auth\\verify-email-otp.ts"

export const routes = [
    {
      routePath: "/api/auth/send-email-otp",
      mountPath: "/api/auth",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_auth_send_email_otp_ts_onRequestOptions],
    },
  {
      routePath: "/api/auth/send-email-otp",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_send_email_otp_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/verify-email-otp",
      mountPath: "/api/auth",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_auth_verify_email_otp_ts_onRequestOptions],
    },
  {
      routePath: "/api/auth/verify-email-otp",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_verify_email_otp_ts_onRequestPost],
    },
  ]