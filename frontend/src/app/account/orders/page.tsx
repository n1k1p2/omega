import { redirect } from "next/navigation";

/** Вкладки ЛК живут на /account (см. AccountPage) — эта страница просто алиас для прямых ссылок из футера. */
export default function AccountOrdersRedirect() {
  redirect("/account?tab=orders");
}
