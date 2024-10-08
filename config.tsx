type ValidateIdFunction = ((id: string) => { error: boolean; helperText: React.ReactNode } | {}) | null | undefined

export const validateId: ValidateIdFunction = id => {
  const regex = /^[wsuf](\d){2,}-./
  if (regex.test(id)) {
    return {}
  } else {
    return {
      error: true,
      helperText: (
        <>
          id must be in the format {"<quarter><year>"}
          <code>-</code>
          {"<description>"}.<br />
          the quarter is specified with a one-character prefix [<code>w</code>]inter / [<code>s</code>]pring / s[
          <code>u</code>]mmer / [<code>f</code>]all.
          <br />
          the year must be two or more digits.
          <br />
          (id must match the regex <code>{regex.toString()}</code>).
        </>
      ),
    }
  }
}

export const EVENT_TYPES: string[] = [
  "Cyber Academy",
  "Cyber Lab",
  "Psi Beta Rho",
  "ECTF",
  "Cyber Special Topics",
  "LA CTF",
  "CSRF",
  "Miscellaneous",
  "Collab",
  "Social",
  "GM",
  "Cyber x AI Symposium",
  "Speaker",
  "Career",
  "Industry",

  "ACM Studio",
  "ACM ICPC",
  "ACM Design",
  "ACM TeachLA",
  "ACM W",
  "ACM AI",
  "ACM Hack",
  "ACM Cloud",
]

export const EVENT_TYPE_ALLOW_ANY_INPUT: boolean = true

export const LINK_TYPES: Record<string, string> = {
  slides: "google slides link",
  youtube: "youtube recording link",
  discord: "discord link",
}

export const METADATA_CHECKBOXES: Record<string, string> = {
  "ignore-for-acm-newsletter": "do not push to the big acm newsletter (only check this for ACM GM events)",
}
