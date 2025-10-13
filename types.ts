export interface LessonPlanInputs {
  gradeLevel: string;
  semester: string;
  subject: string;
  topic: string;
  duration: string;
  objectives: string;
  unitName: string;
  achievementStandards: string;
  specialNeeds?: string;
  studentCharacteristics?: string;
}

export interface UDLStrategy {
    guideline: string;
    strategy: string;
    example: string;
}

export interface UDLPrincipleSection {
    principle: string;
    description: string;
    strategies: UDLStrategy[];
}

export interface DetailedObjectives {
  overall: string;
  some: string;
  few: string;
}

export interface LessonPlanTableRow {
    phase: string;
    duration: string;
    process: string;
    teacherActivities: string[];
    studentActivities: string[];
    materialsAndNotes: string[];
}

export interface EvaluationCriterion {
    content: string;
    method: string;
    excellent: string;
    good: string;
    needsImprovement: string;
}

export interface TableLessonPlan {
    metadata: {
        lessonTitle: string;
        subject: string;
        gradeLevel: string;
        topic: string;
        objectives: string;
        duration: string;
        materials: string[];
    };
    steps: LessonPlanTableRow[];
    evaluationPlan: {
        title: string;
        criteria: EvaluationCriterion[];
    };
}

export interface WorksheetActivity {
    title: string;
    description: string;
    content: string;
}

export interface WorksheetLevel {
    levelName: string;
    title: string;
    activities: WorksheetActivity[];
}

export interface Worksheet {
    title: string;
    description: string;
    levels: WorksheetLevel[];
}


export interface EvaluationTaskLevel {
    description: string;
    criteria: string;
}

export interface EvaluationTask {
    taskTitle: string;
    taskDescription: string;
    udlConnections: string[];
    levels: {
        advanced: EvaluationTaskLevel;
        proficient: EvaluationTaskLevel;
        basic: EvaluationTaskLevel;
    };
}

export interface UdlEvaluationPlan {
    title: string;
    description: string;
    tasks: EvaluationTask[];
}

export interface EvaluationItem {
    criterion: string;
    levels: {
        excellent: string;
        good: string;
        needsImprovement: string;
    };
}

export interface ProcessEvaluationWorksheet {
    title: string;
    studentInfo: {
        grade: string;
        class: string;
        number: string;
        name: string;
    };
    overallDescription: string;
    evaluationItems: EvaluationItem[];
    overallFeedback: {
        teacherComment: string;
        studentReflection: string;
    };
}

// ✅ '활동지'까지 모두 포함된 최종 버전의 GeneratedLessonPlan 설계도
export interface GeneratedLessonPlan {
  id: string;
  // lessonTitle, subject, gradeLevel 등은 다른 객체 안으로 이동했습니다.
  achievementStandard: string;
  detailedObjectives: DetailedObjectives;
  contextAnalysis: string;
  learnerAnalysis: string;
  udlPrinciples: UDLPrincipleSection[];
  assessment: {
    title: string;
    methods: string[];
  };
  tablePlan?: TableLessonPlan;
  worksheet?: Worksheet; // ✅ 활동지 기능 다시 포함
  udlEvaluation?: UdlEvaluationPlan;
  processEvaluationWorksheet?: ProcessEvaluationWorksheet;
}

