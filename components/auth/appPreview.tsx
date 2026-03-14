export function AppPreview() {
  return (
    <div className="app-preview-card">
      {/* Header bar */}
      <div className="preview-header">
        <div className="preview-logo">
          <div className="preview-logo-icon" />
          <span className="preview-logo-label">Overlay</span>
        </div>
        <div className="preview-header-actions">
          <div className="preview-dot" />
          <div className="preview-dot" />
        </div>
      </div>

      <div className="preview-body">
        {/* Sidebar */}
        <div className="preview-sidebar">
          <div className="preview-workspace">
            <div className="preview-avatar">W</div>
            <div>
              <div className="preview-workspace-name">John&apos;s workspace</div>
              <div className="preview-workspace-id">#WD12446875</div>
            </div>
          </div>

          {[
            { label: 'Dashboard', active: false },
            { label: 'Leads', active: false },
            { label: 'Opportunities', active: false },
            { label: 'Tasks', active: true },
            { label: 'Reports', active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`preview-nav-item ${item.active ? 'active' : ''}`}
            >
              {item.label}
            </div>
          ))}

          <div className="preview-section-label">Users</div>
          <div className="preview-nav-item">Contacts</div>
          <div className="preview-nav-item preview-badge-item">
            Messages <span className="preview-badge">6</span>
          </div>

          <div className="preview-section-label">Other</div>
          <div className="preview-nav-item">Configuration</div>
          <div className="preview-nav-item">Invoice</div>
        </div>

        {/* Main content */}
        <div className="preview-content">
          <div className="preview-content-header">
            <span className="preview-back">←</span>
            <span className="preview-page-title">Tasks</span>
          </div>

          <div className="preview-search-bar">
            <span className="preview-search-icon">⌕</span>
            <span className="preview-search-text">Search table</span>
            <div className="preview-view-tabs">
              <span className="preview-tab active">List</span>
              <span className="preview-tab">Kanban</span>
              <span className="preview-tab">Calendar</span>
            </div>
          </div>

          {/* Group 1 */}
          <div className="preview-group">
            <div className="preview-group-header">
              <span className="preview-group-dot blue" />
              <span className="preview-group-title">Group 1</span>
            </div>
            <div className="preview-col-headers">
              <span>Title</span>
              <span>Client name</span>
              <span>Priority</span>
              <span>Date</span>
            </div>
            {[
              { title: 'Call about proposal', client: 'Bluestone', priority: 'Urgent', priorityColor: '#E84646', date: '18th Ju' },
              { title: 'Send onboarding docs', client: 'Tech Ltd.', priority: 'High', priorityColor: '#E88A30', date: '17th Ju' },
              { title: 'Follow up with Mira', client: 'Omar Rahman', priority: 'Low', priorityColor: '#3BAD6A', date: '17th Ju', checked: true },
              { title: 'Prepare pitch deck', client: 'Jabed Ali', priority: 'Medium', priorityColor: '#E8BF30', date: '14th Ju' },
            ].map((row) => (
              <div className="preview-row" key={row.title}>
                <div className="preview-row-check">
                  {row.checked ? (
                    <div className="preview-check checked" />
                  ) : (
                    <div className="preview-check" />
                  )}
                  <span className="preview-row-title">{row.title}</span>
                </div>
                <span className="preview-row-client">{row.client}</span>
                <span
                  className="preview-priority-badge"
                  style={{ background: row.priorityColor + '22', color: row.priorityColor }}
                >
                  ⬡ {row.priority}
                </span>
                <span className="preview-row-date">{row.date}</span>
              </div>
            ))}
          </div>

          {/* Group 2 */}
          <div className="preview-group">
            <div className="preview-group-header">
              <span className="preview-group-dot purple" />
              <span className="preview-group-title">Group 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}