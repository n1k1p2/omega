import { redirect } from "next/navigation";

/** Каноническая страница политики — /privacy. Этот путь оставлен как алиас для старых ссылок. */
export default function PolicyRedirect() {
  redirect("/privacy");
}
