// Curated overrides for the projects index. `repo` must match the GitHub
// repo name exactly, src/lib/github.ts merges these with live repo data
// (stars, primary language, last-pushed date). Only repos listed here are
// shown, in the order listed (see `order`).
//
// Keep this list short. Six entries that each say something is worth more
// than a dozen that pad it out; add a new one when it earns the slot, and
// drop whatever it displaces.
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
  /**
   * The honest reason this exists. It's the most personal line on the site,
   * so it should sound spoken rather than written.
   *
   * Careful with first person on collaborative work: the research projects
   * were done with other people, so those lines credit the group and stick
   * to the shared question rather than claiming the result.
   */
  why?: string;
  order: number;
}

export const curatedProjects: CuratedProject[] = [
  {
    repo: 'can-dashboard',
    title: 'Virtual CAN Bus',
    blurb:
      'A simulated automotive CAN bus built entirely in software, no car and no transceiver involved. Three C++ ECU nodes publish engine RPM, coolant temperature and wheel speed onto a virtual SocketCAN interface at realistic cycle rates, each running as its own process and container. PyQt instrument cluster and fault injection are in progress.',
    tech: ['C++', 'SocketCAN', 'CMake', 'Docker', 'Linux'],
    why:
      "Cars run on CAN and I kept reading about it instead of understanding it, so I built one on a Linux box.",
    order: 1,
  },
  {
    repo: 'Game-cpp-qt',
    title: 'Skyward',
    blurb:
      'A 2D arcade shooter built with C++/Qt6 QML. Collision pipeline uses a uniform-grid spatial hash: 72x fewer per-frame AABB tests and 8.7x lower collision time than an exhaustive sweep at 1,000-bullet x 2,000-enemy load.',
    tech: ['C++', 'Qt6', 'QML', 'CMake'],
    why:
      "I wanted to find where the C++ and QML boundary starts to hurt. Turns out you can push it further than expected.",
    order: 2,
  },
  {
    repo: 'ORBIT',
    title: 'ORBIT',
    blurb:
      'Blockchain-based IoT routing protocol for smart city networks using Proof-of-Routing consensus, UCB1 multi-armed-bandit adaptive routing, and anomaly detection. Under review at IEEE TNSM.',
    tech: ['Solidity', 'JavaScript', 'Python'],
    demo: 'https://orbit-inky-nine.vercel.app',
    why:
      "A group project, built around one question: can routing decisions be trustless without also being slow?",
    order: 3,
  },
  {
    repo: 'FABRICS',
    title: 'FABRIC',
    blurb:
      'Post-quantum federated learning over blockchain with resilient IPFS storage for cyber log analysis. Pairs a federated training pipeline with on-chain coordination and cryptanalysis notebooks. Under review at the Journal of Network and Systems Management, Springer.',
    tech: ['Python', 'Solidity', 'Federated Learning', 'IPFS'],
    why:
      "Another group project. The uncomfortable question behind it: what happens to federated learning once the cryptography underneath it stops holding?",
    order: 4,
  },
  {
    repo: 'RAG-Model',
    title: 'Document RAG',
    blurb:
      'Ask questions about PDFs and get cited answers. Hybrid dense + BM25 retrieval, cross-encoder reranking, vision-model figure captioning, and a streamed chat UI with clickable page citations.',
    tech: ['Next.js', 'FastAPI', 'Qdrant', 'Redis', 'Python'],
    demo: 'https://rag-model-rho.vercel.app',
    why:
      "Every RAG demo I tried felt like guessing, so I built one where a retrieval change can actually be measured.",
    order: 5,
  },
  {
    repo: 'lms',
    title: 'Loan Management System',
    blurb:
      'Full-stack lending platform with a borrower portal and an operations dashboard for loan lifecycle management.',
    tech: ['Next.js', 'Express', 'MongoDB', 'JWT'],
    demo: 'https://lms-frontend-weld-phi.vercel.app',
    why:
      "Half-built CRUD apps teach you nothing, so I did the whole lending flow: borrower side, operations side, the messy middle.",
    order: 6,
  },
  {
    repo: 'smart-home-ml-rl',
    title: 'Smart Home Energy AI',
    blurb:
      'Reinforcement-learning energy optimization system integrating 3 supervised ML models in a Gymnasium environment: 26.4% simulated energy reduction, 98% comfort rating, 97.8% occupancy-prediction accuracy.',
    tech: ['Python', 'PyTorch', 'Reinforcement Learning', 'Flask'],
    image: '/projects/smart-home.png',
    why:
      "I wanted to know whether an RL agent could cut energy use without making the house unpleasant to live in.",
    order: 7,
  },
  {
    repo: 'LoRA-Fine-Tuning-for-LLM-Models',
    title: 'LoRA Fine-Tuning',
    blurb:
      'Low-Rank Adaptation applied to a pre-trained LLM: injects small trainable matrices instead of retraining the full network, with side-by-side base and fine-tuned outputs so the behaviour change is visible rather than asserted.',
    tech: ['Python', 'PyTorch', 'Transformers', 'LoRA'],
    why:
      "Full fine-tuning was never going to fit on hardware I own, so I wanted to see how much you actually give up by training a fraction of the weights.",
    order: 8,
  },
  {
    repo: 'cyber-cipher',
    title: 'CyberCipher',
    blurb:
      'Cryptographic analysis suite: quantum-safe key generation, RC4/ChaCha20 stream ciphers, Shannon-entropy vulnerability detection, and interactive frequency/entropy visualizations.',
    tech: ['Next.js', 'TypeScript', 'Cryptography'],
    image: '/projects/cyber-cipher.png',
    demo: 'https://cyber-cypher.vercel.app/',
    why:
      "Built while learning stream ciphers. Entropy is much easier to understand once you can watch it move.",
    order: 9,
  },
  {
    repo: 'FTIR-dashborad',
    title: 'FTIR Dashboard',
    blurb:
      'FTIR spectroscopy analysis platform: automated peak detection, functional-group annotation, and polymer identification against known spectral signatures.',
    tech: ['Next.js', 'FastAPI', 'Python', 'Plotly'],
    image: '/projects/ftir.png',
    why:
      "A real lab problem that deserved better than a spreadsheet.",
    order: 10,
  },
  {
    repo: 'credit-management-backend',
    title: 'Credit Approval System',
    blurb:
      'Django REST Framework backend for customer registration, credit scoring, and loan eligibility, with Celery background tasks and Docker containerization.',
    tech: ['Django', 'REST Framework', 'Celery', 'Docker'],
    image: '/projects/credit.png',
    why:
      "I wanted to build the boring parts properly: scoring, background jobs, containers. The things that break in production.",
    order: 11,
  },
  {
    repo: 'Kaleidoscope',
    title: 'Kaleidoscope',
    blurb:
      'Streamlit app that turns uploaded images into symmetrical, psychedelic kaleidoscope patterns with adjustable segment count and colormap effects.',
    tech: ['Python', 'OpenCV', 'Streamlit'],
    image: '/projects/kaleidoscope.gif',
    why:
      "No reason at all. It just looked cool.",
    order: 12,
  },
];
