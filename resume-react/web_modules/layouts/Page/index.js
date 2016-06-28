import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import invariant from 'invariant'
import { BodyContainer, joinUri } from 'phenomic'

import styles from './index.less'

export default function Page(props, context) {
  const {
    pkg,
  } = context.metadata

  const {
    __filename,
    __url,
    head,
    body,
    header,
    footer,
  } = props

  invariant(
    typeof head.title === 'string',
    `Your page '${ __filename }' needs a title`
  )

  const metaTitle = head.metaTitle ? head.metaTitle : head.title

  const meta = [
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: metaTitle },
    {
      property: 'og:url',
      content: joinUri(process.env.PHENOMIC_USER_URL, __url),
    },
    { property: 'og:description', content: head.description },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: metaTitle },
    { name: 'twitter:creator', content: `@${ pkg.twitter }` },
    { name: 'twitter:description', content: head.description },
    { name: 'description', content: head.description },
  ]
  let headClasses = styles['header-section']
  let headLinksClasses = [
    styles['header-section'],
    styles['header-right'],
    styles['header-contact-info'],
    ...(head.links ? [
      styles['header-left'],
    ] : []),
  ].join(' ')

  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={meta}
      />

      <header className={styles['page-header']}>
        {(head.title || head.subtitle) &&
          <div className={headClasses}>
            {head.title &&
              <h1>{head.title}</h1>
            }
            {head.subtitle &&
              <h2>{head.subtitle}</h2>
            }
          </div>
        }
        {head.links &&
          <div className={headLinksClasses}>
            {head.links}
          </div>
        }
      </header>

      {header}
      <BodyContainer>{body}</BodyContainer>
      {props.children}
      {footer}
    </div>
  )
}

Page.propTypes = {
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  __filename: PropTypes.string.isRequired,
  __url: PropTypes.string.isRequired,
  head: PropTypes.object.isRequired,
  body: PropTypes.string.isRequired,
  header: PropTypes.element,
  footer: PropTypes.element,
}

Page.contextTypes = {
  metadata: PropTypes.object.isRequired,
}
