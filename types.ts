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

// ✅ 최종 버전의 GeneratedLessonPlan 설계도
export interface GeneratedLessonPlan {
  id: string;
  achievementStandard: string;
  detailedObjectives: DetailedObjectives;
  contextAnalysis: string;
  learnerAnalysis: string;
  udlPrinciples: UDLPrincipleSection[];
  assessment: {
    title: string;
    methods: string[];
  };
  // ✅ 여기에 빠져있던 부가 기능들을 다시 추가했습니다.
  // '?'는 이 기능들이 아직 생성되지 않았을 수도 있다는 의미입니다.
  tablePlan?: TableLessonPlan;
  udlEvaluation?: UdlEvaluationPlan;
  processEvaluationWorksheet?: ProcessEvaluationWorksheet;
}