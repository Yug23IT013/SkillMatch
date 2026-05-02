'use client'

export default function JobCard({ job, matchScore, matchedSkills = [], missingSkills = [], onApply, onView }) {
  const typeColors = {
    internship: 'bg-blue-50 text-blue-700',
    'full-time': 'bg-green-50 text-green-700',
    'part-time': 'bg-yellow-50 text-yellow-700',
    contract: 'bg-purple-50 text-purple-700'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-500'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-bold text-sm">{job.company?.[0]}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.company}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
                {job.type}
              </span>
              <span className="text-xs text-gray-400">📍 {job.location}</span>
              {job.isRemote && <span className="text-xs text-green-600">🌐 Remote</span>}
            </div>
          </div>
        </div>
        {matchScore !== undefined && (
          <div className={`flex-shrink-0 border rounded-xl px-3 py-2 text-center ${getScoreBg(matchScore)}`}>
            <p className={`text-xl font-bold ${getScoreColor(matchScore)}`}>{matchScore}%</p>
            <p className="text-xs text-gray-500">Match</p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

      {matchedSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Matched Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.slice(0, 4).map(s => (
              <span key={s} className="badge-matched">✓ {s}</span>
            ))}
          </div>
        </div>
      )}

      {missingSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-1.5">Missing Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.slice(0, 3).map(s => (
              <span key={s} className="badge-missing">⚠ {s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {job.stipend || job.salary || 'Compensation not specified'}
        </span>
        <div className="flex gap-2">
          {onView && (
            <button onClick={() => onView(job)} className="btn-secondary text-xs py-1.5 px-3">View</button>
          )}
          {onApply && (
            <button onClick={() => onApply(job)} className="btn-primary text-xs py-1.5 px-3">Apply</button>
          )}
        </div>
      </div>
    </div>
  )
}
