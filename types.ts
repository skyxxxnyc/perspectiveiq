
export enum View {
  Dashboard = 'DASHBOARD',
  Search = 'SEARCH',
  Contacts = 'CONTACTS',
  Companies = 'COMPANIES',
  Tasks = 'TASKS',
  Pipeline = 'PIPELINE',
  Sequences = 'SEQUENCES',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  Integrations = 'INTEGRATIONS',
  Territory = 'TERRITORY',
  Roleplay = 'ROLEPLAY',
  PitchLab = 'PITCH_LAB',
}

export interface PitchScript {
    hook: string;
    valueProp: string;
    callToAction: string;
    fullText: string;
}

export interface VideoAsset {
    id: string;
    uri: string;
    prompt: string;
    createdAt: string;
}

export interface RoleplayScenario {
    id: string;
    title: string;
    difficulty: 'Entry' | 'Advanced' | 'Elite';
    description: string;
    persona: string;
    objectives: string[];
}

export enum ContactStatus {
    New = 'New',
    Contacted = 'Contacted',
    Replied = 'Replied',
    MeetingBooked = 'Meeting Booked',
    NotInterested = 'Not Interested',
}

export enum PipelineStage {
  New = 'New',
  Discovery = 'Discovery',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'Closed - Won',
  ClosedLost = 'Closed - Lost',
}

export interface ContactEnrichment {
    recentPost?: string;
    keyInterests?: string[];
    communicationStyle?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  title: string;
  companyName: string;
  location: string;
  linkedinUrl: string;
  status: ContactStatus;
  enrolledInSequenceId?: string;
  currentSequenceStep?: number;
  sequenceStartDate?: string;
  enrichment?: ContactEnrichment;
  leadScore?: number;
  scoreAnalysis?: string;
}

export interface CompanyEnrichment {
    funding?: string;
    techStack?: string[];
    recentNews?: string;
    estimatedRevenue?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  description: string;
  enrichment?: CompanyEnrichment;
}

export enum Priority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  contactId?: string;
  companyId?: string;
  projectId?: string;
  dueDate: string;
  subtasks: Subtask[];
}

export interface ProjectTemplateStep {
  dayOffset: number;
  title: string;
  priority: Priority;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  steps: ProjectTemplateStep[];
}

export interface Project {
  id: string;
  name: string;
  templateId: string;
  companyId?: string;
  contactId?: string;
  startDate: string;
  status: 'Active' | 'Completed' | 'On Hold';
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: PipelineStage;
  contactId: string;
  companyName: string;
  expectedCloseDate: string;
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export type ProspectGenerationResult = {
  contacts: Contact[];
  companies: Company[];
}

export enum SequenceStepType {
    Email = 'Email',
    Call = 'Call',
    LinkedIn = 'LinkedIn Connection Request',
}

export interface SequenceStep {
    day: number;
    type: SequenceStepType;
    templateName: string;
    content?: string;
}

export interface Sequence {
    id: string;
    name: string;
    description: string;
    steps: SequenceStep[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
  author: string;
}
