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

export interface AssessmentSection {
  title: string;
  methods: string[];
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

// '전체', '일부', '소수' 목표를 위한 새로운 타입
export interface DetailedObjectives {
  overall: string; // 전체 목표
  some: string;    // 일부 목표
  few: string;     // 소수 목표
}

// AI가 생성하는 최종 지도안의 전체 구조 (정리된 버전)
export interface GeneratedLessonPlan {
  id: string;
  achievementStandard: string;
  contextAnalysis: string;
  learnerAnalysis: string;
  
  // 기존 learningObjectives를 대체하는 세분화된 목표 객체
  detailedObjectives: DetailedObjectives; 

  udlPrinciples: UDLPrincipleSection[];
  assessment: AssessmentSection;
}