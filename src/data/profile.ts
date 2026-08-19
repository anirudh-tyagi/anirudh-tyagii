// Single source of truth for resume/experience/skills content.
// Consumed by the About page, the chatbot facts sheet, and (eventually)
// anywhere else on the site that needs these facts. Keep this in sync
// with public/resume/Anirudh-Tyagi-Resume.pdf.

export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  duration: string;
  details: string[];
}

export interface EducationEntry {
  school: string;
  degree: string;
  duration: string;
  cgpa: string;
  coursework: string[];
}

export interface Achievement {
  title: string;
  meta?: string;
  description: string;
}

export interface Publication {
  citation: string;
  status: string;
}

export const personalInfo = {
  name: 'Anirudh Tyagi',
  title: 'Software Developer | AI/ML Engineer',
  email: 'anirudhtyagi188@gmail.com',
  summary:
    "I'm a software developer working mainly in systems: C++, Qt, and the kind of code that has to be right rather than clever. Alongside that I spend a lot of time in machine learning and distributed systems, which is where most of my research has ended up. What I care about is the part that's hard to fake — software that holds up under load, behaves sensibly at the edges, and still makes sense to whoever opens it six months later.",
  interests: [
    'Systems Programming',
    'Artificial Intelligence',
    'Product Development',
    'Sports',
  ],
};

export const education: EducationEntry = {
  school: 'Sai University',
  degree: 'B.Tech in Computing and Data Science',
  duration: 'Sep 2022 – May 2026',
  cgpa: '7.7',
  coursework: [
    'Machine Learning',
    'Deep Learning',
    'Reinforcement Learning',
    'Artificial Intelligence',
    'Data Structures & Algorithms',
    'Speech and Image Analysis',
    'Bioinformatics',
    'Software Engineering',
    'DBMS',
    'Data Analysis and Visualization',
  ],
};

export const experience: ExperienceEntry[] = [
  {
    company: 'Cadence Design Systems',
    role: 'Software Engineer Intern',
    location: 'Noida, India',
    duration: 'Jan 2026 – Jun 2026',
    details: [
      'Expanded into C++/Qt 5 product development for Allegro System Capture, an EDA application on the Allegro R&D team, using modern C++, STL, and OOP principles.',
      'Implemented a real-time schematic world-view widget with live viewport synchronization, supporting 9+ concurrent design workspaces.',
      'Built an overhauled docking framework with deferred state restoration, 30 ms response time, orientation-aware resizing, and context-aware toolbar visibility.',
      'Designed a cryptographically secured expiry validation module for early-access builds using asymmetric digital signatures and authenticated encryption, delivering <10ms end-to-end validation latency, plus a companion CLI for generating signed license artifacts.',
    ],
  },
  {
    company: 'Cadence Design Systems',
    role: 'Software Engineer Trainee',
    location: 'Noida, India',
    duration: 'Jun 2025 – Aug 2025',
    details: [
      'Implemented Python/Flask-based ML data pipelines for Allegro R&D workflows, automating extraction and processing of 10k multi-level CCR archives and cleaning 40 TB of schematic data.',
      'Engineered connectivity-aware graph representations using BFS/DFS traversal for ML-based component placement, achieving 91% model accuracy.',
      'Integrated inference workflows with Allegro applications through socket-based communication, delivering predictions in 100ms.',
    ],
  },
  {
    company: 'National Institute of Ocean Technology',
    role: 'Research Intern',
    location: 'Chennai, India',
    duration: 'Jul 2024 – Sep 2024',
    details: [
      'Processed and analyzed 18 TB of deep-sea metagenomic data through a bioinformatics pipeline of de novo assembly, BLAST homology search, and multi-sequence alignment.',
      'Identified candidate microbial genes with potential industrial biotechnology applications.',
    ],
  },
];

export const skills = {
  languages: ['C++', 'C', 'Python', 'Julia', 'Tcl'],
  web: ['JavaScript', 'TypeScript', 'HTML/CSS', 'SQL'],
  frameworks: ['STL', 'Flask', 'Django', 'Node.js', 'Qt 5.0/6', 'PyQt', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'OpenCV'],
  tools: ['Git', 'Perforce', 'AWS', 'Docker', 'CMake', 'Jupyter Notebook', 'Jira', 'RHEL'],
  domains: [
    'Machine Learning',
    'Deep Learning',
    'Reinforcement Learning',
    'Feature Engineering',
    'Model Evaluation',
    'Data Processing',
  ],
};

export const publications: Publication[] = [
  {
    citation:
      'Behl D., Tyagi A., Kandhoul N., Dhurandher S. "Post Quantum Federated Learning and Blockchain with Resilient IPFS for Cyber Logs (FABRIC)"',
    status: 'Under review, Journal of Network and Systems Management, Springer',
  },
  {
    citation:
      'Tyagi A., Behl D. "Optimized Routing via Blockchain and Intelligent Edge-Cloud Architecture (ORBIT)"',
    status: 'Under review, Transactions on Network and Service Management, IEEE',
  },
];

export const achievements: Achievement[] = [
  {
    title: 'Cadence India Hackathon',
    meta: '2025',
    description:
      'Presented BLINC, a decentralized log analysis system integrating federated learning, blockchain (PoS), and IPFS.',
  },
  {
    title: 'Sports Society President',
    meta: 'Sai University, 2022–2023',
    description: 'Managed student activities and coordinated internal sports events and budgets.',
  },
];

export const links = {
  portfolio: 'https://anirudhtyagi.vercel.app/',
  github: 'https://github.com/anirudh-tyagi',
  linkedin: 'https://linkedin.com/in/itsanirudhtyagi',
};
