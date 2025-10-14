// ✅ 1. '개별 재료(부품)'들을 먼저 정의합니다.

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

export interface DetailedObjectives {
  overall: string;
  some: string;
  few: string;
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

export interface MultimediaResource {
  title: string;
  platform: string;
  search_query: string;
}

// ... (TableLessonPlan, Worksheet 등 다른 개별 타입들도 여기에 정의되어 있다고 가정합니다)
// ... 만약 다른 타입들도 별도로 정의하셨다면, GeneratedLessonPlan보다 위에 있으면 됩니다.
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
    steps: any[]; // 간단하게 any로 처리하거나, LessonPlanTableRow 타입을 정의해야 합니다.
    evaluationPlan: any;
}

export interface Worksheet {
    title: string;
    description: string;
    levels: any[];
}
export interface UdlEvaluationPlan {
    title: string;
    description: string;
    tasks: any[];
}
export interface ProcessEvaluationWorksheet {
    title: string;
    studentInfo: any;
    overallDescription: string;
    evaluationItems: any[];
    overallFeedback: any;
}


// ✅ 2. 모든 재료 준비가 끝난 후, '메인 요리'를 정의합니다.
export interface GeneratedLessonPlan {
  id?: string;
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  
  // ✅ 이제 컴퓨터가 DetailedObjectives가 무엇인지 이미 알고 있습니다.
  detailedObjectives: DetailedObjectives; 
  udlPrinciples: UDLPrincipleSection[];
  assessment: AssessmentSection;
  
  contextAnalysis: string;
  learnerAnalysis: string;
  achievementStandard?: string;
  
  // ✅ 새로 추가한 멀티미디어 자료도 포함합니다.
  multimedia_resources?: MultimediaResource[];

  // 다른 생성될 자료들 (기존 코드 유지)
  tablePlan?: TableLessonPlan;
  worksheet?: Worksheet;
  udlEvaluation?: UdlEvaluationPlan;
  processEvaluationWorksheet?: ProcessEvaluationWorksheet;
}
