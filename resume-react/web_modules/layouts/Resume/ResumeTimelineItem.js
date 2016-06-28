import React, { PropTypes } from 'react'

import TimeSpan from './TimeSpan'

import styles from './index.less'

export default function ResumeExperienceTimeline({ items }) {

  return (
    <ul className={styles['chronological-list']}>
      {items && items.map((item, i) => {
        const companyOrSchool = item.company || item.school
        return (
          <li className={styles['chronological-item']} key={i}>
            {item.title &&
              <h4 className={styles['chronological-title']}>
                {item.title}
                {companyOrSchool &&
                  <span className={styles[item.company ? 'company' : 'school']}>
                    {companyOrSchool}
                    {item.location ? ` - ${item.location}` : ''}
                  </span>
                }

              </h4>
            }

            <TimeSpan
              startDate={item.startDate}
              endDate={item.endDate}
              className={styles['chronological-dates']}
              infoClassName={styles['time-length']}
            />

            <div className={styles['chronological-description']}>
              {item.titles && item.titles.map((title, j) =>
                <h5 key={j}>{title}</h5>
              )}

              {item.description &&
                <p>{item.description}</p>
              }

              {item.expertise &&
                <p>
                  <span className={styles['inline-header']}>
                    Related expertise:
                  </span>
                  &nbsp;
                  <span className={styles['inline-list']}>
                    {item.expertise.join(', ')}
                  </span>
                </p>
              }

              {item.projects &&
                <p>
                  <span className={styles['inline-header']}>Key projects:</span>
                  &nbsp;
                  <span className={styles['inline-list']}>
                    {item.projects.join(', ')}
                  </span>
                </p>
              }
            </div>
          </li>
        )}
      )}
    </ul>
  )
}

ResumeExperienceTimeline.propTypes = {
  items: PropTypes.array,
}

ResumeExperienceTimeline.displayName = 'ResumeExperienceTimeline'
