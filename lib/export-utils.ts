/**
 * Export Utility for Syllabus Documents
 * Generates formatted Word (.doc) and PDF/HTML files for client-side download.
 */

export function exportSyllabusToWord(syllabus: any) {
  if (!syllabus) return

  const title = syllabus.title || 'Academic_Syllabus'
  const fileName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`

  let htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Calibri', 'Arial', sans-serif; margin: 25px; color: #1e293b; line-height: 1.5; }
        h1 { color: #0f172a; font-size: 22pt; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 12px; }
        h2 { color: #1e40af; font-size: 14pt; margin-top: 18px; margin-bottom: 8px; }
        h3 { color: #334155; font-size: 12pt; margin-top: 12px; margin-bottom: 6px; }
        .meta-bar { background-color: #f1f5f9; padding: 10px; border-radius: 6px; font-size: 10pt; margin-bottom: 15px; }
        .badge { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10pt; text-align: left; vertical-align: top; }
        th { background-color: #f8fafc; font-weight: bold; color: #0f172a; }
        ul { margin-top: 5px; margin-bottom: 10px; padding-left: 20px; }
        li { font-size: 10pt; margin-bottom: 4px; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      
      <div class="meta-bar">
        <strong>CEFR Level:</strong> ${syllabus.cefr || 'B1'} &nbsp;|&nbsp;
        <strong>Duration:</strong> ${syllabus.duration || 'N/A'} &nbsp;|&nbsp;
        <strong>Context/Theme:</strong> ${syllabus.theme || syllabus.topic || 'General Context'}
      </div>
  `

  // Objectives Section
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
              <th style="width: 25%;">Session</th>
              <th style="width: 35%;">Topic & Focus</th>
              <th style="width: 40%;">Learning Objective</th>
            </tr>
          </thead>
          <tbody>
            ${(w.days || []).map((d: any) => `
              <tr>
                <td><strong>${d.day}</strong></td>
                <td>${d.topic}</td>
                <td>${d.objective}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
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
        <p style="font-size: 10pt; background: #f8fafc; padding: 10px; border-left: 4px solid #2563eb;">
          ${syllabus.homework}
        </p>
      `
    }
  }

  htmlContent += `
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

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 10px; }
        h1 { font-size: 20px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-bottom: 12px; }
        h2 { font-size: 14px; font-weight: 700; color: #1e40af; margin-top: 16px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; font-size: 12px; display: flex; gap: 15px; }
        .meta-item { font-weight: 600; color: #475569; }
        .meta-item span { color: #0f172a; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 16px; }
        th, td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 11px; text-align: left; }
        th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
        ul { margin: 6px 0; padding-left: 18px; }
        li { font-size: 11px; margin-bottom: 4px; color: #334155; }
        .week-card { border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 12px; overflow: hidden; page-break-inside: avoid; }
        .week-header { background: #f8fafc; padding: 8px 12px; font-weight: 700; font-size: 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a; }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>

      <div class="meta-box">
        <div class="meta-item">CEFR Benchmark: <span>${syllabus.cefr || 'B1'}</span></div>
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
    htmlContent += `<h2>12-Week Syllabus Roadmap</h2>`
    
    weeksList.forEach((w: any) => {
      htmlContent += `
        <div class="week-card">
          <div class="week-header">${w.title || `Week ${w.weekNum}`}</div>
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Session</th>
                <th style="width: 35%;">Topic & Focus</th>
                <th style="width: 40%;">Objective</th>
              </tr>
            </thead>
            <tbody>
              ${(w.days || []).map((d: any) => `
                <tr>
                  <td><strong>${d.day}</strong></td>
                  <td>${d.topic}</td>
                  <td>${d.objective}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    })
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
