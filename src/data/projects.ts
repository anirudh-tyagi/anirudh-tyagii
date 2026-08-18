// Curated overrides for the projects grid. `repo` must match the GitHub
// repo name exactly — src/lib/github.ts merges these with live repo data
// (stars, primary language, last-pushed date). Only repos listed here are
// shown, in the order listed (see `order`).
//
// Descriptions and tech lists below were checked against each repo's
// README; keep them in sync when a project changes materially.

export interface CuratedProject {
  repo: string;
  title: string;
  blurb: string;
  tech: string[];
  image?: string;
  demo?: string;
  order: number;
}

export const curatedProjects: CuratedProject[] = [
  {
    repo: 'RAG-Model',
    title: 'Document RAG',
    blurb:
      'Ask questions about PDFs and get cited answers. Hybrid dense + BM25 retrieval, cross-encoder reranking, vision-model figure captioning, and a streamed chat UI with clickable page citations.',
    tech: ['Next.js', 'FastAPI', 'Qdrant', 'Redis', 'Python'],
    demo: 'https://rag-model-rho.vercel.app',
    order: 1,
  },
  {
    repo: 'Game-cpp-qt',
    title: 'Skyward',
    blurb:
      'A 2D arcade shooter built with C++/Qt6 QML. Collision pipeline uses a uniform-grid spatial hash — 72x fewer per-frame AABB tests and 8.7x lower collision time than an exhaustive sweep at 1,000-bullet x 2,000-enemy load.',
    tech: ['C++', 'Qt6', 'QML', 'CMake'],
    order: 2,
  },
  {
    repo: 'ORBIT',
    title: 'ORBIT',
    blurb:
      'Blockchain-based IoT routing protocol for smart city networks using Proof-of-Routing consensus, UCB1 multi-armed-bandit adaptive routing, and anomaly detection. Under review at IEEE TNSM.',
    tech: ['Solidity', 'JavaScript', 'Python'],
    demo: 'https://orbit-inky-nine.vercel.app',
    order: 3,
  },
  {
    repo: 'lms',
    title: 'Loan Management System',
    blurb:
      'Full-stack lending platform with a borrower portal and an operations dashboard for loan lifecycle management.',
    tech: ['Next.js', 'Express', 'MongoDB', 'JWT'],
    demo: 'https://lms-frontend-weld-phi.vercel.app',
    order: 4,
  },
  {
    repo: 'smart-home-ml-rl',
    title: 'Smart Home Energy AI',
    blurb:
      'Reinforcement-learning energy optimization system integrating 3 supervised ML models in a Gymnasium environment: 26.4% simulated energy reduction, 98% comfort rating, 97.8% occupancy-prediction accuracy.',
    tech: ['Python', 'PyTorch', 'Reinforcement Learning', 'Flask'],
    image: '/projects/smart-home.png',
    order: 5,
  },
  {
    repo: 'cyber-cipher',
    title: 'CyberCipher',
    blurb:
      'Cryptographic analysis suite: quantum-safe key generation, RC4/ChaCha20 stream ciphers, Shannon-entropy vulnerability detection, and interactive frequency/entropy visualizations.',
    tech: ['Next.js', 'TypeScript', 'Cryptography'],
    image: '/projects/cyber-cipher.png',
    demo: 'https://cyber-cypher.vercel.app/',
    order: 6,
  },
  {
    repo: 'FTIR-dashborad',
    title: 'FTIR Dashboard',
    blurb:
      'FTIR spectroscopy analysis platform: automated peak detection, functional-group annotation, and polymer identification against known spectral signatures.',
    tech: ['Next.js', 'FastAPI', 'Python', 'Plotly'],
    image: '/projects/ftir.png',
    order: 7,
  },
  {
    repo: 'credit-management-backend',
    title: 'Credit Approval System',
    blurb:
      'Django REST Framework backend for customer registration, credit scoring, and loan eligibility, with Celery background tasks and Docker containerization.',
    tech: ['Django', 'REST Framework', 'Celery', 'Docker'],
    image: '/projects/credit.png',
    order: 8,
  },
  {
    repo: 'Kaleidoscope',
    title: 'Kaleidoscope',
    blurb:
      'Streamlit app that turns uploaded images into symmetrical, psychedelic kaleidoscope patterns with adjustable segment count and colormap effects.',
    tech: ['Python', 'OpenCV', 'Streamlit'],
    image: '/projects/kaleidoscope.gif',
    order: 9,
  },
];
