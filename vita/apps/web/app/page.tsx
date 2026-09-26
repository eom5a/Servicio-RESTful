import { redirect } from "next/navigation";

export default function RootPage() {
  // El middleware decide si esto acaba en /login o (tras autenticar) en /hoy.
  redirect("/hoy");
}
