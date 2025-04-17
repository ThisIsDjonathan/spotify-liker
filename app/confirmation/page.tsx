import { getSession } from "@/lib/spotifyAuth";
import { redirect } from "next/navigation";
import ConfirmationPage from "@/components/confirmation-page";

export default async function Confirmation() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return <ConfirmationPage email={session.email as string} />;
}
