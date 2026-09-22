import React from 'react';
import { Landmark, Trees, TrendingUp, Compass, Cpu, Calculator } from 'lucide-react';

export default function SubjectBreakdown() {
  const topics = [
    {
      icon: <Landmark size={22} />,
      subject: "Polity & Constitution",
      weightage: "18 - 22 Marks",
      probability: "98% Recurrence",
      themes: [
        "Anti-Defection & Tenth Schedule Presiding Officer Writs",
        "Recent 7-Judge & 9-Judge Constitution Bench Doctrines",
        "Electoral Bonds Ruling & Election Commission Appointments",
        "Inter-State River Disputes & Federal Fiscal Autonomy"
      ]
    },
    {
      icon: <Trees size={22} />,
      subject: "Environment & Climate",
      weightage: "24 - 28 Marks",
      probability: "Highest Yield",
      themes: [
        "Blue Carbon Sequestration & Indian Coastal Wetland Sinks",
        "IUCN Red List 2024-25: Critically Endangered Fauna Additions",
        "Carbon Credit Trading Scheme (CCTS) 2023 Architecture",
        "Biodiversity Act 2023 Amendments & Access Benefit Sharing"
      ]
    },
    {
      icon: <TrendingUp size={22} />,
      subject: "Economy & Fiscal Policy",
      weightage: "20 - 24 Marks",
      probability: "High Analytical",
      themes: [
        "Incremental Capital Output Ratio (ICOR) & Productive Capex",
        "RBI Liquidity Adjustment Facility & SDF Replacement Shifts",
        "External Debt Composition & Central Bank Digital Currency (CBDC)",
        "Food Subsidy Rationalization & MSP Pricing Equations"
      ]
    },
    {
      icon: <Compass size={22} />,
      subject: "History & Art/Culture",
      weightage: "16 - 20 Marks",
      probability: "Pattern Shift",
      themes: [
        "Tribal & Peasant Insurgencies (1750-1920) High-Frequency Matrix",
        "Bhakti & Sufi Philosophical Texts & Royal Epigraphs",
        "Indus Valley Civilization: New Rakhigarhi DNA Telemetry",
        "Temple Architecture: Kalinga vs Vesara Sub-styles"
      ]
    },
    {
      icon: <Cpu size={22} />,
      subject: "Science, Tech & Space",
      weightage: "14 - 18 Marks",
      probability: "Current Driven",
      themes: [
        "National Quantum Mission & Quantum Key Distribution (QKD)",
        "Small Modular Nuclear Reactors (SMRs) & Thorium Fuel Cycle",
        "Generative AI, Deepfakes & Digital Personal Data Protection",
        "ISRO Space Docking Experiment (SPADEX) & Gaganyaan"
      ]
    },
    {
      icon: <Calculator size={22} />,
      subject: "CSAT Paper 2 Trap-Buster",
      weightage: "Guaranteed 67+",
      probability: "Qualifying Anchor",
      themes: [
        "Permutation & Combination: 'Zero-Math' Logic Shortcuts",
        "Reading Comprehension: 'Inference' vs 'Crux' vs 'Assumption'",
        "Number Systems: Remainder Theorems & Unit Digit Frameworks",
        "Logical Deductions & Syllogism Elimination Rulebook"
      ]
    }
  ];

  return (
    <section className="section" id="topics">
      <div className="container">
        <div className="section-header">
          <span className="badge badge-gold">High-Yield Syllabus Mapping</span>
          <h2 className="section-title">
            The Predicted Core: 6 Domains That Determine the Cut-off
          </h2>
          <p className="section-desc">
            UPSC Prelims is not an ocean of random knowledge. 70% of the questions consistently originate from specific regulatory, constitutional, and ecological pivots.
          </p>
        </div>

        <div className="topics-grid">
          {topics.map((t, idx) => (
            <div key={idx} className="topic-card">
              <div className="topic-header">
                <div className="topic-icon-wrap">{t.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>{t.subject}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 600 }}>
                      {t.weightage}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                      {t.probability}
                    </span>
                  </div>
                </div>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {t.themes.map((th, thIdx) => (
                  <li key={thIdx} style={{ fontSize: '0.875rem', color: '#cbd5e1', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--gold-primary)', lineHeight: 1.4 }}>›</span>
                    <span>{th}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
