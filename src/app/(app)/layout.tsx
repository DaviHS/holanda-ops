import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import AppLayout from "@/components/shared/app-layout";

export default async function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return <AppLayout>{children}</AppLayout>;
}