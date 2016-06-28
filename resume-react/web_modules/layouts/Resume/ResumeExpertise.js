import React, { PropTypes } from 'react'

import styles from './index.less'

export default function ResumeExpertise({ items: categories }) {
  const categoryClasses = [
    styles['resume-description'],
    styles['inline-list'],
  ].join(' ')
  return (
    <div className="resume-description">
      {categories && categories.map(({ category, items }, i) =>
        <div className={styles['resume-content']} key={i}>
          <h4 className={styles['sub-section-title']}>{category}</h4>
          <ul className={categoryClasses}>
            {items.map((item, j) =>
              <li key={j} className={styles['inline-list__item']}>{item}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

ResumeExpertise.displayName = 'ResumeExpertise'

ResumeExpertise.propTypes = {
  items: PropTypes.array,
}
