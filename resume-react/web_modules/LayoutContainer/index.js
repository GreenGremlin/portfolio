import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'

import Header from '../Header'
import Footer from '../Footer'

import './reset.global.css'
import './index.global.less'
import './hightlightjs.global.css'
import styles from './index.less'

// Todo: move this elsewhere
function generateFontUrl(...fonts) {
  const BASE_FONT_URL = 'http://fonts.googleapis.com/css?family='
  const joinVariants = (fontFamily, variants) =>
    `${fontFamily}:${variants.join(',')}`
  const fontPath = fonts.map(font =>
    typeof font === 'string' ? font : joinVariants(...font)
  ).join('|')
  return `${BASE_FONT_URL}${fontPath}`
}

// Muli|Open+Sans:400italic,600italic,600,400|Varela+Round|Enriqueta
const fontUrl = generateFontUrl(
  'Muli', 'Varela+Round', 'Enriqueta',
  ['Open+Sans', ['400italic', '600italic', '600', '400']],
)

const PHENOMIC_ATTRIBUTION =
  `${process.env.PHENOMIC_NAME } ${ process.env.PHENOMIC_VERSION }`

export default function Layout(props, context) {
  const {
    pkg,
  } = context.metadata

  return (
    <div className={styles.layout}>
      <Helmet
        meta={[
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { name: 'generator', content: PHENOMIC_ATTRIBUTION },
          ...(pkg.name ? [
            { property: 'og:site_name', content: pkg.name },
          ] : []),
          ...(pkg.twitter ? [
            { name: 'twitter:site', content: `@${ pkg.twitter }` },
          ] : []),
        ]}
        script={[
          { src: 'https://cdn.polyfill.io/v2/polyfill.min.js' },
        ]}
        link={[
          { href: fontUrl, rel: 'stylesheet', type: 'text/css' },
        ]}
      />

      <style>{"@-ms-viewport { width: device-width; }"}</style>

      <Header />
      <div className={styles.content}>
        {props.children}
      </div>
      <Footer />
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
}

Layout.contextTypes = {
  metadata: PropTypes.object.isRequired,
}
