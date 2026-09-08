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
    const isSimplified = syllabus.detailLevel === 'simplified'
    const weekCount = weeksList.length || 12
    htmlContent += `<h2>${weekCount}-Week Course Syllabus Roadmap</h2>`
    
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Week / Session</th>
            <th style="width: 32%;">Topic & Grammar Sub-Rule</th>
            <th style="width: 20%;">Target Vocabulary</th>
            <th style="width: 26%;">Classroom Activity</th>
          </tr>
        </thead>
        <tbody>
    `
    weeksList.forEach((w: any) => {
      (w.days || []).forEach((d: any, idx: number) => {
        htmlContent += `
          <tr>
            <td>
              ${idx === 0 ? `<div style="font-weight: bold; color: #1e3a8a; margin-bottom: 2px;">${w.title || `Week ${w.weekNum}`}</div>` : ''}
              <strong>${d.day}</strong><br><span style="font-size: 8pt; color: #475569;">${d.type || ''}</span>
            </td>
            <td><strong>${d.topic}</strong><br><span style="font-size: 8.5pt; color: #475569;">${d.grammarFocus || d.objective}</span></td>
            <td><span style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 8.5pt;">${(d.vocabList && d.vocabList.length > 0) ? d.vocabList.join(', ') : '—'}</span></td>
            <td><strong>${d.activityType || 'Activity'}</strong><br><span style="font-size: 8.5pt; color: #334155;">${d.activityDetail || d.objective}</span></td>
          </tr>
        `
      })
    })
    htmlContent += `
        </tbody>
      </table>
    `

    // Teacher's Daily Guidebook (Micro Session Plans) - Rendered ONLY in Detailed Mode
    if (!isSimplified) {
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
              
              ${d.grammarDefinition ? `
                <div style="background: #f0f9ff; border-left: 3px solid #0284c7; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt; color: #0369a1;">
                  <strong>📘 Academic Definition:</strong> ${d.grammarDefinition}
                </div>
              ` : ''}

              ${d.grammarExplanation ? `
                <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt; color: #14532d;">
                  <strong>📘 In-Depth Concept Explanation:</strong> ${d.grammarExplanation}
                </div>
              ` : ''}

              ${d.explanation_rationale ? `
                <div style="background: #faf5ff; border-left: 3px solid #9333ea; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt; color: #6b21a8;">
                  <strong>💡 Communicative Rationale:</strong> ${d.explanation_rationale}
                </div>
              ` : ''}

              ${d.grammarScopeLimit ? `<p style="margin: 0 0 8px 0; font-size: 8.5pt; color: #b45309; background: #fef3c7; padding: 4px 8px; border-radius: 4px;"><strong>Grammar Scope Limit:</strong> ${d.grammarScopeLimit}</p>` : ''}
              ${d.boardLayout ? `<p style="margin: 0 0 8px 0; font-size: 8.5pt; color: #1e3a8a; background: #e0e7ff; padding: 4px 8px; border-radius: 4px; font-family: monospace;"><strong>Whiteboard Formula:</strong> ${d.boardLayout}</p>` : ''}
              
              ${d.syntaxFormula ? `
                <p style="margin: 0 0 8px 0; font-size: 8.5pt; color: #166534; background: #dcfce7; padding: 4px 8px; border-radius: 4px; font-family: monospace;">
                  <strong>📐 Word Order Blueprint:</strong> ${d.syntaxFormula}
                </p>
              ` : ''}

              ${d.grammarForms ? `
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 8.5pt;">
                  <strong style="color: #1e3a8a;">📐 Sentence Structure Matrix (+ / - / ?):</strong>
                  <div style="margin-top: 4px;"><strong>Positive (+):</strong> ${d.grammarForms.positive}</div>
                  <div style="margin-top: 2px;"><strong>Negative (-):</strong> ${d.grammarForms.negative}</div>
                  <div style="margin-top: 2px;"><strong>Interrogative (?):</strong> ${d.grammarForms.interrogative} <em>(${d.grammarForms.shortAnswers})</em></div>
                </div>
              ` : ''}

              ${d.sentenceModels && d.sentenceModels.length > 0 ? `
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 8.5pt;">
                  <strong style="color: #065f46;">💬 Model Sentence Formation Examples:</strong>
                  <ol style="margin: 2px 0 0 0; padding-left: 18px; color: #064e3b; font-family: monospace;">
                    ${d.sentenceModels.map((sm: string) => `<li>${sm}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}

              ${d.grammarSubSections && d.grammarSubSections.length > 0 ? `
                <div style="background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                  <strong>🎯 Functional Grammar Sub-Sections to Cover:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.grammarSubSections.map((sec: string) => `<li>${sec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.usageCases && d.usageCases.length > 0 ? `
                <div style="background: #f8fafc; border-left: 3px solid #475569; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt;">
                  <strong>📋 When, Why & Context of Usage:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.usageCases.map((uc: string) => `<li>${uc}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.edgeCases && d.edgeCases.length > 0 ? `
                <div style="background: #fef3c7; border-left: 3px solid #d97706; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt; color: #92400e;">
                  <strong>⚠️ Edge Cases & Common Student Pitfalls:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.edgeCases.map((ec: string) => `<li>${ec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.edge_case_syntax && d.edge_case_syntax.length > 0 ? `
                <div style="background: #fef3c7; border-left: 3px solid #b45309; padding: 6px 10px; margin-bottom: 8px; font-size: 8.5pt; color: #92400e;">
                  <strong>⚡ Edge Case Syntax Patterns:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.edge_case_syntax.map((ecs: string) => `<li>${ecs}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.signalWords && d.signalWords.length > 0 ? `
                <p style="margin: 0 0 8px 0; font-size: 8.5pt;"><strong>Key Signal Words & Placement:</strong> ${d.signalWords.join(', ')}</p>
              ` : ''}

              ${(d.vocabulary && d.vocabulary.length > 0) ? `
                <div style="margin-bottom: 8px; font-size: 8.5pt;">
                  <strong>📚 Target Vocabulary:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.vocabulary.map((v: any) => {
                      const pos = v.part_of_speech || v.partOfSpeech ? ` <em>(${v.part_of_speech || v.partOfSpeech})</em>` : ''
                      const def = v.definition || v.def || ''
                      const ex = (v.example_sentences && v.example_sentences.length > 0) ? ` — <em>"${v.example_sentences.join(' / ')}"` : (v.example ? ` — <em>"${v.example}"</em>` : '')
                      return `<li><strong>${v.word}</strong>${pos}: ${def}${ex}</li>`
                    }).join('')}
                  </ul>
                </div>
              ` : (d.vocabList && d.vocabList.length > 0 ? `
                <p style="margin: 0 0 8px 0; font-size: 9pt;"><strong>Target Vocabulary:</strong> ${d.vocabList.join(', ')}</p>
              ` : '')}

              ${d.idioms && d.idioms.length > 0 ? `
                <div style="margin-bottom: 8px; font-size: 8.5pt;">
                  <strong>💬 Target Idioms & Expressions:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 15px;">
                    ${d.idioms.map((idm: any) => {
                      const expr = idm.idiom || idm.expression || ''
                      const def = idm.definition || idm.meaning || ''
                      const ex = (idm.example_sentences && idm.example_sentences.length > 0) ? ` — <em>"${idm.example_sentences.join(' / ')}"` : (idm.usage ? ` — <em>"${idm.usage}"</em>` : '')
                      return `<li><strong>"${expr}"</strong>: ${def}${ex}</li>`
                    }).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `
        })
      })
    }
  } else {
    // Single Session Grammar Mechanics & Structure Matrix
    htmlContent += `<h2>Grammar Mechanics & Sentence Matrix</h2>`

    if (syllabus.grammarFocus) {
      htmlContent += `<p style="font-size: 9.5pt; color: #334155; margin-bottom: 10px;"><strong>Grammar Rule / Focus:</strong> ${syllabus.grammarFocus}</p>`
    }

    if (syllabus.grammarDefinition) {
      htmlContent += `<div style="background: #f0f9ff; border-left: 3px solid #0284c7; padding: 8px 12px; margin-bottom: 12px; font-size: 9pt; color: #0369a1;"><strong>📘 Academic Definition:</strong> ${syllabus.grammarDefinition}</div>`
    }

    if (syllabus.grammarExplanation) {
      htmlContent += `<div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 12px; margin-bottom: 12px; font-size: 9pt; color: #14532d;"><strong>📘 In-Depth Concept Explanation:</strong> ${syllabus.grammarExplanation}</div>`
    }

    if (syllabus.explanation_rationale) {
      htmlContent += `<div style="background: #faf5ff; border-left: 3px solid #9333ea; padding: 8px 12px; margin-bottom: 12px; font-size: 9pt; color: #6b21a8;"><strong>💡 Communicative Rationale:</strong> ${syllabus.explanation_rationale}</div>`
    }

    if (syllabus.grammarScopeLimit) {
      htmlContent += `<p style="font-size: 8.5pt; color: #b45309; background: #fef3c7; padding: 6px 10px; border-radius: 4px; margin-bottom: 10px;"><strong>Grammar Scope Limit:</strong> ${syllabus.grammarScopeLimit}</p>`
    }

    if (syllabus.boardLayout) {
      htmlContent += `<p style="font-size: 8.5pt; color: #1e3a8a; background: #e0e7ff; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; font-family: monospace;"><strong>Whiteboard Formula:</strong> ${syllabus.boardLayout}</p>`
    }

    if (syllabus.syntaxFormula) {
      htmlContent += `<p style="font-size: 8.5pt; color: #166534; background: #dcfce7; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; font-family: monospace;"><strong>📐 Word Order Blueprint:</strong> ${syllabus.syntaxFormula}</p>`
    }

    if (syllabus.grammarForms) {
      htmlContent += `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 9pt;">
          <strong style="color: #1e3a8a; font-size: 9.5pt;">📐 Sentence Structure Matrix (+ / - / ?):</strong>
          <div style="margin-top: 6px;"><strong>Positive (+):</strong> ${syllabus.grammarForms.positive}</div>
          <div style="margin-top: 4px;"><strong>Negative (-):</strong> ${syllabus.grammarForms.negative}</div>
          <div style="margin-top: 4px;"><strong>Interrogative (?):</strong> ${syllabus.grammarForms.interrogative} <em>(${syllabus.grammarForms.shortAnswers})</em></div>
        </div>
      `
    }

    if (syllabus.sentenceModels && syllabus.sentenceModels.length > 0) {
      htmlContent += `
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 9pt;">
          <strong style="color: #065f46; font-size: 9.5pt;">💬 Model Sentence Formation Examples:</strong>
          <ol style="margin: 4px 0 0 0; padding-left: 18px; color: #064e3b; font-family: monospace;">
            ${syllabus.sentenceModels.map((sm: string) => `<li>${sm}</li>`).join('')}
          </ol>
        </div>
      `
    }

    if (syllabus.grammarSubSections && syllabus.grammarSubSections.length > 0) {
      htmlContent += `
        <div style="background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 8px 12px; margin-bottom: 14px; font-size: 9pt;">
          <strong>🎯 Functional Grammar Sub-Sections to Cover:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.grammarSubSections.map((sec: string) => `<li>${sec}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.usageCases && syllabus.usageCases.length > 0) {
      htmlContent += `
        <div style="background: #f8fafc; border-left: 3px solid #475569; padding: 8px 12px; margin-bottom: 14px; font-size: 9pt;">
          <strong>📋 When, Why & Context of Usage:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.usageCases.map((uc: string) => `<li>${uc}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.edgeCases && syllabus.edgeCases.length > 0) {
      htmlContent += `
        <div style="background: #fef3c7; border-left: 3px solid #d97706; padding: 8px 12px; margin-bottom: 14px; font-size: 9pt; color: #92400e;">
          <strong>⚠️ Edge Cases & Common Student Pitfalls:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.edgeCases.map((ec: string) => `<li>${ec}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.edge_case_syntax && syllabus.edge_case_syntax.length > 0) {
      htmlContent += `
        <div style="background: #fef3c7; border-left: 3px solid #b45309; padding: 8px 12px; margin-bottom: 14px; font-size: 9pt; color: #92400e;">
          <strong>⚡ Edge Case Syntax Patterns:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.edge_case_syntax.map((ecs: string) => `<li>${ecs}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.signalWords && syllabus.signalWords.length > 0) {
      htmlContent += `
        <p style="font-size: 9pt; margin-bottom: 14px;">
          <strong>Key Signal Words & Placement Rules:</strong> ${syllabus.signalWords.join(', ')}
        </p>
      `
    }

    if (syllabus.vocabulary && syllabus.vocabulary.length > 0) {
      htmlContent += `
        <h2>Target Vocabulary</h2>
        <ul>
          ${syllabus.vocabulary.map((v: any) => {
            const pos = v.part_of_speech || v.partOfSpeech ? ` <em>(${v.part_of_speech || v.partOfSpeech})</em>` : ''
            const def = v.definition || v.def || ''
            const ex = (v.example_sentences && v.example_sentences.length > 0) ? ` — <em>"${v.example_sentences.join(' / ')}"` : (v.example ? ` — <em>"${v.example}"</em>` : '')
            return `<li><strong>${v.word}</strong>${pos}: ${def}${ex}</li>`
          }).join('')}
        </ul>
      `
    }

    if (syllabus.idioms && syllabus.idioms.length > 0) {
      htmlContent += `
        <h2>Target Idioms & Expressions</h2>
        <ul>
          ${syllabus.idioms.map((idm: any) => {
            const expr = idm.idiom || idm.expression || ''
            const def = idm.definition || idm.meaning || ''
            const ex = (idm.example_sentences && idm.example_sentences.length > 0) ? ` — <em>"${idm.example_sentences.join(' / ')}"` : (idm.usage ? ` — <em>"${idm.usage}"</em>` : '')
            return `<li><strong>"${expr}"</strong>: ${def}${ex}</li>`
          }).join('')}
        </ul>
      `
    }

    if (syllabus.ccqs && syllabus.ccqs.length > 0) {
      htmlContent += `
        <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 8px 12px; margin-bottom: 14px; font-size: 9pt;">
          <strong style="color: #1e3a8a;">Concept Check Questions (CCQs):</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px; color: #1e293b;">
            ${syllabus.ccqs.map((q: string) => `<li>${q}</li>`).join('')}
          </ul>
        </div>
      `
    }

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
          table-layout: fixed;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        thead {
          display: table-header-group;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          font-size: 11px;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
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
    const isSimplified = syllabus.detailLevel === 'simplified'
    const weekCount = weeksList.length || 12
    htmlContent += `<h2>${weekCount}-Week Course Syllabus Roadmap</h2>`
    
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Week / Session</th>
            <th style="width: 32%;">Topic & Grammar Sub-Rule</th>
            <th style="width: 20%;">Target Vocabulary</th>
            <th style="width: 26%;">Classroom Activity</th>
          </tr>
        </thead>
        <tbody>
    `
    weeksList.forEach((w: any) => {
      (w.days || []).forEach((d: any, idx: number) => {
        htmlContent += `
          <tr>
            <td>
              ${idx === 0 ? `<div style="font-weight: bold; color: #1e3a8a; margin-bottom: 2px;">${w.title || `Week ${w.weekNum}`}</div>` : ''}
              <strong>${d.day}</strong><br/><span style="font-size: 9px; color: #1e3a8a;">${d.type || ''}</span>
            </td>
            <td><strong>${d.topic}</strong><br/><span style="font-size: 10px; color: #475569;">${d.grammarFocus || d.objective}</span></td>
            <td><span style="background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-size: 9.5px;">${(d.vocabList && d.vocabList.length > 0) ? d.vocabList.join(', ') : '—'}</span></td>
            <td><strong>${d.activityType || 'Activity'}</strong><br/><span style="font-size: 10px; color: #334155;">${d.activityDetail || d.objective}</span></td>
          </tr>
        `
      })
    })
    htmlContent += `
        </tbody>
      </table>
    `

    // Teacher's Daily Guidebook Cards in PDF (Rendered ONLY in Fully Detailed mode to keep Simplified PDFs under 4 pages)
    if (!isSimplified) {
      htmlContent += `
        <div style="margin-top: 24px;">
          <h2>Teacher's Daily Guidebook (Micro Session Plans)</h2>
          <p style="font-size: 11px; color: #475569; margin-bottom: 16px;">Detailed daily lesson execution cards for classroom management, concept check questions (CCQs), and timeline breakdown.</p>
      `

      weeksList.forEach((w: any) => {
        (w.days || []).forEach((d: any) => {
          htmlContent += `
            <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; background: #ffffff; page-break-inside: avoid;">
              <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
                <h3 style="color: #1e3a8a; margin: 0; font-size: 12.5px;">${d.day}: ${d.topic}</h3>
              </div>
              
              <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
                <strong>Grammar Sub-Rule:</strong> ${d.grammarFocus || d.objective}
              </div>

              ${d.grammarDefinition ? `
                <div style="font-size: 10.5px; color: #0369a1; background: #f0f9ff; border-left: 3px solid #0284c7; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                  <strong>📘 Academic Definition:</strong> ${d.grammarDefinition}
                </div>
              ` : ''}

              ${d.grammarExplanation ? `
                <div style="font-size: 10.5px; color: #14532d; background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                  <strong>📘 Concept Explanation:</strong> ${d.grammarExplanation}
                </div>
              ` : ''}

              ${d.explanation_rationale ? `
                <div style="font-size: 10.5px; color: #6b21a8; background: #faf5ff; border-left: 3px solid #9333ea; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                  <strong>💡 Communicative Rationale:</strong> ${d.explanation_rationale}
                </div>
              ` : ''}

              ${d.grammarScopeLimit ? `
                <div style="font-size: 10px; color: #92400e; background: #fef3c7; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px;">
                  <strong>Grammar Scope Limit:</strong> ${d.grammarScopeLimit}
                </div>
              ` : ''}

              ${d.boardLayout ? `
                <div style="font-size: 10px; color: #1e3a8a; background: #e0e7ff; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px; font-family: monospace;">
                  <strong>Whiteboard Formula:</strong> ${d.boardLayout}
                </div>
              ` : ''}

              ${d.syntaxFormula ? `
                <div style="font-size: 10px; color: #166534; background: #dcfce7; padding: 4px 8px; border-radius: 4px; margin-bottom: 6px; font-family: monospace;">
                  <strong>📐 Word Order Blueprint:</strong> ${d.syntaxFormula}
                </div>
              ` : ''}

              ${d.grammarForms ? `
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #1e3a8a;">📐 Sentence Structure Matrix (+ / - / ?):</strong>
                  <div style="margin-top: 4px;"><strong>Positive (+):</strong> ${d.grammarForms.positive}</div>
                  <div style="margin-top: 2px;"><strong>Negative (-):</strong> ${d.grammarForms.negative}</div>
                  <div style="margin-top: 2px;"><strong>Interrogative (?):</strong> ${d.grammarForms.interrogative} <em>(${d.grammarForms.shortAnswers})</em></div>
                </div>
              ` : ''}

              ${d.sentenceModels && d.sentenceModels.length > 0 ? `
                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #065f46;">💬 Model Sentence Formation Examples:</strong>
                  <ol style="margin: 2px 0 0 0; padding-left: 16px; color: #064e3b; font-family: monospace;">
                    ${d.sentenceModels.map((sm: string) => `<li>${sm}</li>`).join('')}
                  </ol>
                </div>
              ` : ''}

              ${d.grammarSubSections && d.grammarSubSections.length > 0 ? `
                <div style="background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 6px 10px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #0f172a;">🎯 Functional Grammar Sub-Sections to Cover:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px; color: #334155;">
                    ${d.grammarSubSections.map((sec: string) => `<li>${sec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.usageCases && d.usageCases.length > 0 ? `
                <div style="background: #f8fafc; border-left: 3px solid #475569; padding: 6px 10px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #0f172a;">📋 When, Why & Context of Usage:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px; color: #334155;">
                    ${d.usageCases.map((uc: string) => `<li>${uc}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.edgeCases && d.edgeCases.length > 0 ? `
                <div style="background: #fef3c7; border-left: 3px solid #d97706; padding: 6px 10px; margin-bottom: 8px; font-size: 10px; color: #92400e;">
                  <strong>⚠️ Edge Cases & Common Student Pitfalls:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px;">
                    ${d.edgeCases.map((ec: string) => `<li>${ec}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.edge_case_syntax && d.edge_case_syntax.length > 0 ? `
                <div style="background: #fef3c7; border-left: 3px solid #b45309; padding: 6px 10px; margin-bottom: 8px; font-size: 10px; color: #92400e;">
                  <strong>⚡ Edge Case Syntax Patterns:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px;">
                    ${d.edge_case_syntax.map((ecs: string) => `<li>${ecs}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.signalWords && d.signalWords.length > 0 ? `
                <div style="font-size: 10px; color: #334155; margin-bottom: 8px;">
                  <strong>Key Signal Words & Placement:</strong> ${d.signalWords.join(', ')}
                </div>
              ` : ''}

              ${(d.vocabulary && d.vocabulary.length > 0) ? `
                <div style="font-size: 10.5px; color: #334155; margin-bottom: 8px;">
                  <strong>📚 Target Vocabulary:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px;">
                    ${d.vocabulary.map((v: any) => {
                      const pos = v.part_of_speech || v.partOfSpeech ? ` <em>(${v.part_of_speech || v.partOfSpeech})</em>` : ''
                      const def = v.definition || v.def || ''
                      const ex = (v.example_sentences && v.example_sentences.length > 0) ? ` — <em>"${v.example_sentences.join(' / ')}"` : (v.example ? ` — <em>"${v.example}"</em>` : '')
                      return `<li><strong>${v.word}</strong>${pos}: ${def}${ex}</li>`
                    }).join('')}
                  </ul>
                </div>
              ` : (d.vocabList && d.vocabList.length > 0 ? `
                <div style="font-size: 10.5px; color: #334155; margin-bottom: 8px;">
                  <strong>Target Vocabulary:</strong> <span style="color: #1e3a8a; font-weight: 600;">${d.vocabList.join(', ')}</span>
                </div>
              ` : '')}

              ${d.idioms && d.idioms.length > 0 ? `
                <div style="font-size: 10.5px; color: #334155; margin-bottom: 8px;">
                  <strong>💬 Target Idioms & Expressions:</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px;">
                    ${d.idioms.map((idm: any) => {
                      const expr = idm.idiom || idm.expression || ''
                      const def = idm.definition || idm.meaning || ''
                      const ex = (idm.example_sentences && idm.example_sentences.length > 0) ? ` — <em>"${idm.example_sentences.join(' / ')}"` : (idm.usage ? ` — <em>"${idm.usage}"</em>` : '')
                      return `<li><strong>"${expr}"</strong>: ${def}${ex}</li>`
                    }).join('')}
                  </ul>
                </div>
              ` : ''}

              ${d.discussionTopics && d.discussionTopics.length > 0 ? `
                <div style="background: #f0fdf4; border-left: 3px solid #16a34a; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #15803d;">🗣️ CEFR Discussion Topics:</strong>
                  ${d.discussionTopics.map((dt: any) => `<div style="margin-top: 2px;"><strong>Topic:</strong> ${dt.topic} — <em>"${dt.prompt}"</em></div>`).join('')}
                  ${d.functionalPhrases ? `<div style="margin-top: 4px;"><strong>Functional Speaking Phrases:</strong> ${d.functionalPhrases.join(' | ')}</div>` : ''}
                </div>
              ` : ''}

              ${d.activityGame ? `
                <div style="background: #fdf4ff; border-left: 3px solid #c026d3; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #a21caf;">🎮 Fluency Game: ${d.activityGame.gameName}</strong>
                  <div style="margin-top: 2px;"><strong>Materials Needed:</strong> ${d.activityGame.materials.join(', ')}</div>
                  <div style="margin-top: 2px;"><strong>Rules:</strong> ${d.activityGame.rules.join(' ')}</div>
                  <div style="margin-top: 2px;"><strong>Scoring:</strong> ${d.activityGame.scoring}</div>
                </div>
              ` : ''}

              ${d.readingPassage ? `
                <div style="background: #fffbeb; border-left: 3px solid #d97706; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #b45309;">📖 Reading Passage: ${d.readingPassage.passageTitle}</strong>
                  <div style="margin-top: 2px;"><strong>Strategy:</strong> ${d.readingPassage.readingStrategy}</div>
                  <div style="margin-top: 2px;"><strong>Comprehension Questions:</strong>
                    <ul style="margin: 2px 0 0 0; padding-left: 14px;">
                      ${d.readingPassage.comprehensionQuestions.map((cq: string) => `<li>${cq}</li>`).join('')}
                    </ul>
                  </div>
                </div>
              ` : ''}

              ${d.ccqs && d.ccqs.length > 0 ? `
                <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 6px 10px; border-radius: 4px; margin-bottom: 8px; font-size: 10px;">
                  <strong style="color: #1e3a8a;">Concept Check Questions (CCQs):</strong>
                  <ul style="margin: 2px 0 0 0; padding-left: 14px; color: #1e293b;">
                    ${d.ccqs.map((q: string) => `<li>${q}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `
        })
      })

      htmlContent += `</div>`
    }
  } else {
    // Single Session Grammar Mechanics & Structure Matrix
    htmlContent += `<h2>Grammar Mechanics & Sentence Matrix</h2>`

    if (syllabus.grammarFocus) {
      htmlContent += `<div style="font-size: 11px; color: #334155; margin-bottom: 10px;"><strong>Grammar Rule / Focus:</strong> ${syllabus.grammarFocus}</div>`
    }

    if (syllabus.grammarDefinition) {
      htmlContent += `<div style="font-size: 10.5px; color: #0369a1; background: #f0f9ff; border-left: 3px solid #0284c7; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px;"><strong>📘 Academic Definition:</strong> ${syllabus.grammarDefinition}</div>`
    }

    if (syllabus.grammarExplanation) {
      htmlContent += `<div style="font-size: 10.5px; color: #14532d; background: #f0fdf4; border-left: 3px solid #16a34a; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px;"><strong>📘 Concept Explanation:</strong> ${syllabus.grammarExplanation}</div>`
    }

    if (syllabus.explanation_rationale) {
      htmlContent += `<div style="font-size: 10.5px; color: #6b21a8; background: #faf5ff; border-left: 3px solid #9333ea; padding: 8px 12px; border-radius: 4px; margin-bottom: 10px;"><strong>💡 Communicative Rationale:</strong> ${syllabus.explanation_rationale}</div>`
    }

    if (syllabus.grammarScopeLimit) {
      htmlContent += `<div style="font-size: 10px; color: #92400e; background: #fef3c7; padding: 6px 10px; border-radius: 4px; margin-bottom: 10px;"><strong>Grammar Scope Limit:</strong> ${syllabus.grammarScopeLimit}</div>`
    }

    if (syllabus.boardLayout) {
      htmlContent += `<div style="font-size: 10px; color: #1e3a8a; background: #e0e7ff; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; font-family: monospace;"><strong>Whiteboard Formula:</strong> ${syllabus.boardLayout}</div>`
    }

    if (syllabus.syntaxFormula) {
      htmlContent += `<div style="font-size: 10px; color: #166534; background: #dcfce7; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; font-family: monospace;"><strong>📐 Word Order Blueprint:</strong> ${syllabus.syntaxFormula}</div>`
    }

    if (syllabus.grammarForms) {
      htmlContent += `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 10.5px;">
          <strong style="color: #1e3a8a;">📐 Sentence Structure Matrix (+ / - / ?):</strong>
          <div style="margin-top: 6px;"><strong>Positive (+):</strong> ${syllabus.grammarForms.positive}</div>
          <div style="margin-top: 4px;"><strong>Negative (-):</strong> ${syllabus.grammarForms.negative}</div>
          <div style="margin-top: 4px;"><strong>Interrogative (?):</strong> ${syllabus.grammarForms.interrogative} <em>(${syllabus.grammarForms.shortAnswers})</em></div>
        </div>
      `
    }

    if (syllabus.sentenceModels && syllabus.sentenceModels.length > 0) {
      htmlContent += `
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 10.5px;">
          <strong style="color: #065f46;">💬 Model Sentence Formation Examples:</strong>
          <ol style="margin: 4px 0 0 0; padding-left: 18px; color: #064e3b; font-family: monospace;">
            ${syllabus.sentenceModels.map((sm: string) => `<li>${sm}</li>`).join('')}
          </ol>
        </div>
      `
    }

    if (syllabus.grammarSubSections && syllabus.grammarSubSections.length > 0) {
      htmlContent += `
        <div style="background: #f8fafc; border-left: 3px solid #1e3a8a; padding: 8px 12px; margin-bottom: 14px; font-size: 10.5px;">
          <strong style="color: #0f172a;">🎯 Functional Grammar Sub-Sections to Cover:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px; color: #334155;">
            ${syllabus.grammarSubSections.map((sec: string) => `<li>${sec}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.usageCases && syllabus.usageCases.length > 0) {
      htmlContent += `
        <div style="background: #f8fafc; border-left: 3px solid #475569; padding: 8px 12px; margin-bottom: 14px; font-size: 10.5px;">
          <strong style="color: #0f172a;">📋 When, Why & Context of Usage:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px; color: #334155;">
            ${syllabus.usageCases.map((uc: string) => `<li>${uc}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.edgeCases && syllabus.edgeCases.length > 0) {
      htmlContent += `
        <div style="background: #fef3c7; border-left: 3px solid #d97706; padding: 8px 12px; margin-bottom: 14px; font-size: 10.5px; color: #92400e;">
          <strong>⚠️ Edge Cases & Common Student Pitfalls:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.edgeCases.map((ec: string) => `<li>${ec}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.edge_case_syntax && syllabus.edge_case_syntax.length > 0) {
      htmlContent += `
        <div style="background: #fef3c7; border-left: 3px solid #b45309; padding: 8px 12px; margin-bottom: 14px; font-size: 10.5px; color: #92400e;">
          <strong>⚡ Edge Case Syntax Patterns:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${syllabus.edge_case_syntax.map((ecs: string) => `<li>${ecs}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.signalWords && syllabus.signalWords.length > 0) {
      htmlContent += `
        <div style="font-size: 10.5px; color: #334155; margin-bottom: 14px;">
          <strong>Key Signal Words & Placement Rules:</strong> ${syllabus.signalWords.join(', ')}
        </div>
      `
    }

    if (syllabus.vocabulary && syllabus.vocabulary.length > 0) {
      htmlContent += `
        <h2>Target Vocabulary</h2>
        <ul>
          ${syllabus.vocabulary.map((v: any) => {
            const pos = v.part_of_speech || v.partOfSpeech ? ` <em>(${v.part_of_speech || v.partOfSpeech})</em>` : ''
            const def = v.definition || v.def || ''
            const ex = (v.example_sentences && v.example_sentences.length > 0) ? ` — <em>"${v.example_sentences.join(' / ')}"` : (v.example ? ` — <em>"${v.example}"</em>` : '')
            return `<li><strong>${v.word}</strong>${pos}: ${def}${ex}</li>`
          }).join('')}
        </ul>
      `
    }

    if (syllabus.idioms && syllabus.idioms.length > 0) {
      htmlContent += `
        <h2>Target Idioms & Expressions</h2>
        <ul>
          ${syllabus.idioms.map((idm: any) => {
            const expr = idm.idiom || idm.expression || ''
            const def = idm.definition || idm.meaning || ''
            const ex = (idm.example_sentences && idm.example_sentences.length > 0) ? ` — <em>"${idm.example_sentences.join(' / ')}"` : (idm.usage ? ` — <em>"${idm.usage}"</em>` : '')
            return `<li><strong>"${expr}"</strong>: ${def}${ex}</li>`
          }).join('')}
        </ul>
      `
    }

    if (syllabus.ccqs && syllabus.ccqs.length > 0) {
      htmlContent += `
        <div style="background: #eff6ff; border-left: 3px solid #2563eb; padding: 8px 12px; margin-bottom: 14px; font-size: 10.5px;">
          <strong style="color: #1e3a8a;">Concept Check Questions (CCQs):</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 18px; color: #1e293b;">
            ${syllabus.ccqs.map((q: string) => `<li>${q}</li>`).join('')}
          </ul>
        </div>
      `
    }

    if (syllabus.homework) {
      htmlContent += `
        <h2>Homework & Independent Application</h2>
        <div style="font-size: 11px; background: #f8fafc; padding: 10px; border-left: 4px solid #1e3a8a; border-radius: 4px;">
          ${syllabus.homework}
        </div>
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
