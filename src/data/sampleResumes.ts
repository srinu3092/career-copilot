export interface PresetResume {
  id: string;
  name: string;
  role: string;
  fileName: string;
  fileSize: string;
  content: string;
}

export const SAMPLE_RESUMES: PresetResume[] = [
  {
    id: 'arch-1',
    name: 'Jane Doe (Solutions Architect)',
    role: 'Senior Solutions Architect',
    fileName: 'jdoe_resume_2024.pdf',
    fileSize: '1.2 MB',
    content: `JANE DOE
San Francisco, CA | (555) 019-2834 | jane.doe@example.com | linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Experienced Solutions Architect with 7+ years in enterprise cloud systems, distributed architecture, and legacy migration. Proven track record delivering resilient infrastructure on AWS and collaborating with DevOps teams.

CORE SKILLS
- Cloud Platforms: Amazon Web Services (EC2, S3, RDS, Lambda, CloudFormation)
- Languages: Python, Bash, SQL, Java
- Methodologies: Agile / Scrum, Incident Management, Disaster Recovery
- Architecture: Microservices, REST APIs, CI/CD, Containerization (Docker)

WORK EXPERIENCE
Lead Cloud Engineer | Apex Global Technologies | 2021 – Present
- Helped team migrate 40+ legacy on-premise workloads to AWS cloud environment.
- Managed database maintenance scripts and cloud storage backups with high availability.
- Worked on optimizing cloud bill costs by identifying idle EC2 instances and provisioning reserved instances.
- Assisted with security patch rollouts across Linux server fleets.

Systems Engineer | Nova Tech Labs | 2018 – 2021
- Maintained Docker containerized microservices and automated deployment scripts.
- Configured Nginx load balancers and SSL certificates for high-traffic customer portal.
- Monitored application uptime using Prometheus and CloudWatch alerts.

EDUCATION & CERTIFICATIONS
B.S. in Computer Science | University of California, Berkeley
AWS Certified Solutions Architect – Associate`,
  },
  {
    id: 'dev-1',
    name: 'Alex Chen (Full Stack Developer)',
    role: 'Senior Full Stack Developer',
    fileName: 'achen_fullstack_2024.pdf',
    fileSize: '950 KB',
    content: `ALEX CHEN
Seattle, WA | alex.chen@example.com | github.com/alexchen | (555) 392-8812

SUMMARY
Full Stack Engineer with 6 years experience building modern web apps with TypeScript, React, Node.js, and PostgreSQL. Passionate about performant UI and clean API design.

SKILLS
- Frontend: React, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, Webpack
- Backend: Node.js, Express, PostgreSQL, Redis, REST APIs, GraphQL
- Tools & Cloud: Docker, Git, Jest, AWS S3, GitHub Actions

EXPERIENCE
Senior Frontend / Full Stack Developer | Horizon Digital | 2021 – Present
- Helped rebuild core SaaS application dashboard using React and TypeScript.
- Worked on improving frontend bundle size and web vitals across key landing pages.
- Managed integration of third-party payment gateway and webhook notification pipeline.
- Collaborated with UX team to standardize design system component tokens.

Software Engineer | Pulse Media Apps | 2018 – 2021
- Developed RESTful endpoints using Node.js and PostgreSQL for real-time analytics engine.
- Implemented user authentication with JWT and role-based access permissions.
- Wrote unit and integration test suites using Jest with 85% code coverage.

EDUCATION
B.S. in Software Engineering | University of Washington`,
  },
  {
    id: 'pm-1',
    name: 'Sarah Miller (Product Manager)',
    role: 'Senior Product Manager',
    fileName: 'smiller_product_2024.pdf',
    fileSize: '1.4 MB',
    content: `SARAH MILLER
New York, NY | sarah.miller@example.com | linkedin.com/in/sarahmiller

SUMMARY
Data-driven Senior Product Manager with 8+ years leading cross-functional teams across fintech and B2B SaaS. Expert in user research, discovery, roadmap prioritization, and growth experimentation.

EXPERIENCE
Senior Product Manager | Veloce Financial | 2021 – Present
- Led cross-functional squad of 12 engineers, 2 designers, and QA across core checkout experience.
- Defined product roadmap and executed quarterly OKRs aligned with executive revenue goals.
- Conducted 50+ customer discovery interviews to synthesize critical workflow bottlenecks.
- Championed design system adoption across consumer web and mobile apps.

Product Manager | BlueSky Cloud | 2018 – 2021
- Managed feature backlog and sprint planning ceremonies using Jira.
- Launched team collaboration workspace tier adopted by 12,000+ business accounts.
- Analyzed product telemetry using Amplitude and Mixpanel to evaluate cohort retention.

EDUCATION
B.A. in Economics & Communication | Columbia University`,
  },
];
