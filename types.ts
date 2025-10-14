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

export interface GeneratedLessonPlan {
  processEvaluationWorksheet: any;
  udlEvaluation: any;
  worksheet: any;
  tablePlan: any;
  subject: any;
  gradeLevel: any;
  learningObjectives: string;
  lessonTitle: any;
  id: string;
  achievementStandard: string;
  contextAnalysis: string;
  learnerAnalysis: string;
  
  // 기존 learningObjectives를 대체하는 세분화된 목표 객체
  detailedObjectives: DetailedObjectives; 

  udlPrinciples: UDLPrincipleSection[];
  assessment: AssessmentSection;
}
export interface MultimediaResource {
  title: string;
  platform: string;
  search_query: string;
}

export interface GeminiResponse {
  lesson_plan: {
    // 기존 지도안 타입...
  };
  multimedia_resources: MultimediaResource[];
  image_generation_prompt: string;
}