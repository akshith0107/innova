import type { VerificationResult, VerificationPipelineStep } from '../types/pramaan';

export const PIPELINE_STEPS: VerificationPipelineStep[] = [
  {
    id: 1,
    name: 'User Query',
    label: 'Query Interception',
    sublabel: 'Zero-latency capture',
    iconName: 'Terminal',
    description: 'PRAMAAN hook intercepts streaming LLM response tokens directly at the network client boundary.',
    metrics: '< 1ms latency'
  },
  {
    id: 2,
    name: 'Claim Extraction',
    label: 'Fact Separation',
    sublabel: 'Syntactic parsing',
    iconName: 'Split',
    description: 'Deconstructs raw text streams into discrete verifiable assertions, isolating opinions from factual claims.',
    metrics: '99.4% precision'
  },
  {
    id: 3,
    name: 'Evidence Search',
    label: 'Multi-Repo Fetch',
    sublabel: 'Real-time retrieval',
    iconName: 'Search',
    description: 'Queries academic databases, peer-reviewed journals, global wire services, and open datasets in parallel.',
    metrics: '42 sources/sec'
  },
  {
    id: 4,
    name: 'Source Ranking',
    label: 'Credibility Scoring',
    sublabel: 'PageRank + Peer-Review',
    iconName: 'Award',
    description: 'Ranks candidate evidence based on peer-reviewed authority, citation graph depth, and publisher historical accuracy.',
    metrics: 'Algorithmic weighting'
  },
  {
    id: 5,
    name: 'Debate',
    label: 'Dual AI Adversary',
    sublabel: 'Pro vs Con validation',
    iconName: 'ShieldAlert',
    description: 'Spawns two opposing micro-models: one defending claim validity and one actively searching for refutations.',
    metrics: 'Consensus engine'
  },
  {
    id: 6,
    name: 'Judge',
    label: 'Synthesis & Cross-Ref',
    sublabel: 'Bayesian evaluation',
    iconName: 'Scale',
    description: 'Evaluates empirical weight, cross-references temporal freshness, and calculates mathematical confidence score.',
    metrics: 'Bayesian statistical bound'
  },
  {
    id: 7,
    name: 'Verdict',
    label: 'Trust Seal',
    sublabel: 'Live UI inline overlay',
    iconName: 'CheckCircle2',
    description: 'Injects real-time color badges (Verified, Needs Review, Contradicted) and interactive citation cards into the LLM stream.',
    metrics: 'Instant visual mark'
  }
];

export const NETWORK_NODES = [
  { id: 'who', name: 'WHO', fullName: 'World Health Organization', credibility: 99, category: 'Medical', color: '#10B981', x: 20, y: 30, queryMatch: 'Cardiovascular epidemiology & dietary flavonoid meta-analysis.' },
  { id: 'nasa', name: 'NASA', fullName: 'National Aeronautics and Space Administration', credibility: 100, category: 'Space & Climate', color: '#3B82F6', x: 75, y: 25, queryMatch: 'Satellite Earth telemetry & solar radiation indices.' },
  { id: 'reuters', name: 'Reuters', fullName: 'Reuters News Agency', credibility: 95, category: 'Global Wire', color: '#F59E0B', x: 80, y: 70, queryMatch: 'Fact-check wire report on international clinical trials.' },
  { id: 'nature', name: 'Nature', fullName: 'Nature Publishing Group', credibility: 99, category: 'Peer-Reviewed Journal', color: '#7C3AED', x: 45, y: 45, queryMatch: 'Cellular anti-inflammatory mechanisms of pectin and quercetin.' },
  { id: 'harvard', name: 'Harvard', fullName: 'Harvard School of Public Health', credibility: 98, category: 'Academic Institution', color: '#EC4899', x: 30, y: 75, queryMatch: 'Prospective 25-year cohort study on apple consumption & stroke.' },
  { id: 'openalex', name: 'OpenAlex', fullName: 'OpenAlex Scholarly Index', credibility: 97, category: 'Bibliographic Index', color: '#06B6D4', x: 60, y: 80, queryMatch: 'Citation graph mapping 14,200 dietary epidemiology papers.' },
  { id: 'wikipedia', name: 'Wikipedia', fullName: 'Wikipedia Primary Consensus', credibility: 92, category: 'Community Encyclopedia', color: '#6B7280', x: 15, y: 55, queryMatch: 'Etymological history of 19th-century Welsh aphorisms.' }
];

export const MOCK_VERIFICATION_APPLES: VerificationResult = {
  id: 'pramaan-ver-001',
  query: 'Is it true eating one apple a day keeps the doctor away?',
  llmProvider: 'chatgpt',
  overallTrustScore: 96,
  totalClaims: 3,
  verifiedCount: 2,
  needsReviewCount: 1,
  contradictedCount: 0,
  timestamp: '2026-07-25T12:00:00Z',
  sparklineData: [40, 55, 70, 68, 85, 92, 96],
  claims: [
    {
      id: 'c1',
      text: 'Eating an apple daily reduces risk of cardiovascular disease by 13-15%.',
      status: 'verified',
      confidence: 98,
      explanation: 'Supported by large-scale epidemiologic cohort studies from Harvard T.H. Chan School of Public Health and BMJ meta-analyses tracking over 38,000 women over 10 years.',
      sources: [
        {
          id: 's1',
          name: 'BMJ (British Medical Journal)',
          domain: 'bmj.com',
          title: 'Comparative analysis of statins vs daily apple consumption on vascular mortality',
          snippet: 'Prescribing an apple a day to all adults over 50 in the UK would yield a similar reduction in vascular mortality as statin therapy (approx 8,500 fewer deaths per year).',
          date: '2023-11-14',
          credibilityScore: 98,
          credibilityBadge: 'High',
          url: 'https://bmj.com/content/347/bmj.f7267',
          peerReviewed: true
        },
        {
          id: 's2',
          name: 'Harvard Health Publishing',
          domain: 'health.harvard.edu',
          title: 'Flavonoids and longevity: Apple consumption cohort data',
          snippet: 'High soluble fiber and epicatechin content in apples directly improves endothelial function and systemic inflammation markers.',
          date: '2024-02-01',
          credibilityScore: 96,
          credibilityBadge: 'High',
          url: 'https://health.harvard.edu/apples-cardiovascular',
          peerReviewed: true
        }
      ]
    },
    {
      id: 'c2',
      text: 'Apples completely eliminate the need for physician visits and pharmaceutical prescriptions.',
      status: 'contradicted',
      confidence: 99,
      explanation: 'Literal interpretation is scientifically false. JAMA Internal Medicine study evaluated 8,399 adults and found no statistically significant difference in annual physician visit frequency.',
      sources: [
        {
          id: 's3',
          name: 'JAMA Internal Medicine',
          domain: 'jamanetwork.com',
          title: 'Association Between Apple Consumption and Physician Visits',
          snippet: 'Apple eaters had similar numbers of physician visits compared to non-apple eaters. However, daily apple eaters used significantly fewer prescription medications.',
          date: '2023-05-18',
          credibilityScore: 99,
          credibilityBadge: 'High',
          url: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2210807',
          peerReviewed: true
        }
      ]
    },
    {
      id: 'c3',
      text: 'Pectin fiber in apple skins binds with dietary cholesterol in the gut.',
      status: 'verified',
      confidence: 94,
      explanation: 'Biochemical mechanism verified by Nature Chemical Biology. Soluble pectin forms a viscous matrix that traps bile acids, forcing the liver to draw cholesterol from the bloodstream.',
      sources: [
        {
          id: 's4',
          name: 'Nature Chemical Biology',
          domain: 'nature.com',
          title: 'Polysaccharide trapping of micellar lipids in human intestinal models',
          snippet: 'Apple-derived pectin reduces total serum LDL cholesterol by 7-10% in controlled human intervention trials.',
          date: '2024-01-19',
          credibilityScore: 99,
          credibilityBadge: 'High',
          url: 'https://nature.com/articles/nchembio.2024.11',
          peerReviewed: true
        }
      ]
    }
  ],
  sources: [
    {
      id: 's1',
      name: 'BMJ',
      domain: 'bmj.com',
      title: 'Comparative analysis of statins vs daily apple consumption',
      snippet: 'Prescribing an apple a day yields similar vascular protection to preventive low-dose statins in adults over 50.',
      date: '2023-11-14',
      credibilityScore: 98,
      credibilityBadge: 'High',
      url: 'https://bmj.com',
      peerReviewed: true
    },
    {
      id: 's3',
      name: 'JAMA Internal Medicine',
      domain: 'jamanetwork.com',
      title: 'Association Between Apple Consumption and Physician Visits',
      snippet: 'Evaluating 8,399 participants: no decrease in physician visit count, but 12% lower prescription drug dependence.',
      date: '2023-05-18',
      credibilityScore: 99,
      credibilityBadge: 'High',
      url: 'https://jamanetwork.com',
      peerReviewed: true
    },
    {
      id: 's4',
      name: 'Nature',
      domain: 'nature.com',
      title: 'Polysaccharide trapping of micellar lipids',
      snippet: 'Pectin trapping mechanism validated in double-blind gut biome trial.',
      date: '2024-01-19',
      credibilityScore: 99,
      credibilityBadge: 'High',
      url: 'https://nature.com',
      peerReviewed: true
    }
  ],
  debateTranscript: {
    advocate: 'Advocate Micro-Model: The aphorism holds strong scientific backing regarding lipid profile improvement, reduced stroke incidence, and anti-glycemia via flavonoid concentration.',
    skeptic: 'Skeptic Micro-Model: The literal claim "keeps the doctor away" is contradicted by empirical JAMA hospital data (p=0.42). It must be flagged as an idiomatic hyperbole.',
    judge: 'Bayesian Synthesis Judge: Verdict assigned as 96% contextual trust. Claims 1 and 3 are verified by peer-reviewed literature. Claim 2 is classified as literal contradiction / hyperbole.'
  },
  finalVerdict: 'PARTIALLY VERIFIED (High Clinical Support for Health Benefits, Literal Aphorism Contradicted by JAMA Cohort Data).'
};

export const PRESET_WORKSPACE_SAMPLES: VerificationResult[] = [
  MOCK_VERIFICATION_APPLES,
  {
    id: 'pramaan-ver-002',
    query: 'Did NASA discover liquid water oceans underneath Jupiter satellite Europa in 2025?',
    llmProvider: 'claude',
    overallTrustScore: 91,
    totalClaims: 2,
    verifiedCount: 2,
    needsReviewCount: 0,
    contradictedCount: 0,
    timestamp: '2026-07-25T10:30:00Z',
    sparklineData: [20, 45, 65, 80, 88, 90, 91],
    claims: [
      {
        id: 'c21',
        text: 'Europa Clipper spacecraft confirmed plume venting containing organic carbon chains.',
        status: 'verified',
        confidence: 95,
        explanation: 'Spectroscopic measurements from NASA Europa Clipper SUDA instrument detected carbon-rich aerosol plumes.',
        sources: [
          {
            id: 's21',
            name: 'NASA Jet Propulsion Laboratory',
            domain: 'jpl.nasa.gov',
            title: 'Europa Clipper Initial Surface Analysis Report',
            snippet: 'Mass spectrometer data confirms organic compounds and water ice vapor ejection from southern pole crevasses.',
            date: '2025-09-12',
            credibilityScore: 100,
            credibilityBadge: 'High',
            url: 'https://jpl.nasa.gov/news/europa-clipper-update'
          }
        ]
      }
    ],
    sources: [
      {
        id: 's21',
        name: 'NASA JPL',
        domain: 'jpl.nasa.gov',
        title: 'Europa Clipper Surface Analysis',
        snippet: 'Mass spectrometer data confirms organic compounds.',
        date: '2025-09-12',
        credibilityScore: 100,
        credibilityBadge: 'High',
        url: 'https://jpl.nasa.gov'
      }
    ],
    debateTranscript: {
      advocate: 'Advocate: JPL telemetric press releases support organic compounds detection in Europa plume samples.',
      skeptic: 'Skeptic: Plume composition does not directly prove complex biological life, only prebiotic chemical precursors.',
      judge: 'Judge: Verified factually accurate regarding NASA observations.'
    },
    finalVerdict: 'VERIFIED HIGH CONFIDENCE (100% NASA JPL Telemetric Support).'
  },
  {
    id: 'pramaan-ver-003',
    query: 'Is room-temperature ambient pressure superconductivity achieved in LK-99 variants?',
    llmProvider: 'deepseek',
    overallTrustScore: 24,
    totalClaims: 3,
    verifiedCount: 0,
    needsReviewCount: 1,
    contradictedCount: 2,
    timestamp: '2026-07-24T18:15:00Z',
    sparklineData: [90, 70, 40, 30, 25, 24, 24],
    claims: [
      {
        id: 'c31',
        text: 'LK-99 exhibits zero electrical resistance at 293 Kelvin.',
        status: 'contradicted',
        confidence: 99,
        explanation: 'Replicated trials by Max Planck Institute and Argonne National Lab proved apparent resistivity drops were caused by copper sulfide (Cu2S) phase transition artifacts.',
        sources: [
          {
            id: 's31',
            name: 'Nature News',
            domain: 'nature.com',
            title: 'LK-99 is not a superconductor: How ferromagnetic impurities tricked scientists',
            snippet: 'Single-crystal synthesis isolated pure Pb9Cu(PO4)6O and demonstrated it is an insulator, not a superconductor.',
            date: '2023-08-16',
            credibilityScore: 99,
            credibilityBadge: 'High',
            url: 'https://nature.com/articles/d41586-023-02585-7'
          }
        ]
      }
    ],
    sources: [
      {
        id: 's31',
        name: 'Nature',
        domain: 'nature.com',
        title: 'LK-99 refutation by single crystal synthesis',
        snippet: 'Insulator behavior proven across 14 independent international lab attempts.',
        date: '2023-08-16',
        credibilityScore: 99,
        credibilityBadge: 'High',
        url: 'https://nature.com'
      }
    ],
    debateTranscript: {
      advocate: 'Advocate: Initial preprints claimed levitation and zero resistivity.',
      skeptic: 'Skeptic: 14 independent tier-1 research institutions failed to replicate zero resistance. Ferromagnetism and Cu2S impurities fully explain phenomena.',
      judge: 'Judge: Contradicted. High confidence refutation based on peer-reviewed physical chemistry.'
    },
    finalVerdict: 'CONTRADICTED (Factual Claim Refuted by Global Experimental Replications).'
  }
];
