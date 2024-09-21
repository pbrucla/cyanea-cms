import styles from "@/app/styles/Loading.module.css"

export default function Loading({
  children,
  error,
}: Readonly<{
  children: React.ReactNode
  error?: boolean
}>) {
  return (
    <div className={styles.loading}>
      {error ? <span className={styles.boom}>💥</span> : <span className={styles.brick}>🧱</span>}
      <div>{children}</div>
    </div>
  )
}
