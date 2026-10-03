import { redirect } from "next/navigation";

export default function ValidateDefaultPage() {
  redirect("/validate/billing");
}
