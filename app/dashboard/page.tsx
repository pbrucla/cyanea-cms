import dynamic from "next/dynamic"
import { redirect } from "next/navigation"
import DashboardErrorBoundary from "@/app/dashboard/components/DashboardErrorBoundary"
import Loading from "@/app/components/Loading"
import styles from "@/app/styles/dashboard/page.module.css"
import { auth } from "@/auth"

const DashboardClient = dynamic(() => import("@/app/dashboard/components/DashboardClient"), {
  loading: () => <Loading>loading...</Loading>,
  ssr: false,
})

export default async function Dashboard() {
  const session = await auth()
  if (session === null) redirect("/")

  return (
    <>
      <main className={styles.main}>
        <DashboardErrorBoundary>
          <DashboardClient session={session} />
        </DashboardErrorBoundary>
      </main>
    </>
  )
}
