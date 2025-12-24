
import { Contact, Company, ContactStatus, Task, Deal, PipelineStage, Sequence, SequenceStepType, Priority, ProjectTemplate } from './types';

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Eleanor Vance',
    email: 'eleanor.v@nexustech.io',
    title: 'VP of Engineering',
    companyName: 'Nexus Technologies',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/eleanorvance',
    status: ContactStatus.Contacted,
    leadScore: 85,
  },
  {
    id: 'c2',
    name: 'Marcus Holloway',
    email: 'm.holloway@innovateinc.com',
    title: 'Product Manager',
    companyName: 'Innovate Inc.',
    location: 'New York, NY',
    linkedinUrl: 'https://linkedin.com/in/marcusholloway',
    status: ContactStatus.New,
    enrolledInSequenceId: 'seq1',
    currentSequenceStep: 2,
    sequenceStartDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    leadScore: 42,
  },
   {
    id: 'c3',
    name: 'Isabella Rossi',
    email: 'isabella.r@quantumanalytics.co',
    title: 'Data Scientist',
    companyName: 'Quantum Analytics',
    location: 'Boston, MA',
    linkedinUrl: 'https://linkedin.com/in/isabellarossi',
    status: ContactStatus.Replied,
    leadScore: 92,
  },
  {
    id: 'c4',
    name: 'Javier Morales',
    email: 'j.morales@synergycorp.net',
    title: 'Head of Sales',
    companyName: 'Synergy Corp',
    location: 'Chicago, IL',
    linkedinUrl: 'https://linkedin.com/in/javiermorales',
    status: ContactStatus.MeetingBooked,
    leadScore: 98,
  },
];

export const MOCK_COMPANIES: Company[] = [
  {
    id: 'co1',
    name: 'Nexus Technologies',
    industry: 'SaaS',
    size: '201-500 employees',
    location: 'San Francisco, CA',
    website: 'nexustech.io',
    description: 'Cloud infrastructure and developer tools.',
  },
  {
    id: 'co2',
    name: 'Innovate Inc.',
    industry: 'FinTech',
    size: '51-200 employees',
    location: 'New York, NY',
    website: 'innovateinc.com',
    description: 'Personal finance and investment platform.',
  },
  {
    id: 'co3',
    name: 'Quantum Analytics',
    industry: 'Big Data',
    size: '501-1000 employees',
    location: 'Boston, MA',
    website: 'quantumanalytics.co',
    description: 'AI-driven business intelligence solutions.',
  },
  {
    id: 'co4',
    name: 'Synergy Corp',
    industry: 'Enterprise Software',
    size: '1001-5000 employees',
    location: 'Chicago, IL',
    website: 'synergycorp.net',
    description: 'CRM and sales automation software.',
  },
];

export const MOCK_PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'pt1',
    name: 'Enterprise Client Onboarding',
    description: 'Standard 30-day workflow for transitioning a new enterprise account.',
    steps: [
      { dayOffset: 1, title: 'Kickoff Call with Stakeholders', priority: Priority.High },
      { dayOffset: 5, title: 'Technical Requirements Audit', priority: Priority.Medium },
      { dayOffset: 10, title: 'User Training Session A', priority: Priority.Medium },
      { dayOffset: 15, title: 'User Training Session B', priority: Priority.Medium },
      { dayOffset: 25, title: 'Security & Compliance Handover', priority: Priority.High },
      { dayOffset: 30, title: 'First Month Success Review', priority: Priority.High },
    ]
  },
  {
    id: 'pt2',
    name: 'Strategic Partnership Kickoff',
    description: 'Framework for high-stakes co-marketing and integration partnerships.',
    steps: [
      { dayOffset: 1, title: 'Partnership Agreement Finalization', priority: Priority.High },
      { dayOffset: 7, title: 'Go-To-Market Alignment Meeting', priority: Priority.Medium },
      { dayOffset: 14, title: 'Joint Press Release Draft', priority: Priority.Low },
      { dayOffset: 21, title: 'Integration Technical Beta', priority: Priority.High },
    ]
  },
  {
    id: 'pt3',
    name: 'QBR Prep Work',
    description: 'Preparation checklist for a Quarterly Business Review.',
    steps: [
      { dayOffset: 0, title: 'Gather Usage Data & Metrics', priority: Priority.Medium },
      { dayOffset: 2, title: 'Draft QBR Presentation Deck', priority: Priority.Medium },
      { dayOffset: 4, title: 'Internal Stakeholder Review', priority: Priority.Low },
      { dayOffset: 7, title: 'Deliver QBR to Client Executive', priority: Priority.High },
    ]
  }
];

export const MOCK_TASKS: Task[] = [
    {
        id: 't1',
        title: 'Follow up with Eleanor about Q3 budget',
        description: 'Need to confirm if the budget for the new tool has been approved.',
        completed: false,
        priority: Priority.High,
        contactId: 'c1',
        companyId: 'co1',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        subtasks: [
            { id: 'st1-1', title: 'Email Eleanor', completed: false },
            { id: 'st1-2', title: 'Prepare updated quote', completed: true },
        ],
    },
    {
        id: 't2',
        title: "Sequence 1/3 (Cold Outreach): Initial Intro",
        completed: true,
        priority: Priority.Medium,
        contactId: 'c2',
        companyId: 'co2',
        dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split('T')[0],
        subtasks: [],
    }
];

export const MOCK_DEALS: Deal[] = [
    {
        id: 'd1',
        title: 'Nexus Tech - Q4 Platform Upgrade',
        value: 75000,
        stage: PipelineStage.Proposal,
        contactId: 'c1',
        companyName: 'Nexus Technologies',
        expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
        priority: 'High',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
    },
    {
        id: 'd2',
        title: 'Innovate Inc. - Mobile SDK Integration',
        value: 42000,
        stage: PipelineStage.Discovery,
        contactId: 'c2',
        companyName: 'Innovate Inc.',
        expectedCloseDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString().split('T')[0],
        priority: 'Medium',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    }
];

export const MOCK_SEQUENCES: Sequence[] = [
    {
        id: 'seq1',
        name: 'Cold Outreach - 5 Touches',
        description: 'A 5-step sequence for initial outreach to cold prospects.',
        steps: [
            { day: 0, type: SequenceStepType.Email, templateName: 'Initial Intro', content: "Hi {{name}}, I've been following {{company}} and noticed your recent expansion into AI. I'd love to show you how ProspectIQ can help your sales team find more relevant leads." },
            { day: 3, type: SequenceStepType.Email, templateName: 'Follow-up & Case Study', content: "Hi {{name}}, just following up on my previous note. Thought you might be interested in how Synergy Corp increased their pipeline by 40% using our platform." },
            { day: 7, type: SequenceStepType.LinkedIn, templateName: 'Connect on LinkedIn', content: "Hi {{name}}, I saw we have a few mutual connections in the SaaS space. Looking forward to connecting!" },
            { day: 10, type: SequenceStepType.Email, templateName: 'Quick Question', content: "Hi {{name}}, I'll keep this brief: are you open to a 10-minute demo this Thursday? Cheers." },
            { day: 14, type: SequenceStepType.Call, templateName: 'Final Follow-up Call', content: "Discovery call to gauge interest and handle objections. Goal: Book a proper demo." },
        ],
    }
];
