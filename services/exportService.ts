import { GeneratedLessonPlan, TableLessonPlan, UdlEvaluationPlan, ProcessEvaluationWorksheet } from '../types';

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
            ul { padding-left: 20px; }
            .no-print { display: none; }
        </style>
    </head>
    <body>
        ${bodyContent}
    </body>
    </html>
    `;
};


// --- UDL 지도안 HTML 생성 ---
const getUdlPlanAsHtml = (plan: GeneratedLessonPlan): string => {
    // This is a simplified HTML structure. You can expand it to match your UDLDisplay component.
    return `
        <h1>보편적 학습 설계(UDL) 지도안</h1>
        <h2>1단계: 목표 확인 및 설정하기</h2>
        <p><strong>교육과정 성취기준:</strong> ${plan.achievementStandard}</p>
        <h3>목표</h3>
        <p><strong>전체:</strong> ${plan.detailedObjectives.overall}</p>
        <p><strong>일부:</strong> ${plan.detailedObjectives.some}</p>
        <p><strong>소수:</strong> ${plan.detailedObjectives.few}</p>
        
        <h2>2단계: 상황 분석하기</h2>
        <p><strong>상황 분석:</strong> ${plan.contextAnalysis}</p>
        <p><strong>학습자 분석:</strong> ${plan.learnerAnalysis}</p>
        
        ${plan.udlPrinciples.map(p => `
            <h3>${p.principle}</h3>
            <p><em>${p.description}</em></p>
            <ul>
                ${p.strategies.map(s => `<li><strong>${s.strategy}:</strong> ${s.example}</li>`).join('')}
            </ul>
        `).join('')}
    `;
};

// --- 표 형식 지도안 HTML 생성 ---
const getTablePlanAsHtml = (tablePlan: TableLessonPlan): string => {
    return `
        <h1>${tablePlan.metadata.lessonTitle}</h1>
        <h2>교수·학습 과정안</h2>
        <table>
            <thead>
                <tr>
                    <th>단계</th>
                    <th>학습 과정</th>
                    <th>교사 활동</th>
                    <th>학생 활동</th>
                    <th>자료 및 유의점</th>
                </tr>
            </thead>
            <tbody>
                ${tablePlan.steps.map(step => `
                    <tr>
                        <td>${step.phase}</td>
                        <td>${step.process}</td>
                        <td><ul>${step.teacherActivities.map(act => `<li>${act}</li>`).join('')}</ul></td>
                        <td><ul>${step.studentActivities.map(act => `<li>${act}</li>`).join('')}</ul></td>
                        <td><ul>${step.materialsAndNotes.map(note => `<li>${note}</li>`).join('')}</ul></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h2>평가 계획</h2>
        <table>
           <thead>
                <tr>
                    <th>평가 내용</th>
                    <th>평가 방법</th>
                    <th>평가 기준 (상/중/하)</th>
                </tr>
            </thead>
            <tbody>
                ${tablePlan.evaluationPlan.criteria.map(c => `
                    <tr>
                        <td>${c.content}</td>
                        <td>${c.method}</td>
                        <td>
                            <strong>상:</strong> ${c.excellent}<br>
                            <strong>중:</strong> ${c.good}<br>
                            <strong>하:</strong> ${c.needsImprovement}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};


// --- UDL 평가 계획 HTML 생성 ---
const getUdlEvaluationAsHtml = (udlEvaluation: UdlEvaluationPlan): string => {
    return `
        <h1>${udlEvaluation.title}</h1>
        <p>${udlEvaluation.description}</p>
        ${udlEvaluation.tasks.map(task => `
            <h2>${task.taskTitle}</h2>
            <p>${task.taskDescription}</p>
            <h3>수준별 과제 및 기준</h3>
            <ul>
                <li><strong>상:</strong> ${task.levels.advanced.description} (기준: ${task.levels.advanced.criteria})</li>
                <li><strong>중:</strong> ${task.levels.proficient.description} (기준: ${task.levels.proficient.criteria})</li>
                <li><strong>하:</strong> ${task.levels.basic.description} (기준: ${task.levels.basic.criteria})</li>
            </ul>
        `).join('')}
    `;
};

// --- 과정 중심 평가 HTML 생성 ---
const getProcessEvaluationAsHtml = (processEvaluation: ProcessEvaluationWorksheet): string => {
     return `
        <h1>${processEvaluation.title}</h1>
        <p>${processEvaluation.overallDescription}</p>
        <table>
            <thead>
                <tr>
                    <th>평가 기준</th>
                    <th>수준별 성취 내용</th>
                </tr>
            </thead>
            <tbody>
                ${processEvaluation.evaluationItems.map(item => `
                    <tr>
                        <td>${item.criterion}</td>
                        <td>
                            <strong>상:</strong> ${item.levels.excellent}<br>
                            <strong>중:</strong> ${item.levels.good}<br>
                            <strong>하:</strong> ${item.levels.needsImprovement}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <h3>종합 의견</h3>
        <p><strong>교사 종합 의견:</strong> ${processEvaluation.overallFeedback.teacherComment}</p>
        <p><strong>자기 성찰:</strong> ${processEvaluation.overallFeedback.studentReflection}</p>
    `;
};


// --- 메인 export 함수 ---
export const exportPlan = (plan: GeneratedLessonPlan, view: 'udl' | 'table' | 'udlEvaluation' | 'processEvaluation') => {
    if (!plan) return;

    let mainTitle = "지도안";
    let subTitle = "";
    let docTitle = "지도안";
    let contentHtml = "";

    switch (view) {
        case 'udl':
            contentHtml = getUdlPlanAsHtml(plan);
            // UDL 지도안 자체에는 제목 필드가 없으므로, 기본 제목을 사용합니다.
            mainTitle = "보편적 학습 설계 지도안";
            subTitle = `${plan.achievementStandard}`;
            docTitle = mainTitle;
            break;

        case 'table':
            if (plan.tablePlan) {
                contentHtml = getTablePlanAsHtml(plan.tablePlan);
                mainTitle = plan.tablePlan.metadata.lessonTitle;
                subTitle = '교수·학습 과정안';
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
                subTitle = '과정 중심 평가지';
                docTitle = mainTitle;
            }
            break;
    }

    if (contentHtml) {
        const fullHtml = createHtmlDocument(docTitle, contentHtml);
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${docTitle}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
};