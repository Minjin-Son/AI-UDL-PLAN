import { GeneratedLessonPlan, TableLessonPlan, UdlEvaluationPlan, ProcessEvaluationWorksheet, Worksheet } from '../types';

// Helper function to create a clean HTML document string
function createHtmlDocument(title: string, bodyContent: string): string {
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
            </style>
        </head>
        <body>
            ${bodyContent}
        </body>
        </html>
    `;
}

// --- Individual HTML Converters ---

function getUdlPlanAsHtml(plan: GeneratedLessonPlan): string {
    // This is a simplified representation. You can build a full HTML table here.
    let html = `<h1>보편적 학습 설계(UDL) 지도안</h1>`;
    // Since lessonTitle is not directly on plan, we get it from tablePlan if it exists
    const title = plan.tablePlan?.metadata.lessonTitle || "지도안 제목";
    html += `<h2>${title}</h2>`;
    html += `<p><strong>성취기준:</strong> ${plan.achievementStandard}</p>`;
    // ... add more fields as needed
    return html;
}

function getTablePlanAsHtml(tablePlan: TableLessonPlan): string {
    let html = `<h1>교수·학습 과정안</h1>`;
    html += `<h2>${tablePlan.metadata.lessonTitle}</h2>`;
    // ... build the full table HTML here
    return html;
}

function getWorksheetAsHtml(worksheet: Worksheet): string {
    let html = `<h1>${worksheet.title}</h1>`;
    html += `<p>${worksheet.description}</p>`;
    // ... build the full worksheet HTML here
    return html;
}

function getUdlEvaluationAsHtml(udlEvaluation: UdlEvaluationPlan): string {
    let html = `<h1>UDL 평가 계획</h1>`;
    html += `<h2>${udlEvaluation.title}</h2>`;
    // ... build the full evaluation plan HTML here
    return html;
}

function getProcessEvaluationAsHtml(processWorksheet: ProcessEvaluationWorksheet): string {
    let html = `<h1>과정중심평가지</h1>`;
    html += `<h2>${processWorksheet.title}</h2>`;
    // ... build the full process evaluation worksheet HTML here
    return html;
}


// --- Main Export Function ---

export function exportPlan(plan: GeneratedLessonPlan, view: 'udl' | 'table' | 'worksheet' | 'udlEvaluation' | 'processEvaluation') {
    let contentHtml = '';
    let mainTitle = '지도안';
    let subTitle = '';
    let docTitle = '지도안';

    // ✅ Use optional chaining (?) and fallbacks to safely access properties
    const metadata = plan.tablePlan?.metadata;

    switch (view) {
        case 'udl':
            contentHtml = getUdlPlanAsHtml(plan);
            if (metadata) {
                subTitle = `UDL 지도안 (${metadata.gradeLevel} ${metadata.subject})`;
                mainTitle = metadata.lessonTitle;
                docTitle = mainTitle;
            } else {
                subTitle = 'UDL 지도안';
            }
            break;
        
        case 'table':
            if (plan.tablePlan) {
                contentHtml = getTablePlanAsHtml(plan.tablePlan);
                mainTitle = plan.tablePlan.metadata.lessonTitle;
                subTitle = '교수·학습 과정안';
                docTitle = mainTitle;
            }
            break;

        case 'worksheet':
            if (plan.worksheet) {
                contentHtml = getWorksheetAsHtml(plan.worksheet);
                mainTitle = plan.worksheet.title;
                subTitle = '수준별 활동지';
                docTitle = mainTitle;
            }
            break;

        case 'udlEvaluation':
            if (plan.udlEvaluation) {
                contentHtml = getUdlEvaluationAsHtml(plan.udlEvaluation);
                mainTitle = plan.udlEvaluation.title;
                subTitle = 'UDL 평가 계획';
                docTitle = mainTitle;
            }
            break;
        
        case 'processEvaluation':
            if (plan.processEvaluationWorksheet) {
                contentHtml = getProcessEvaluationAsHtml(plan.processEvaluationWorksheet);
                mainTitle = plan.processEvaluationWorksheet.title;
                subTitle = '과정중심평가지';
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
}


