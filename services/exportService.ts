import { GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet } from '../types';

const escapeHtml = (text: string | undefined): string => {
    if (typeof text !== 'string') return '';
    return text
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

const getUdlPlanAsHtml = (plan: GeneratedLessonPlan): string => {
    let html = `<h3>학습 목표</h3><p>${escapeHtml(plan.learningObjectives)}</p>`;
    plan.udlPrinciples.forEach(principle => {
        html += `
            <table style="border: 1px solid #e2e8f0; width: 100%; margin-bottom: 16px; page-break-inside: avoid; background-color: #f8fafc;">
                <tr>
                    <td style="padding: 12px; border: none !important;">
                        <h4>${escapeHtml(principle.principle)}</h4>
                        <p><i>${escapeHtml(principle.description)}</i></p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;" />
                        ${principle.strategies.map(strat => `
                            <div style="margin-left: 16px; margin-bottom: 12px;">
                                <p><strong>${escapeHtml(strat.strategy)}</strong></p>
                                <p style="font-size: 9pt; color: #64748b;">가이드라인: ${escapeHtml(strat.guideline)}</p>
                                <p style="padding-left: 12px; border-left: 3px solid #cbd5e1;">${escapeHtml(strat.example)}</p>
                            </div>
                        `).join('')}
                    </td>
                </tr>
            </table>
        `;
    });
    html += `<h3>${escapeHtml(plan.assessment.title)}</h3><ul>${plan.assessment.methods.map(m => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`;
    return html;
};

const getTablePlanAsHtml = (plan: TableLessonPlan): string => {
    const metadata = `
      <div>
        <h3>수업 개요</h3>
        <p><strong>수업 주제:</strong> ${escapeHtml(plan.metadata.topic)}</p>
        <p><strong>학습 목표:</strong> ${escapeHtml(plan.metadata.objectives)}</p>
        <p><strong>준비물:</strong> ${escapeHtml(plan.metadata.materials.join(', '))}</p>
      </div>
    `;
    
    const steps = `
      <div>
        <h3>교수·학습 과정</h3>
        <table>
          <thead>
            <tr>
              <th>단계 (시간)</th>
              <th>학습 과정</th>
              <th>교수·학습 활동 (교사/학생)</th>
              <th>자료(·) 및 유의점(※)</th>
            </tr>
          </thead>
          <tbody>
            ${plan.steps.map(step => `
              <tr>
                <td><strong>${escapeHtml(step.phase)}</strong><br/>(${escapeHtml(step.duration)})</td>
                <td>${escapeHtml(step.process)}</td>
                <td>
                  <p><strong>[교사]</strong></p>
                  <ul>${step.teacherActivities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}</ul>
                  <p><strong>[학생]</strong></p>
                  <ul>${step.studentActivities.map(act => `<li>${escapeHtml(act)}</li>`).join('')}</ul>
                </td>
                <td>
                  <ul>${step.materialsAndNotes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const evaluation = `
        <div>
            <h3>${escapeHtml(plan.evaluationPlan.title)}</h3>
            ${plan.evaluationPlan.criteria.map(crit => `
                <div style="border: 1px solid #e2e8f0; margin-bottom: 1em; page-break-inside: avoid;">
                    <div style="background-color: #f8fafc; padding: 8px 12px;">
                        <p><strong>평가 내용:</strong> ${escapeHtml(crit.content)}</p>
                        <p><strong>평가 방법:</strong> ${escapeHtml(crit.method)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 20%;">평가 수준</th>
                                <th>평가 기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>잘함</td><td>${escapeHtml(crit.excellent)}</td></tr>
                            <tr><td>보통</td><td>${escapeHtml(crit.good)}</td></tr>
                            <tr><td>노력요함</td><td>${escapeHtml(crit.needsImprovement)}</td></tr>
                        </tbody>
                    </table>
                </div>
            `).join('')}
        </div>
    `;

    return metadata + steps + evaluation;
};

const getWorksheetAsHtml = (plan: Worksheet): string => {
    let html = `<p>${escapeHtml(plan.description)}</p>`;
    plan.levels.forEach(level => {
        html += `
            <table style="border: 1px solid #e2e8f0; width: 100%; margin-bottom: 16px; page-break-inside: avoid;">
                <tr>
                    <td style="padding: 12px; border: none !important;">
                        <h4>[${escapeHtml(level.levelName)}] ${escapeHtml(level.title)}</h4>
                        ${level.activities.map(act => `
                            <div style="margin-top: 12px; padding: 10px; background-color: #f8fafc; border-radius: 4px;">
                                <p><strong>${escapeHtml(act.title)}</strong></p>
                                <p><i>${escapeHtml(act.description)}</i></p>
                                <div style="margin-top: 8px; padding: 12px; border: 1px dashed #cbd5e1; background-color: #fff;">
                                    ${escapeHtml(act.content).replace(/\n/g, '<br/>')}
                                </div>
                            </div>
                        `).join('')}
                    </td>
                </tr>
            </table>
        `;
    });
    return html;
};

const getUdlEvaluationAsHtml = (plan: UdlEvaluationPlan): string => {
    let html = `<p>${escapeHtml(plan.description)}</p>`;
    plan.tasks.forEach(task => {
        html += `
            <table style="border: 1px solid #e2e8f0; width: 100%; margin-bottom: 16px; page-break-inside: avoid;">
                <tr>
                    <td style="padding: 12px; border: none !important;">
                        <h3>${escapeHtml(task.taskTitle)}</h3>
                        <p>${escapeHtml(task.taskDescription)}</p>
                        <p><strong>UDL 연계:</strong> ${escapeHtml(task.udlConnections.join(', '))}</p>
                        <table style="margin-top: 12px;">
                            <thead><tr><th>수준</th><th>과제 설명</th><th>평가 기준</th></tr></thead>
                            <tbody>
                                <tr><td>상</td><td>${escapeHtml(task.levels.advanced.description)}</td><td>${escapeHtml(task.levels.advanced.criteria)}</td></tr>
                                <tr><td>중</td><td>${escapeHtml(task.levels.proficient.description)}</td><td>${escapeHtml(task.levels.proficient.criteria)}</td></tr>
                                <tr><td>하</td><td>${escapeHtml(task.levels.basic.description)}</td><td>${escapeHtml(task.levels.basic.criteria)}</td></tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    });
    return html;
};

const getProcessEvaluationAsHtml = (plan: ProcessEvaluationWorksheet): string => {
    let html = `
        <div style="text-align: right; margin-bottom: 1em; border: 1px solid #ccc; padding: 8px;">
            ${escapeHtml(plan.studentInfo.grade)} &nbsp;&nbsp; ${escapeHtml(plan.studentInfo.class)} &nbsp;&nbsp; ${escapeHtml(plan.studentInfo.number)} &nbsp;&nbsp; ${escapeHtml(plan.studentInfo.name)}
        </div>
        <p style="background-color: #f1f5f9; padding: 12px; border-left: 4px solid #6366f1; margin-bottom: 1.5em;">${escapeHtml(plan.overallDescription)}</p>
        <table>
            <thead>
                <tr>
                    <th>평가 기준</th>
                    <th>수준 (상)</th>
                    <th>수준 (중)</th>
                    <th>수준 (하)</th>
                </tr>
            </thead>
            <tbody>
            ${plan.evaluationItems.map(item => `
                <tr>
                    <td><strong>${escapeHtml(item.criterion)}</strong></td>
                    <td>${escapeHtml(item.levels.excellent)}</td>
                    <td>${escapeHtml(item.levels.good)}</td>
                    <td>${escapeHtml(item.levels.needsImprovement)}</td>
                </tr>
            `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 2em;">
            <h4>교사 종합 의견</h4>
            <div style="border: 1px solid #ccc; min-height: 100px; padding: 8px;">${escapeHtml(plan.overallFeedback.teacherComment)}</div>
        </div>
        <div style="margin-top: 1.5em;">
            <h4>자기 성찰</h4>
            <div style="border: 1px solid #ccc; min-height: 100px; padding: 8px;">${escapeHtml(plan.overallFeedback.studentReflection)}</div>
        </div>
    `;
    return html;
};

const generateFullHtml = (title: string, mainHeader: string, subHeader: string, content: string): string => {
  const styles = `
    <style>
      /* Word-specific CSS */
      @page WordSection1 {
        size: 210mm 297mm; /* A4 size */
        margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        mso-header-margin: .5in;
        mso-footer-margin: .5in;
        mso-paper-source: 0;
      }
      div.WordSection1 {
        page: WordSection1;
      }
      
      /* General styles */
      body { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 10.5pt; line-height: 1.6; color: #334155; }
      h1, h2, h3, h4, h5, h6 { font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; color: #1e293b; margin-top: 1.5em; margin-bottom: 0.8em; page-break-after: avoid; }
      h1 { font-size: 20pt; text-align: center; }
      h2 { font-size: 16pt; border-bottom: 2px solid #94a3b8; padding-bottom: 4px; }
      h3 { font-size: 14pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }
      h4 { font-size: 12pt; }
      table { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 1em; page-break-inside: avoid; font-size: 9.5pt; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
      th { background-color: #f1f5f9; font-weight: bold; }
      ul, ol { margin-top: 0.2em; margin-bottom: 0.5em; padding-left: 25px; }
      p { margin-top: 0; margin-bottom: 0.5em; }
    </style>
  `;

  return `
    <!DOCTYPE html>
    <html lang="ko" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(title)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      ${styles}
    </head>
    <body>
      <div class="WordSection1">
        <h1>${escapeHtml(mainHeader)}</h1>
        <p style="text-align: center; font-size: 12pt; color: #475569; margin-bottom: 2em;">${escapeHtml(subHeader)}</p>
        ${content}
      </div>
    </body>
    </html>
  `;
};

export const exportPlanAsWord = (
    plan: GeneratedLessonPlan, 
    view: 'udl' | 'table' | 'worksheet' | 'udlEvaluation' | 'processEvaluation'
) => {
    let contentHtml = '';
    let mainTitle = plan.lessonTitle;
    let subTitle = ``;
    let docTitle = plan.lessonTitle;

    switch(view) {
        case 'udl':
            contentHtml = getUdlPlanAsHtml(plan);
            subTitle = `UDL 지도안 (${plan.gradeLevel} ${plan.subject})`;
            break;
        case 'table':
            if (plan.tablePlan) {
                contentHtml = getTablePlanAsHtml(plan.tablePlan);
                mainTitle = plan.tablePlan.metadata.lessonTitle;
                subTitle = `교수·학습 과정안`;
                docTitle = mainTitle;
            }
            break;
        case 'worksheet':
            if (plan.worksheet) {
                contentHtml = getWorksheetAsHtml(plan.worksheet);
                mainTitle = plan.worksheet.title;
                subTitle = `수준별 활동지`;
                docTitle = mainTitle;
            }
            break;
        case 'udlEvaluation':
            if (plan.udlEvaluation) {
                contentHtml = getUdlEvaluationAsHtml(plan.udlEvaluation);
                mainTitle = plan.udlEvaluation.title;
                subTitle = `UDL 평가 계획`;
                docTitle = mainTitle;
            }
            break;
        case 'processEvaluation':
             if (plan.processEvaluationWorksheet) {
                contentHtml = getProcessEvaluationAsHtml(plan.processEvaluationWorksheet);
                mainTitle = plan.processEvaluationWorksheet.title;
                subTitle = `과정중심평가지`;
                docTitle = mainTitle;
            }
            break;
    }

    if (!contentHtml) {
        alert('내보낼 내용이 없습니다.');
        return;
    }
    
    const fullHtml = generateFullHtml(docTitle, mainTitle, subTitle, contentHtml);

    const blob = new Blob(['\uFEFF', fullHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docTitle.replace(/[\\/:*?"<>|]/g, '')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};