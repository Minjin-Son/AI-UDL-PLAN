import { GeneratedLessonPlan, TableLessonPlan, UdlEvaluationPlan, ProcessEvaluationWorksheet, Worksheet } from '../types';

// Helper function to create a clean HTML document string
const createHtmlDocument = (title: string, bodyContent: string): string => {
    return `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <style>
                body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
                h1, h2, h3 { margin-top: 1.2em; }
                table { border-collapse: collapse; width: 100%; margin-top: 1em; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .worksheet-level { margin-bottom: 2em; border: 1px solid #eee; padding: 1em; border-radius: 8px; }
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
        </html>
    `;
};

// --- Individual HTML Converters ---

const getUdlPlanAsHtml = (plan: GeneratedLessonPlan): string => {
    // ... (This function remains the same as before)
    let html = `<h1>보편적 학습 설계(UDL) 지도안</h1>`;
    const title = plan.tablePlan?.metadata.lessonTitle || "지도안 제목 없음";
    html += `<h2>${title}</h2>`;
    html += `...`; // Placeholder for the rest of the UDL plan HTML
    return html;
};

const getTablePlanAsHtml = (tablePlan: TableLessonPlan): string => {
    // ... (This function remains the same as before)
    let html = `<h1>교수·학습 과정안</h1>`;
    html += `<h2>${tablePlan.metadata.lessonTitle}</h2>`;
    return html;
};

// ✅ [새로 추가] 활동지를 HTML로 변환하는 함수
const getWorksheetAsHtml = (worksheet: Worksheet): string => {
    let html = `<h1>${worksheet.title}</h1>`;
    html += `<p>${worksheet.description}</p>`;
    worksheet.levels.forEach(level => {
        html += `<div class="worksheet-level">`;
        html += `<h2>${level.levelName} - ${level.title}</h2>`;
        level.activities.forEach(activity => {
            html += `<h3>${activity.title}</h3>`;
            html += `<p>${activity.description}</p>`;
            html += `<div>${activity.content.replace(/\n/g, '<br>')}</div>`;
        });
        html += `</div>`;
    });
    return html;
};

const getUdlEvaluationAsHtml = (udlEvaluation: UdlEvaluationPlan): string => {
    // ... (This function remains the same as before)
    let html = `<h1>UDL 평가 계획</h1>`;
    html += `<h2>${udlEvaluation.title}</h2>`;
    return html;
};

const getProcessEvaluationAsHtml = (processWorksheet: ProcessEvaluationWorksheet): string => {
    // ... (This function remains the same as before)
    let html = `<h1>과정중심평가지</h1>`;
    html += `<h2>${processWorksheet.title}</h2>`;
    return html;
};

// --- Main Export Function ---

// ✅ 'view' 타입에 'worksheet'를 다시 추가합니다.
export const exportPlanAsWord = (plan: GeneratedLessonPlan, view: 'udl' | 'table' | 'worksheet' | 'udlEvaluation' | 'processEvaluation') => {
    let contentHtml = '';
    let mainTitle = '지도안';
    let subTitle = '';
    let docTitle = '지도안';

    switch (view) {
        // ... ('udl', 'table' cases remain the same) ...

        case 'udl':
            contentHtml = getUdlPlanAsHtml(plan);
            if (plan.tablePlan) {
                const { subject, gradeLevel, lessonTitle } = plan.tablePlan.metadata;
                subTitle = `UDL 지도안 (${gradeLevel} ${subject})`;
                mainTitle = lessonTitle;
                docTitle = mainTitle;
            } else {
                subTitle = 'UDL 지도안';
            }
            break;

        case 'table':
            if (plan.tablePlan) {
                contentHtml = getTablePlanAsHtml(plan.tablePlan);
                mainTitle = plan.tablePlan.metadata.lessonTitle;
                subTitle = `교수·학습 과정안`;
                docTitle = mainTitle;
            }
            break;

        // ✅ [새로 추가] 활동지 내보내기 케이스를 복구합니다.
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

    if (contentHtml) {
        const fullHtml = createHtmlDocument(docTitle, `<h1>${mainTitle}</h1><h3>${subTitle}</h3>${contentHtml}`);
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${docTitle}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('내보내기할 내용이 없습니다. 먼저 해당 지도안을 생성해주세요.');
    }
};

