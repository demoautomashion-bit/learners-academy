/**
 * Export Utility for Syllabus Documents
 * Generates formatted Word (.doc) and PDF/HTML files for client-side download.
 * Embeds official academy branding, logo, and a top preview navigation bar.
 */

export function exportSyllabusToWord(syllabus: any) {
  if (!syllabus) return

  const title = syllabus.title || 'Academic_Syllabus'
  const fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const serialId = `TLA-SYL-${Math.floor(100000 + Math.random() * 900000)}`

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 25px; color: #0f172a; line-height: 1.5; }
        .academy-header { border-bottom: 3px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
        .academy-title { color: #1e3a8a; font-size: 20pt; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .academy-subtitle { color: #475569; font-size: 9.5pt; text-transform: uppercase; letter-spacing: 1px; margin-top: 3px; font-weight: bold; }
        .doc-title { font-size: 16pt; font-weight: bold; color: #0f172a; margin-top: 15px; margin-bottom: 8px; }
        .meta-bar { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 14px; border-radius: 6px; font-size: 9.5pt; margin-bottom: 20px; }
        .meta-item { display: inline-block; margin-right: 20px; color: #334155; }
        .badge { background-color: #1e3a8a; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
        h2 { color: #1e3a8a; font-size: 13pt; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        h3 { color: #334155; font-size: 11pt; margin-top: 14px; margin-bottom: 6px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 16px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 9.5pt; text-align: left; vertical-align: top; }
        th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
        ul { margin-top: 5px; margin-bottom: 10px; padding-left: 20px; }
        li { font-size: 9.5pt; margin-bottom: 4px; color: #334155; }
        .footer-clause { margin-top: 30px; border-t: 1px solid #cbd5e1; pt: 10px; font-size: 8pt; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="academy-header">
        <table style="width: 100%; border: none;">
          <tr>
            <td style="border: none; padding: 0;">
              <div class="academy-title">The Learners Academy</div>
              <div class="academy-subtitle">Premium English Language Education & Academic Curricula</div>
            </td>
            <td style="border: none; padding: 0; text-align: right; font-size: 9pt; color: #64748b;">
              <strong>SERIAL:</strong> ${serialId}<br>
              <strong>DATE:</strong> ${dateStr}
            </td>
          </tr>
        </table>
      </div>

      <div class="doc-title">${title}</div>
      
      <div class="meta-bar">
        <span class="meta-item"><strong>CEFR Benchmark:</strong> <span class="badge">${syllabus.cefr || 'B1'}</span></span>
        <span class="meta-item"><strong>Duration:</strong> ${syllabus.duration || 'N/A'}</span>
        <span class="meta-item"><strong>Context / Theme:</strong> ${syllabus.theme || syllabus.topic || 'General Context'}</span>
      </div>
  `

  // Learning Objectives
  if (syllabus.objectives && syllabus.objectives.length > 0) {
    htmlContent += `
      <h2>Learning Objectives</h2>
      <ul>
        ${syllabus.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
      </ul>
    `
  }

  // 12-Week Term Roadmap View
  if (syllabus.isTerm || syllabus.weeks || syllabus.scope === 'term') {
    const weeksList = syllabus.weeks || []
    htmlContent += `<h2>12-Week Course Syllabus Roadmap</h2>`
    
    weeksList.forEach((w: any) => {
      htmlContent += `
        <h3>${w.title || `Week ${w.weekNum}`}</h3>
        <table>
          <thead>
            <tr>
              <th style="width: 18%;">Session</th>
              <th style="width: 24%;">Topic & Grammar Sub-Rule</th>
              <th style="width: 20%;">Target Vocabulary</th>
              <th style="width: 23%;">Classroom Activity</th>
              <th style="width: 15%;">Unit Ref</th>
            </tr>
          </thead>
          <tbody>
            ${(w.days || []).map((d: any) => `
              <tr>
                <td><strong>${d.day}</strong><br><span style="font-size: 8pt; color: #1e3a8a;">${d.type || ''}</span></td>
                <td><strong>${d.topic}</strong><br><span style="font-size: 8.5pt; color: #475569;">${d.grammarFocus || d.objective}</span></td>
                <td><span style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 8.5pt;">${(d.vocabList || []).join(', ') || 'N/A'}</span></td>
                <td><strong>${d.activityType || 'Activity'}</strong><br><span style="font-size: 8.5pt; color: #334155;">${d.activityDetail || d.objective}</span></td>
                <td><span style="font-size: 8.5pt; font-weight: bold;">${d.unitRef || 'Unit Main'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    })

    // Teacher's Daily Guidebook (Micro Session Plans)
    htmlContent += `
      <br/><hr/><br/>
      <h2>Teacher's Daily Guidebook (Micro Session Plans)</h2>
      <p style="font-size: 9.5pt; color: #475569; margin-bottom: 15px;">Detailed daily lesson execution cards for classroom management, concept check questions (CCQs), and timeline breakdown.</p>
    `

    weeksList.forEach((w: any) => {
      (w.days || []).forEach((d: any) => {
        htmlContent += `
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 15px; background: #fafafa;">
            <h3 style="color: #1e3a8a; margin-top: 0; margin-bottom: 4px; font-size: 11pt;">${d.day}: ${d.topic}</h3>
            <p style="margin: 0 0 8px 0; font-size: 9pt;"><strong>Grammar Sub-Rule:</strong> ${d.grammarFocus || d.objective}</p>
            ${d.grammarScopeLimit ? `<p style="margin: 0 0 8px 0; font-size: 8.5pt; color: #b45309; background: #fef3c7; padding: 4px 8px; border-radius: 4px;"><strong>Grammar Scope Limit (How much to teach today):</strong> ${d.grammarScopeLimit}</p>` : ''}
            ${d.boardLayout ? `<p style="margin: 0 0 8px 0; font-size: 8.5pt; color: #1e3a8a; background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-family: monospace;"><strong>Whiteboard Formula / Layout:</strong> ${d.boardLayout}</p>` : ''}
            <p style="margin: 0 0 8px 0; font-size: 9pt;"><strong>Target Vocabulary:</strong> ${(d.vocabList || []).join(', ')} | <strong>Curriculum Unit:</strong> ${d.unitRef || 'Standard Unit'}</p>
            
            ${d.discussionTopics && d.discussionTopics.length > 0 ? `
              <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                <strong>🗣️ CEFR Discussion & Debate Topics:</strong>
                ${d.discussionTopics.map((dt: any) => `<div style="margin-top: 3px;"><strong>Topic:</strong> ${dt.topic} — <em>"${dt.prompt}"</em></div>`).join('')}
                ${d.functionalPhrases ? `<div style="margin-top: 4px;"><strong>Functional Speaking Phrases to Practice:</strong> ${d.functionalPhrases.join(' | ')}</div>` : ''}
              </div>
            ` : ''}

            ${d.activityGame ? `
              <div style="background: #fdf4ff; border-left: 3px solid #c026d3; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                <strong>🎮 Classroom Fluency Game: ${d.activityGame.gameName}</strong>
                <div><strong>Materials Needed:</strong> ${d.activityGame.materials.join(', ')}</div>
                <div><strong>Rules:</strong> ${d.activityGame.rules.join(' ')}</div>
                <div><strong>Scoring System:</strong> ${d.activityGame.scoring}</div>
              </div>
            ` : ''}

            ${d.readingPassage ? `
              <div style="background: #fffbeb; border-left: 3px solid #d97706; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                <strong>📖 Book Reading: ${d.readingPassage.passageTitle}</strong>
                <div><strong>Reading Strategy Focus:</strong> ${d.readingPassage.readingStrategy}</div>
                <div><strong>Comprehension Questions:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.readingPassage.comprehensionQuestions.map((cq: string) => `<li>${cq}</li>`).join('')}
                  </ul>
                </div>
              </div>
            ` : ''}

            ${d.ccqs && d.ccqs.length > 0 ? `
              <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                <strong>Concept Check Questions (CCQs):</strong>
                <ul style="margin: 3px 0 0 0; padding-left: 15px;">
                  ${d.ccqs.map((q: string) => `<li>${q}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${d.phases && d.phases.length > 0 ? `
              <table style="width: 100%; font-size: 8.5pt; border-collapse: collapse; margin-top: 6px;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="width: 25%; padding: 4px;">Phase</th>
                    <th style="width: 15%; padding: 4px;">Time</th>
                    <th style="width: 60%; padding: 4px;">Activity & Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${d.phases.map((p: any) => `
                    <tr>
                      <td style="padding: 4px;"><strong>${p.phase}</strong></td>
                      <td style="padding: 4px;">${p.time}</td>
                      <td style="padding: 4px;"><strong>${p.activity}:</strong> ${p.instructions}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `
      })
    })
  } else {
    // Single Session Timeline View
    if (syllabus.timeline && syllabus.timeline.length > 0) {
      htmlContent += `
        <h2>Lesson Plan Timeline</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Phase</th>
              <th style="width: 15%;">Time</th>
              <th style="width: 30%;">Activity</th>
              <th style="width: 30%;">Teacher Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${syllabus.timeline.map((step: any) => `
              <tr>
                <td><strong>${step.phase}</strong></td>
                <td>${step.time}</td>
                <td>${step.activity}</td>
                <td>${step.instructions}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }

    // Homework Section
    if (syllabus.homework) {
      htmlContent += `
        <h2>Homework & Independent Application</h2>
        <p style="font-size: 9.5pt; background: #f8fafc; padding: 10px; border-left: 4px solid #1e3a8a;">
          ${syllabus.homework}
        </p>
      `
    }
  }

  htmlContent += `
      <div class="footer-clause">
        The Learners Academy — Official Academic Syllabus Document & Official Curriculum Record
      </div>
    </body>
    </html>
  `

  const blob = new Blob(['\ufeff' + htmlContent], {
    type: 'application/msword'
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportSyllabusToPDF(syllabus: any) {
  if (!syllabus) return

  const title = syllabus.title || 'Academic_Syllabus'
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const serialId = `TLA-SYL-${Math.floor(100000 + Math.random() * 900000)}`

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - The Learners Academy</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.5; margin: 0; padding: 0; background-color: #f8fafc; }
        
        /* Sticky Top Preview Navigation Bar (Hidden during print) */
        .preview-nav-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: #0f172a;
          color: #ffffff;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: system-ui, -apple-system, sans-serif;
        }
        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .nav-btn-back {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .nav-btn-back:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        .nav-btn-print {
          background: #2563eb;
          color: #ffffff;
        }
        .nav-btn-print:hover {
          background: #1d4ed8;
        }

        /* Printable Document Sheet Container */
        .page-container {
          max-w: 800px;
          margin: 24px auto;
          background: #ffffff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        /* Header Block */
        .academy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #1e3a8a;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo-img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 50%;
        }
        .academy-info h1 {
          font-size: 22px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .academy-info p {
          font-size: 11px;
          color: #64748b;
          margin: 2px 0 0 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .header-meta {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        .header-meta strong {
          color: #0f172a;
        }

        /* Content Styling */
        .doc-title {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 14px;
          line-height: 1.3;
        }
        .meta-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 24px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .meta-item {
          font-weight: 600;
          color: #475569;
        }
        .meta-item span {
          color: #0f172a;
          font-weight: 700;
        }
        .cefr-badge {
          background: #1e3a8a;
          color: #ffffff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
        }
        h2 {
          font-size: 13px;
          font-weight: 700;
          color: #1e3a8a;
          margin-top: 24px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          font-size: 11px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background: #f1f5f9;
          font-weight: 700;
          color: #0f172a;
        }
        ul {
          margin: 8px 0;
          padding-left: 20px;
        }
        li {
          font-size: 12px;
          margin-bottom: 6px;
          color: #334155;
        }
        .week-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 16px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .week-header {
          background: #f8fafc;
          padding: 10px 14px;
          font-weight: 700;
          font-size: 12px;
          border-bottom: 1px solid #e2e8f0;
          color: #0f172a;
        }
        .footer-watermark {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Print Media Query */
        @media print {
          body { background: #ffffff; }
          .no-print { display: none !important; }
          .page-container {
            max-width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <!-- Top Sticky Preview Navigation Bar -->
      <div class="preview-nav-bar no-print">
        <div style="display: flex; items-center; gap: 10px;">
          <button class="nav-btn nav-btn-back" onclick="if(window.opener){window.close();}else{window.history.back();}">
            ← Back to Teacher Portal
          </button>
        </div>
        <div style="font-size: 13px; font-weight: 600; color: #94a3b8;">
          Document Preview
        </div>
        <button class="nav-btn nav-btn-print" onclick="window.print();">
          🖨️ Commit to Print / Save PDF
        </button>
      </div>

      <div class="page-container">
        <!-- Official Academy Header -->
        <div class="academy-header">
          <div class="logo-box">
            <img src="/images/logo.png" alt="Logo" class="logo-img" onerror="this.style.display='none';" />
            <div class="academy-info">
              <h1>The Learners Academy</h1>
              <p>Premium English Language Education & Academic Curricula</p>
            </div>
          </div>
          <div class="header-meta">
            <div>SERIAL: <strong>${serialId}</strong></div>
            <div>DATE: <strong>${dateStr}</strong></div>
          </div>
        </div>

        <div class="doc-title">${title}</div>

        <div class="meta-box">
          <div class="meta-item">CEFR Benchmark: <span class="cefr-badge">${syllabus.cefr || 'B1'}</span></div>
          <div class="meta-item">Duration: <span>${syllabus.duration || 'N/A'}</span></div>
          <div class="meta-item">Theme Context: <span>${syllabus.theme || syllabus.topic || 'General Context'}</span></div>
        </div>
  `

  // Objectives
  if (syllabus.objectives && syllabus.objectives.length > 0) {
    htmlContent += `
      <h2>Learning Objectives</h2>
      <ul>
        ${syllabus.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}
      </ul>
    `
  }

  // Roadmap (Term)
  if (syllabus.isTerm || syllabus.weeks || syllabus.scope === 'term') {
    const weeksList = syllabus.weeks || []
    htmlContent += `<h2>12-Week Course Syllabus Roadmap</h2>`
    
    weeksList.forEach((w: any) => {
      htmlContent += `
        <div class="week-card">
          <div class="week-header">${w.title || `Week ${w.weekNum}`}</div>
          <table>
            <thead>
              <tr>
                <th style="width: 18%;">Session</th>
                <th style="width: 25%;">Topic & Grammar Sub-Rule</th>
                <th style="width: 20%;">Target Vocabulary</th>
                <th style="width: 23%;">Classroom Activity</th>
                <th style="width: 14%;">Unit Ref</th>
              </tr>
            </thead>
            <tbody>
              ${(w.days || []).map((d: any) => `
                <tr>
                  <td><strong>${d.day}</strong><br/><span style="font-size: 9px; color: #1e3a8a;">${d.type || ''}</span></td>
                  <td><strong>${d.topic}</strong><br/><span style="font-size: 10px; color: #475569;">${d.grammarFocus || d.objective}</span></td>
                  <td><span style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 10px;">${(d.vocabList || []).join(', ') || 'N/A'}</span></td>
                  <td><strong>${d.activityType || 'Activity'}</strong><br/><span style="font-size: 10px; color: #334155;">${d.activityDetail || d.objective}</span></td>
                  <td><span style="font-size: 10px; font-weight: bold;">${d.unitRef || 'Unit Main'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    })

    // Teacher's Daily Guidebook Cards in PDF
    htmlContent += `
      <div style="page-break-before: always;">
        <h2>Teacher's Daily Guidebook (Micro Session Plans)</h2>
        <p style="font-size: 11px; color: #475569; margin-bottom: 16px;">Detailed daily lesson execution cards for classroom management, concept check questions (CCQs), and timeline breakdown.</p>
    `

    weeksList.forEach((w: any) => {
      (w.days || []).forEach((d: any) => {
        htmlContent += `
          <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px; background: #ffffff; page-break-inside: avoid;">
            <div style="display: flex; align-items: center; justify-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
              <h3 style="color: #1e3a8a; margin: 0; font-size: 13px;">${d.day}: ${d.topic}</h3>
              <span style="font-size: 10px; font-weight: bold; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${d.unitRef || 'Standard Unit'}</span>
            </div>
            
            <div style="font-size: 11px; color: #334155; margin-bottom: 8px;">
              <strong>Grammar Sub-Rule:</strong> ${d.grammarFocus || d.objective}
            </div>

            ${d.grammarScopeLimit ? `
              <div style="font-size: 10.5px; color: #92400e; background: #fef3c7; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px;">
                <strong>Grammar Scope Limit (How much to teach today):</strong> ${d.grammarScopeLimit}
              </div>
            ` : ''}

            ${d.boardLayout ? `
              <div style="font-size: 10.5px; color: #1e3a8a; background: #e0e7ff; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-family: monospace;">
                <strong>Whiteboard Formula / Layout:</strong> ${d.boardLayout}
              </div>
            ` : ''}

            <div style="font-size: 11px; color: #334155; margin-bottom: 10px;">
              <strong>Target Vocabulary:</strong> <span style="color: #1e3a8a; font-weight: 600;">${(d.vocabList || []).join(', ')}</span>
            </div>

            ${d.discussionTopics && d.discussionTopics.length > 0 ? `
              <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; font-size: 10.5px;">
                <strong style="color: #15803d;">🗣️ CEFR Discussion & Debate Topics:</strong>
                ${d.discussionTopics.map((dt: any) => `<div style="margin-top: 4px;"><strong>Topic:</strong> ${dt.topic} — <em>"${dt.prompt}"</em></div>`).join('')}
                ${d.functionalPhrases ? `<div style="margin-top: 6px;"><strong>Functional Speaking Phrases to Practice:</strong> ${d.functionalPhrases.join(' | ')}</div>` : ''}
              </div>
            ` : ''}

            ${d.activityGame ? `
              <div style="background: #fdf4ff; border-left: 3px solid #c026d3; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; font-size: 10.5px;">
                <strong style="color: #a21caf;">🎮 Classroom Fluency Game: ${d.activityGame.gameName}</strong>
                <div style="margin-top: 4px;"><strong>Materials Needed:</strong> ${d.activityGame.materials.join(', ')}</div>
                <div style="margin-top: 2px;"><strong>Rules:</strong> ${d.activityGame.rules.join(' ')}</div>
                <div style="margin-top: 2px;"><strong>Scoring System:</strong> ${d.activityGame.scoring}</div>
              </div>
            ` : ''}

            ${d.readingPassage ? `
              <div style="background: #fffbeb; border-left: 3px solid #d97706; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; font-size: 10.5px;">
                <strong style="color: #b45309;">📖 Book Reading: ${d.readingPassage.passageTitle}</strong>
                <div style="margin-top: 4px;"><strong>Reading Strategy Focus:</strong> ${d.readingPassage.readingStrategy}</div>
                <div style="margin-top: 4px;"><strong>Comprehension Questions:</strong>
                  <ul style="margin: 4px 0 0 0; padding-left: 16px;">
                    ${d.readingPassage.comprehensionQuestions.map((cq: string) => `<li>${cq}</li>`).join('')}
                  </ul>
                </div>
              </div>
            ` : ''}

            ${d.ccqs && d.ccqs.length > 0 ? `
              <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px; font-size: 10.5px;">
                <strong style="color: #1e3a8a;">Concept Check Questions (CCQs):</strong>
                <ul style="margin: 4px 0 0 0; padding-left: 16px; color: #1e293b;">
                  ${d.ccqs.map((q: string) => `<li>${q}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${d.phases && d.phases.length > 0 ? `
              <table style="width: 100%; font-size: 10px; border-collapse: collapse; margin-top: 6px;">
                <thead>
                  <tr style="background: #f8fafc;">
                    <th style="width: 25%; padding: 6px; border: 1px solid #e2e8f0;">Phase</th>
                    <th style="width: 15%; padding: 6px; border: 1px solid #e2e8f0;">Time</th>
                    <th style="width: 60%; padding: 6px; border: 1px solid #e2e8f0;">Activity & Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${d.phases.map((p: any) => `
                    <tr>
                      <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>${p.phase}</strong></td>
                      <td style="padding: 6px; border: 1px solid #e2e8f0;">${p.time}</td>
                      <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>${p.activity}:</strong> ${p.instructions}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `
      })
    })

    htmlContent += `</div>`
  } else {
    // Single Session Timeline
    if (syllabus.timeline && syllabus.timeline.length > 0) {
      htmlContent += `
        <h2>Lesson Plan Timeline</h2>
        <table>
          <thead>
            <tr>
              <th style="width: 25%;">Phase</th>
              <th style="width: 15%;">Time</th>
              <th style="width: 30%;">Activity</th>
              <th style="width: 30%;">Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${syllabus.timeline.map((step: any) => `
              <tr>
                <td><strong>${step.phase}</strong></td>
                <td>${step.time}</td>
                <td>${step.activity}</td>
                <td>${step.instructions}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
    }
  }

  htmlContent += `
        <div class="footer-watermark">
          The Learners Academy — Official Academic Syllabus Document & Official Curriculum Record
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
