import React, { PropTypes } from 'react'

const DATE_RE =
  /^(\d{4})(?:[\/\-]([012]?[1-9]))?(?:[\/\-](0?[1-9]|[12][0-9]|3[01]))?/

function getMonthAndYear(value) {
  const dateMatch = value.match(DATE_RE)
  return {
    year: parseInt(dateMatch[1], 10),
    month: parseInt(dateMatch[2], 10),
    day: parseInt(dateMatch[3], 10),
  }
}

function getTimespan(start, end) {
  let years = end.year - start.year
  let months = end.month - start.month

  if (months < 0 && years > 0) {
    years -= 1
    months += 12
  }
  return { years, months }
}

export default function TimeSpan({
  startDate, endDate, className, spanInfo, infoClassName,
}) {
  const now = new Date()
  const start = getMonthAndYear(startDate)
  const end = getMonthAndYear(
    endDate || `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  )
  const { years, months } = getTimespan(start, end)
  let spanText = ''

  if (spanInfo) {
    spanText = spanInfo
  }
  else if (!endDate) {
    spanText = `${start.month ? `${start.month}/` : ''}${start.year} - present`
  }
  else if (years < 2 && start.month && end.month) {
    spanText = `${start.month}/${start.year}`
    if (start.month !== end.month || start.year !== end.year) {
      spanText += ` - ${end.month}/${end.year}`
    }
  }
  else if (start.year === end.year) {
    spanText = `${start.year}`
  }
  else {
    spanText = `${start.year} - ${end.year}`
  }

  return (
    <h5 className={className}>
      {spanText}
      <span className={infoClassName}>
        {[
          ...(years > 0 ? [
            `${years} years`,
          ] : []),
          ...(months > 0 ? [
            `${months} months`,
          ] : []),
        ].join(' ')}
      </span>
    </h5>
  )
}

TimeSpan.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  className: PropTypes.string,
  infoClassName: PropTypes.string,
  spanInfo: PropTypes.string,
}

TimeSpan.defaultProps = {
  className: 'chronological-dates',
  infoClassName: 'time-length',
}
