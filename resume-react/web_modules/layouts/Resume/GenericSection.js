import React, { PropTypes } from 'react'

import ResumeSection from './ResumeSection'
import ResumeExpertise from './ResumeExpertise'
import ResumeTimelineItem from './ResumeTimelineItem'

import styles from './index.less'

const RESUME_LAYOUTS = {
  ResumeSection,
  ResumeExpertise,
  ResumeTimelineItem,
}

export default function GenericSection({ data, section }) {
  const Section = RESUME_LAYOUTS[section.layout]
  let sectionData = section.dataKey ? data[section.dataKey] : data
  if (Array.isArray(sectionData)) {
    sectionData = { items: sectionData }
  }

  return (
    <div className={styles['resume-content']}>
      <h3 className={styles['section-title']}>{section.title}</h3>
      {Section &&
        <Section
          {...sectionData}
        />
      }
    </div>
  )
}

GenericSection.propTypes = {
  data: PropTypes.object,
  section: PropTypes.shape({
    dataKey: PropTypes.string,
  }),
}

GenericSection.displayName = 'GenericSection'
