import { InterviewerPersona } from '../../types.ts';

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    roleTitle: 'Senior Staff Bar Raiser & Eng Director',
    company: 'Ex-Google / Stripe',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'FAANG Bar Raiser',
    accentColor: '#4f46e5', // indigo-600
    voiceGender: 'female',
    description: 'Specializes in high-bar architectural decisions, cross-functional leadership, and deep STAR evaluation.',
    specialty: 'Distributed Systems & Leadership',
  },
  {
    id: 'marcus-vance',
    name: 'Dr. Marcus Vance',
    roleTitle: 'VP of Systems Architecture',
    company: 'Ex-Amazon / AWS',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    badge: 'System Design Lead',
    accentColor: '#0284c7', // sky-600
    voiceGender: 'male',
    description: 'Probes deeply into scalability trade-offs, fault-tolerance, database sharding, and latency optimization.',
    specialty: 'System Scalability & Cloud Resiliency',
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    roleTitle: 'Head of Product Management',
    company: 'Ex-Apple / Airbnb',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Product & Strategy Lead',
    accentColor: '#0d9488', // teal-600
    voiceGender: 'female',
    description: 'Tests user empathy, North Star metrics, product execution, and high-stakes stakeholder alignment.',
    specialty: 'Product Execution & GTM Strategy',
  },
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    roleTitle: 'Executive Talent Partner & Culture Coach',
    company: 'Ex-Netflix / Meta',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    badge: 'Executive Coach',
    accentColor: '#9333ea', // purple-600
    voiceGender: 'female',
    description: 'Evaluates executive presence, culture-add, handling ambiguous conflicts, and strategic vision.',
    specialty: 'Behavioral & Leadership Principles',
  },
];
