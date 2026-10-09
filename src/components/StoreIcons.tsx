// The stores' own marks for the download buttons, from the "SVG Logos" set by
// Gil Barbara (CC0, via Iconify). The trademarks belong to Google and Apple
// and are used only to identify where to get the app.

type IconProps = { className?: string }

/** The Chrome Web Store mark: the store bag with the Chrome logo. */
export function ChromeWebStoreIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 223" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="cws-red" x1="0%" x2="100%" y1="50%" y2="50%">
          <stop offset="0%" stopColor="#d93025" /><stop offset="100%" stopColor="#ea4335" />
        </linearGradient>
        <linearGradient id="cws-green" x1="74.943%" x2="19.813%" y1="95.826%" y2="-4.161%">
          <stop offset="0%" stopColor="#1e8e3e" /><stop offset="100%" stopColor="#34a853" />
        </linearGradient>
        <linearGradient id="cws-yellow" x1="59.898%" x2="21.416%" y1="-.134%" y2="99.86%">
          <stop offset="0%" stopColor="#fbbc04" /><stop offset="100%" stopColor="#fcc934" />
        </linearGradient>
        <path id="cws-bag" d="M255.983 0H0v204.837c0 9.633 7.814 17.464 17.464 17.464h221.072c9.633 0 17.464-7.814 17.464-17.464z" />
        <mask id="cws-mask" fill="#fff"><use href="#cws-bag" /></mask>
      </defs>
      <path fill="#f1f3f4" d="M255.983 0H0v204.837c0 9.633 7.814 17.464 17.464 17.464h221.072c9.633 0 17.464-7.814 17.464-17.464z" />
      <path fill="#e8eaed" d="M0 0h255.983v111.74H0z" />
      <path fill="#fff" d="M157.076 47.727H98.907A11.63 11.63 0 0 1 87.27 36.09a11.63 11.63 0 0 1 11.637-11.637h58.169a11.63 11.63 0 0 1 11.637 11.637c0 6.417-5.204 11.637-11.637 11.637" />
      <g mask="url(#cws-mask)">
        <g transform="translate(17.455 94.293)">
          <path fill="url(#cws-red)" d="m14.812 55.255l15.241 46.498l32.638 36.427l47.845-82.908l95.724-.017C187.146 22.213 151.443 0 110.536 0s-76.61 22.213-95.724 55.255" />
          <path fill="url(#cws-green)" d="m110.52 221.105l32.637-36.443l15.224-46.482H62.674L14.812 55.255c-19.047 33.076-20.445 75.128.017 110.561c20.445 35.434 57.545 55.256 95.69 55.29" />
          <path fill="url(#cws-yellow)" d="M206.26 55.272h-95.724l47.862 82.908l-47.862 82.925c38.162-.033 75.263-19.855 95.708-55.289c20.461-35.433 19.064-77.468.016-110.544" />
          <ellipse cx="110.536" cy="110.544" fill="#f1f3f4" rx="55.255" ry="55.272" />
          <ellipse cx="110.536" cy="110.544" fill="#1a73e8" rx="44.898" ry="44.915" />
        </g>
      </g>
      <path fill="#bdc1c6" opacity=".1" d="M0 111.74h255.983v1.448H0zm0-1.465h255.983v1.448H0z" />
    </svg>
  )
}

/** The Google Play mark: the four-colour triangle. */
export function GooglePlayIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 283" aria-hidden="true" focusable="false">
      <path fill="#ea4335" d="M119.553 134.916L1.06 259.061a32.14 32.14 0 0 0 47.062 19.071l133.327-75.934z" />
      <path fill="#fbbc04" d="M239.37 113.814L181.715 80.79l-64.898 56.95l65.162 64.28l57.216-32.67a31.345 31.345 0 0 0 0-55.537z" />
      <path fill="#4285f4" d="M1.06 23.487A30.6 30.6 0 0 0 0 31.61v219.327a32.3 32.3 0 0 0 1.06 8.124l122.555-120.966z" />
      <path fill="#34a853" d="m120.436 141.274l61.278-60.483L48.564 4.503A32.85 32.85 0 0 0 32.051 0C17.644-.028 4.978 9.534 1.06 23.399z" />
    </svg>
  )
}

/** The Apple mark, in the current text colour. */
export function AppleIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 315" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M213.803 167.03c.442 47.58 41.74 63.413 42.197 63.615c-.35 1.116-6.599 22.563-21.757 44.716c-13.104 19.153-26.705 38.235-48.13 38.63c-21.05.388-27.82-12.483-51.888-12.483c-24.061 0-31.582 12.088-51.51 12.871c-20.68.783-36.428-20.71-49.64-39.793c-27-39.033-47.633-110.3-19.928-158.406c13.763-23.89 38.36-39.017 65.056-39.405c20.307-.387 39.475 13.662 51.889 13.662c12.406 0 35.699-16.895 60.186-14.414c10.25.427 39.026 4.14 57.503 31.186c-1.49.923-34.335 20.044-33.978 59.822M174.24 50.199c10.98-13.29 18.369-31.79 16.353-50.199c-15.826.636-34.962 10.546-46.314 23.828c-10.173 11.763-19.082 30.589-16.678 48.633c17.64 1.365 35.66-8.964 46.64-22.262" />
    </svg>
  )
}
