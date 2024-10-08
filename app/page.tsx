import { Button } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import AuthErrorMessage from "@/app/components/AuthErrorMessage"
import MUIThemeProvider from "@/app/components/MUIThemeProvider"
import styles from "@/app/styles/page.module.css"
import { auth, signIn, signOut } from "@/auth"
import sneeze from "@/public/stega sneeze.svg"

export default async function Home() {
  const session = await auth()

  return (
    <main className={styles.main}>
      <Image
        src={sneeze}
        alt="Stega the stegosaurus sneezes."
        width={849}
        height={657}
        priority={true}
        className={styles.sneeze}
        draggable="false"
      />
      <AuthErrorMessage className={styles.error} />
      <div className={styles.actionRow}>
        <MUIThemeProvider extend theme={{ typography: { fontSize: 18 } }}>
          {session == null ? (
            <form
              action={async () => {
                "use server"
                await signIn("github", { redirectTo: "/dashboard" }, { scope: "repo" })
              }}
            >
              <Button variant="contained" type="submit">
                Sign in with GitHub
              </Button>
            </form>
          ) : (
            <>
              <Link href="/dashboard">
                <Button variant="contained">Dashboard →</Button>
              </Link>
              <form
                action={async () => {
                  "use server"
                  await signOut()
                }}
              >
                <Button variant="text" type="submit">
                  Sign Out
                </Button>
              </form>
            </>
          )}
        </MUIThemeProvider>
      </div>
    </main>
  )
}
