import React, { PropTypes } from 'react'

import Page from '../Page'

import GenericSection from './GenericSection'

export default function Resume(props) {
  const { head } = props
  const {
    name,
    title,
    email,
    // website,
    phone,
    linkedIn,
    github,
    sections,
  } = head

  return (
    <Page
      { ...props}
      head={{
        ...props.head,
        title: name,
        subtitle: title,
        links: [
          ...[
            email ? [
              <a
                key={1}
                href={`mailto:${email}`}
                data-label={email}
              >email</a>,
            ] : [],
          ],
          ...[
            phone ? [
              <a
                key={2}
                href={`tel:+${phone}`}
                data-label={phone}
              >{phone}</a>,
            ] : [],
          ],
          /* ...[
            website ? [
              <a href={website}
                key={3}
              >
                Website
              </a>,
            ] : [],
          ], */
          ...[
            linkedIn ? [
              <a
                key={4}
                href="//www.linkedin.com/in/{linkedIn}"
                target="_blank"
                data-label="linkedin.com/in/{linkedIn}"
              >LinkedIn</a>,
            ] : [],
          ],
          ...[
            github ? [
              <a
                key={5}
                href="//github.com/{github}"
                target="_blank"
                data-label="github.com/{github}"
              >GitHub</a>,
            ] : [],
          ],
        ],
      }}
    >
      {sections.map((section, i) =>
        <GenericSection section={section} data={head} key={i} />
      )}
    </Page>
  )
}

Resume.propTypes = {
  head: PropTypes.object.isRequired,
}

Resume.displayName = 'Resume'
