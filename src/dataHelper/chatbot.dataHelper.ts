export type ChatbotRecord = {
  id: number;
  content: string;
  total_answers: number;
  type?: number;
  is_start_node?: number;
};

export type QuestionRecord = ChatbotRecord;

export type QuestionSortKey = "id" | "content" | "total_answers";

export type QuestionFilters = {
  content: string;
  page: number;
  per_page: number;
  sort_by: QuestionSortKey | null;
  direction: "asc" | "desc";
};

export type ChatbotListParams = QuestionFilters & {
  pagination?: number;
};

export const toChatbotListPayload = (filters: QuestionFilters): ChatbotListParams => ({
  page: filters.page,
  per_page: filters.per_page,
  pagination: filters.per_page,
  content: filters.content,
  sort_by: filters.sort_by ?? null,
  direction: filters.sort_by ? filters.direction : "asc",
});

export type ChatbotAnswerForm = {
  id?: number;
  content: string;
  next_question_id: number | null;
  _action?: "create" | "update" | "delete";
};

export type CreateChatbotQuestionPayload = {
  content: string;
  type: 0 | 1;
  is_start_node: 0 | 1;
  answers: ChatbotAnswerForm[];
};

export type CreateChatbotQuestionResponse = {
  id: number;
};

export type DeleteChatbotResponse = {
  success?: boolean;
};

export type UpdateChatbotQuestionPayload = CreateChatbotQuestionPayload;

export type UpdateChatbotQuestionResponse = {
  id: number;
};

export type CreateQuestionFormValues = CreateChatbotQuestionPayload;

export type UpdateChatbotPositionPayload = {
  position_x: number;
  position_y: number;
};

export type UpdateChatbotLineFlowPayload = {
  answer_id: number;
  next_question_id?: number | null;
};

export type CreateQuestionProps = {
  defaultValues?: CreateQuestionFormValues;
  onSubmit: (values: CreateQuestionFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showResetButton?: boolean;
  currentQuestionId?: number;
};

export type UseQuestionFiltersResult = {
  filters: QuestionFilters;
  searchValue: string;
  setTitle: (value: string) => void;
  toggleSort: (key: QuestionSortKey) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  reset: () => void;
};

export type QuestionsProps = {
  rows: QuestionRecord[];
  filters: QuestionFilters;
  onToggleSort: (key: QuestionSortKey) => void;
  page: number;
  perPage: number;
  totalItems: number;
  isLoading?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export type QuestionSearchProps = {
  open: boolean;
  filters: QuestionFilters;
  searchValue: string;
  onTitleChange: (title: string) => void;
  onReset: () => void;
  onClose: () => void;
  isLoading?: boolean;
};

export type QuestionDetailProps = {
  detail: ChatbotQuestionDetailPayload;
  onNavigateNext?: (id: number) => void;
};

export type ChatbotAnswer = {
  id: number;
  question_id: number;
  content: string;
  next_question_id: number | null;
  next_question_content?: string | null;
};

export type ChatbotFlowAnswer = {
  id: number;
  question_id: number;
  content: string;
  next_question_id: number | null;
};

export type ChatbotFlowNode = {
  id: number;
  content: string;
  type: number;
  position_x: number;
  position_y: number;
  is_start_node: number;
  answers: ChatbotFlowAnswer[];
};

export type ChatbotQuestionDetail = {
  status: string;
  message: string;
  data: {
    id: number;
    content: string;
    type: number;
    position_x: number;
    position_y: number;
    is_start_node: number;
    answers: ChatbotAnswer[];
  };
};

export type ChatbotQuestionDetailPayload = {
  id: number;
  content: string;
  type: number;
  position_x: number;
  position_y: number;
  is_start_node: number;
  answers: ChatbotAnswer[];
};

export type QuestionDeleteDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  target?: ChatbotRecord | null;
  isLoading?: boolean;
};

export type FlowDeleteDialogState = {
  isOpen: boolean;
  answerId: number | null;
  questionId: number | null;
  answerLabel?: string;
  questionLabel?: string;
};

export type PendingRemoval = {
  answerId: number;
  sourceQuestionId: number | null;
  targetQuestionId: number | null;
  payload: UpdateChatbotLineFlowPayload;
  removeAnswer: boolean;
};

export type AnswerDisplay = {
  id: number;
  content: string;
};

export type NodeData = {
  questionId: number;
  content: string;
  isStartNode: boolean;
  questionType: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (target: ChatbotRecord) => void;
  translations: {
    view: string;
    edit: string;
    delete: string;
  };
  answersLabel: string;
  noAnswersLabel: string;
  answers: AnswerDisplay[];
  borderColor: string;
  headerBackground: string;
  headerClass: string;
  idBadgeClass: string;
  startTagClass: string;
  questionTextClass: string;
  answersContainerClass: string;
  answersLabelClass: string;
  answersIconClass: string;
  answerCardClass: string;
  sourceHandleClass: string;
  targetHandleClass: string;
  isHighlighted?: boolean;
};

export type QuestionEdgeData = {
  answerId: number;
  nextQuestionId: number | null;
  answerLabel?: string;
  questionLabel?: string;
};

export interface ChatbotMessage {
  id: string;
  type: "question" | "answer";
  question?: ChatbotQuestionDetailPayload;
  answerContent?: string;
  createdAt: Date;
}

export interface UsePublicChatbotOptions { 
  type?: number;
}

export type PublicChatbotProps = {
  onClose?: () => void;
};

  export interface ReactChatbotKitProps {
    config: any;
    messageParser: any;
    actionProvider: any;
    headerText?: string;
    placeholderText?: string;
    messageHistory?: any[];
    validator?: (message: string) => boolean;
    disableScrollToBottom?: boolean;
    runInitialMessages?: boolean;
  }