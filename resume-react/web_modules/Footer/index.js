import React from 'react'

import styles from './index.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <a
        href={process.env.PHENOMIC_HOMEPAGE}
        className={styles.link}
      >
        {"Powered by "}
        <span className={styles.reference}>
          {`<${ process.env.PHENOMIC_NAME} />`}
        </span>
      </a>
      <br />
      <a href="https://facebook.github.io/react/" className={styles.link}>
        Built with
        <img
          className={styles.reference}
          alt="React"
          src="assets/react.svg"
          width="16"
          height="16"
        />
        React
      </a>.
    </footer>
  )
}
