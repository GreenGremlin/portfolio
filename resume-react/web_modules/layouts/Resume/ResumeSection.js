import React, { PropTypes } from 'react'

export default function ResumeSection({ items }) {
  return (
    <div className="resume-description">
      {items && items.map((item, i) =>
        <p key={i}>{item}</p>
      )}
    </div>
  )
}

ResumeSection.propTypes = {
  items: PropTypes.array,
}

ResumeSection.displayName = 'ResumeSection'
