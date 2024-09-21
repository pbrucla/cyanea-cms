import Link from "next/link"
import styles from "@/app/styles/Navbar.module.css"

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <h1>
          Cyanea <span>CMS</span>
        </h1>
      </Link>
      <p>
        for internal use only!
        <br />
        &copy; ACM Cyber 2024
      </p>
    </nav>
  )
}
