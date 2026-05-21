'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import Link from 'next/link'
import BrainAnatomy from './BrainAnatomy'
import { ToolChip, ToolCandidateRow } from './ToolMarks'

type Slide = {
  id: string
  kind: 'cover' | 'section' | 'standard' | 'exercise' | 'closer'
  render: () => ReactNode
}


const slides: Slide[] = [
  {
    id: 'cover',
    kind: 'cover',
    render: () => (
      <div className="deck-cover">
        <div className="deck-eyebrow">ThreePoint × Fourth Wall</div>
        <h1 className="deck-h1">Workshop 2</h1>
        <p className="deck-lede">Designing the workflows</p>
        <div className="deck-meta-row">
          <span>Monday — week of 11 May 2026</span>
          <span>·</span>
          <span>201 Borough High Street</span>
        </div>
        <div className="deck-hint">Press → to begin</div>
      </div>
    ),
  },
  {
    id: 'where-we-are',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Where we are</div>
        <h2 className="deck-h2">Three weeks in.</h2>
        <div className="deck-journey">
          <div className="deck-journey-step deck-journey-step-done">
            <span className="deck-journey-num">01</span>
            <span className="deck-journey-label">Discover</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step deck-journey-step-done">
            <span className="deck-journey-num">02</span>
            <span className="deck-journey-label">Map the lifecycle</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step deck-journey-step-now">
            <span className="deck-journey-num">03</span>
            <span className="deck-journey-label">Design the workflows</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step">
            <span className="deck-journey-num">04</span>
            <span className="deck-journey-label">Roadmap</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'warm-up',
    kind: 'cover',
    render: () => (
      <div className="deck-cover">
        <div className="deck-eyebrow deck-eyebrow-orange">Warm-up</div>
        <h1 className="deck-h1">Smallest smile.</h1>
      </div>
    ),
  },
  {
    id: 'recap',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Quick recap</div>
        <h2 className="deck-h2">Five phases. Fourteen stages.</h2>
        <div className="phase-recap">
          <div className="phase-recap-row">
            <div className="phase-recap-label"><span className="phase-recap-num">01</span><span className="phase-recap-name">Lead intake</span></div>
            <div className="phase-recap-stages">01 Request · 02 Info gathering</div>
          </div>
          <div className="phase-recap-row">
            <div className="phase-recap-label"><span className="phase-recap-num">02</span><span className="phase-recap-name">Strategic positioning</span></div>
            <div className="phase-recap-stages">03 Brief review (internal) · 04 New / Existing / Competing</div>
          </div>
          <div className="phase-recap-row">
            <div className="phase-recap-label"><span className="phase-recap-num">03</span><span className="phase-recap-name">Creative cycle</span></div>
            <div className="phase-recap-stages">05 Client ideation · 06 Concept ideation · 07 Concept development · 08 Concept creating · 09 Concept creative dev</div>
          </div>
          <div className="phase-recap-row phase-recap-row-focus">
            <div className="phase-recap-label"><span className="phase-recap-num">04</span><span className="phase-recap-name">Operationalisation</span></div>
            <div className="phase-recap-stages">10 Logistics &amp; Planning · 11 Training &amp; release</div>
          </div>
          <div className="phase-recap-row">
            <div className="phase-recap-label"><span className="phase-recap-num">05</span><span className="phase-recap-name">Delivery &amp; close</span></div>
            <div className="phase-recap-stages">12 Event days · 13 Debrief · 14 Merchandise / Marketing</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'prework-headlines',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">What you said in pre-work</div>
        <h2 className="deck-h2">Two things to land today.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 10 }}>
          <div className="deck-tile" style={{ borderLeft: '3px solid #f46c42', paddingLeft: 22 }}>
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Logistics &amp; Planning is the priority</div>
            <div className="deck-tile-meta" style={{ marginTop: 8 }}>
              Five of six of you voted to deep-dive Stage 10. Founder, BD, Production, both Client Leads — convergent. That&rsquo;s where the leverage is and that&rsquo;s where we go first.
            </div>
            <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244, 108, 66, 0.85)' }}>
              5 / 6 votes
            </div>
          </div>
          <div className="deck-tile" style={{ borderLeft: '3px solid #c59f4d', paddingLeft: 22 }}>
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">The tool stack needs decisions, not options</div>
            <div className="deck-tile-meta" style={{ marginTop: 8 }}>
              Chat, email, decks, costing — already consensus. The real fragmentation sits in two places: where actions get tracked, and which AI does what. Both need a single answer the room can stand behind.
            </div>
            <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(197, 159, 77, 0.9)' }}>
              Open it up · close it down
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'framework-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">01</div>
        <h2 className="deck-section-title">How AI actually works</h2>
        <div className="deck-section-meta">Two ideas. Twenty minutes. Then we use them.</div>
      </div>
    ),
  },
  {
    id: 'rag-explainer',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Quick framework — RAG</div>
        <h2 className="deck-h2">The model doesn’t know your stuff.</h2>
        <p className="deck-body">Retrieval-Augmented Generation. The LLM is generic — trained on the public internet up to a cut-off. To make it useful for FW work, you fetch the right context from somewhere you trust and pass it in alongside the question.</p>
        <div className="deck-three-up">
          <div className="deck-tile">
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Retrieve</div>
            <div className="deck-tile-meta">Pull the right docs, briefs, history, brand voice.</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">Augment</div>
            <div className="deck-tile-meta">Stitch them into the prompt as context.</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">03</div>
            <div className="deck-tile-title">Generate</div>
            <div className="deck-tile-meta">Let the model answer using your context.</div>
          </div>
        </div>
        <p className="deck-footnote">If the right context can’t be retrieved, the answer can’t be right. That’s why where you store things matters.</p>
      </div>
    ),
  },
  {
    id: 'ai-brain-intro',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div className="deck-eyebrow">The agentic loop</div>
        <h2 className="deck-h2">An AI worker has a brain.</h2>
        <div style={{ width: '100%', maxWidth: 460, margin: '0 auto' }}>
          <BrainAnatomy showLabels={false} showSynapses />
        </div>
        <p className="deck-footnote">Four parts. Get one wrong and the loop breaks.</p>
      </div>
    ),
  },
  {
    id: 'ai-brain',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">The AI brain — four parts</div>
        <h2 className="deck-h2">Memory. Thinking. Deciding. Creating.</h2>
        <div className="brain-stage">
          <div className="brain-svg-wrap">
            <BrainAnatomy showLabels showSynapses />
          </div>
          <div className="brain-legend">
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#7902f3' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#7902f3' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Memory</div>
                <div className="brain-legend-title">Where we store</div>
                <div className="brain-legend-region-name">Hippocampus &amp; temporal lobe</div>
                <div className="brain-legend-tools">
                  <ToolChip id="drive" size="sm" />
                  <ToolChip id="notion" size="sm" />
                  <ToolChip id="sheets" size="sm" />
                </div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Thinking</div>
                <div className="brain-legend-title">Where it reasons</div>
                <div className="brain-legend-region-name">Frontal cortex</div>
                <div className="brain-legend-tools">
                  <ToolChip id="chatgpt" size="sm" />
                  <ToolChip id="claude" size="sm" />
                  <ToolChip id="gemini" size="sm" />
                </div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Deciding</div>
                <div className="brain-legend-title">Where actions live</div>
                <div className="brain-legend-region-name">Prefrontal &amp; cingulate</div>
                <div className="brain-legend-tools">
                  <ToolChip id="monday" size="sm" />
                  <ToolChip id="productive" size="sm" />
                  <ToolChip id="sheets" size="sm" />
                </div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Creating</div>
                <div className="brain-legend-title">Where it enacts</div>
                <div className="brain-legend-region-name">Motor cortex &amp; cerebellum</div>
                <div className="brain-legend-tools">
                  <span className="brain-tool-chip">Skills</span>
                  <span className="brain-tool-chip">Agents</span>
                  <span className="brain-tool-chip">Tools</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-brain-mapping',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Why it matters today</div>
        <h2 className="deck-h2">Today’s decisions are brain decisions.</h2>
        <div className="brain-stage">
          <div className="brain-svg-wrap">
            <BrainAnatomy showLabels={false} showSynapses pulseHighlight />
          </div>
          <div>
            <p className="deck-body" style={{ marginBottom: 14 }}>
              Every choice on the agenda lights up a different part of the brain. Get them all set and the loop runs without us. Leave any one ambiguous and it stalls.
            </p>
            <div className="brain-mapping">
              <div className="brain-mapping-row">
                <span>Action-tracking decision</span>
                <span className="brain-mapping-arrow">→</span>
                <span className="brain-mapping-target brain-mapping-target-deciding">Deciding</span>
              </div>
              <div className="brain-mapping-row">
                <span>AI assistance by task</span>
                <span className="brain-mapping-arrow">→</span>
                <span className="brain-mapping-target brain-mapping-target-thinking">Thinking</span>
              </div>
              <div className="brain-mapping-row">
                <span>Where context lives</span>
                <span className="brain-mapping-arrow">→</span>
                <span className="brain-mapping-target brain-mapping-target-memory">Memory</span>
              </div>
              <div className="brain-mapping-row">
                <span>Workflows we design</span>
                <span className="brain-mapping-arrow">→</span>
                <span className="brain-mapping-target brain-mapping-target-creating">Creating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-brain-question',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">The question for today</div>
        <h2 className="deck-h2">Pick one core tool per part of the brain.</h2>
        <p className="deck-body" style={{ marginBottom: 14 }}>
          We&rsquo;re going to map the first three together — Memory, Thinking, Deciding. The fourth — Creating — is the compositional layer we get to last: the skills, agents and tools we orchestrate on top.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ToolCandidateRow
            region="thinking"
            label="Thinking — your default LLM"
            ids={['chatgpt', 'claude', 'gemini']}
          />
          <ToolCandidateRow
            region="deciding"
            label="Deciding — where actions live"
            ids={['monday', 'productive', 'sheets']}
          />
          <ToolCandidateRow
            region="memory"
            label="Memory — where context lives, by stage"
            ids={['drive', 'notion', 'sheets', 'docs']}
          />
          <ToolCandidateRow
            region="creating"
            label="Creating — skills, agents, tools (Block 4)"
            ids={['powerpoint', 'docs', 'sheets', 'read', 'granola', 'base44']}
          />
        </div>
        <p className="deck-footnote">One default per part. Outliers allowed — but named, with a reason.</p>
      </div>
    ),
  },
  {
    id: 'lp-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">02</div>
        <h2 className="deck-section-title">Logistics &amp; Planning</h2>
        <div className="deck-section-meta">Stage 10. Where 5 of 6 of you said to go deep.</div>
      </div>
    ),
  },
  {
    id: 'lp-current',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Where we are today</div>
        <h2 className="deck-h2">Stage 10, broken down — and the tools you reach for.</h2>
        <p className="deck-body" style={{ marginBottom: 12 }}>From Workshop 1 stickies and the discovery interviews. This is the live picture, not a future state.</p>
        <div className="lp-current-grid">
          <div className="lp-current-cell">
            <div className="lp-current-task">Costing &amp; quoting</div>
            <div className="lp-current-tools">
              <ToolChip id="sheets" size="sm" />
            </div>
            <div className="lp-current-note">Manual, error-prone, formula risk.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Production schedule</div>
            <div className="lp-current-tools">
              <ToolChip id="monday" size="sm" />
              <ToolChip id="sheets" size="sm" />
            </div>
            <div className="lp-current-note">Mixed — depends on the account.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Run of show</div>
            <div className="lp-current-tools">
              <ToolChip id="powerpoint" size="sm" />
              <ToolChip id="docs" size="sm" />
            </div>
            <div className="lp-current-note">Built fresh each time.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Supplier briefs &amp; comms</div>
            <div className="lp-current-tools">
              <ToolChip id="gmail" size="sm" />
              <ToolChip id="docs" size="sm" />
            </div>
            <div className="lp-current-note">Lives in inboxes.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">H&amp;S / method statements</div>
            <div className="lp-current-tools">
              <ToolChip id="docs" size="sm" />
            </div>
            <div className="lp-current-note">Fully manual today.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Equipment &amp; resourcing</div>
            <div className="lp-current-tools">
              <ToolChip id="sheets" size="sm" />
              <ToolChip id="monday" size="sm" />
            </div>
            <div className="lp-current-note">No single source of truth.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Budget tracking</div>
            <div className="lp-current-tools">
              <ToolChip id="sheets" size="sm" />
            </div>
            <div className="lp-current-note">Recosted late, often.</div>
          </div>
          <div className="lp-current-cell">
            <div className="lp-current-task">Internal updates &amp; chat</div>
            <div className="lp-current-tools">
              <ToolChip id="gchat" size="sm" />
            </div>
            <div className="lp-current-note">Actions get lost in threads.</div>
          </div>
        </div>
        <p className="deck-footnote">Eight tasks. Six tools. No single home.</p>
      </div>
    ),
  },
  {
    id: 'b2-canvas',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">The canvas</div>
        <h2 className="deck-h2">Every workflow is four brain decisions.</h2>
        <div className="brain-canvas">
          <div className="brain-canvas-flow">
            <div className="brain-canvas-flow-cell">
              <span>Trigger</span>
              <small>What kicks the stage off?</small>
            </div>
            <div className="brain-canvas-flow-arrow">→</div>
            <div className="brain-canvas-flow-cell">
              <span>Steps</span>
              <small>3–5, no more.</small>
            </div>
            <div className="brain-canvas-flow-arrow">→</div>
            <div className="brain-canvas-flow-cell">
              <span>Output</span>
              <small>What does the next stage get?</small>
            </div>
          </div>
          <div className="brain-canvas-cell brain-canvas-cell-memory">
            <div className="brain-canvas-cell-head">
              <span className="brain-canvas-cell-region">Memory</span>
              <span className="brain-canvas-cell-tag">Where context lives</span>
            </div>
            <p className="brain-canvas-cell-q">Where does this stage&rsquo;s information sit so the next person — or the AI — can find it?</p>
            <div className="brain-canvas-cell-tools">
              <ToolChip id="drive" size="sm" />
              <ToolChip id="notion" size="sm" />
              <ToolChip id="sheets" size="sm" />
            </div>
          </div>
          <div className="brain-canvas-cell brain-canvas-cell-thinking">
            <div className="brain-canvas-cell-head">
              <span className="brain-canvas-cell-region">Thinking</span>
              <span className="brain-canvas-cell-tag">Which AI</span>
            </div>
            <p className="brain-canvas-cell-q">Which LLM does the reasoning here, and what does it need to know to be useful?</p>
            <div className="brain-canvas-cell-tools">
              <ToolChip id="chatgpt" size="sm" />
              <ToolChip id="claude" size="sm" />
              <ToolChip id="gemini" size="sm" />
            </div>
          </div>
          <div className="brain-canvas-cell brain-canvas-cell-deciding">
            <div className="brain-canvas-cell-head">
              <span className="brain-canvas-cell-region">Deciding</span>
              <span className="brain-canvas-cell-tag">Where the action sits</span>
            </div>
            <p className="brain-canvas-cell-q">When this stage is done, where does the next action get logged so it isn&rsquo;t lost?</p>
            <div className="brain-canvas-cell-tools">
              <ToolChip id="monday" size="sm" />
              <ToolChip id="productive" size="sm" />
              <ToolChip id="sheets" size="sm" />
            </div>
          </div>
          <div className="brain-canvas-cell brain-canvas-cell-creating">
            <div className="brain-canvas-cell-head">
              <span className="brain-canvas-cell-region">Creating</span>
              <span className="brain-canvas-cell-tag">Owner + skill</span>
            </div>
            <p className="brain-canvas-cell-q">Who owns it? What skill, agent or tool produces the output?</p>
            <div className="brain-canvas-cell-tools">
              <ToolChip id="docs" size="sm" />
              <ToolChip id="powerpoint" size="sm" />
              <ToolChip id="read" size="sm" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'b2-design',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Exercise · 50 min · whole room</div>
        <h2 className="deck-h2">Design L&amp;P end-to-end.</h2>
        <p className="deck-body" style={{ marginBottom: 6 }}>Walk the brain canvas one box at a time. Be specific.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          <span className="region-badge region-badge-memory"><span className="region-badge-dot" />Memory</span>
          <span className="region-badge region-badge-thinking"><span className="region-badge-dot" />Thinking</span>
          <span className="region-badge region-badge-deciding"><span className="region-badge-dot" />Deciding</span>
          <span className="region-badge region-badge-creating"><span className="region-badge-dot" />Creating</span>
        </div>
        <ul className="deck-rules">
          <li>Ben leads, others build. Pick a real upcoming campaign as the worked example.</li>
          <li><strong>Memory:</strong> what context does this stage need, and where does it actually live today vs where should it live?</li>
          <li><strong>Thinking:</strong> name every agentic moment — which LLM, with what context, doing what?</li>
          <li><strong>Deciding:</strong> where does the next action get logged? Same place every time.</li>
          <li>Address Camilla&rsquo;s tour-planning question explicitly: how does this scale to Deloitte 60?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'b2-report',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Discussion · 25 min</div>
        <h2 className="deck-h2">Pressure-test it.</h2>
        <ul className="deck-rules">
          <li>Where would this break? Which client would push back?</li>
          <li>Where does context leak — what does the next stage not get cleanly?</li>
          <li>Capture spikes as we go: what would we need to build to prove this works?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tasks-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">03</div>
        <h2 className="deck-section-title">Your tasks, your tools</h2>
        <div className="deck-section-meta">An individual exercise — then we land on Monday.</div>
      </div>
    ),
  },
  {
    id: 'individual-mapping',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow deck-eyebrow-orange">Exercise · 8 min solo, then 12 min group</div>
        <h2 className="deck-h2">On stickies — what you do, what you reach for, where it lives.</h2>
        <p className="deck-body" style={{ marginBottom: 12 }}>
          Three columns each. We&rsquo;ll put them on the wall and look across the room together.
        </p>
        <div className="task-mapping-grid">
          <div className="task-mapping-col task-mapping-col-thinking">
            <div className="task-mapping-num">01</div>
            <div className="task-mapping-head">Tasks you own</div>
            <div className="task-mapping-q">In a typical campaign — what do you actually do? List the recurring tasks. One per sticky.</div>
          </div>
          <div className="task-mapping-col task-mapping-col-deciding">
            <div className="task-mapping-num">02</div>
            <div className="task-mapping-head">Tools you reach for</div>
            <div className="task-mapping-q">Next to each task — which tool do you actually open first? Honest answer, not the official one.</div>
          </div>
          <div className="task-mapping-col task-mapping-col-memory">
            <div className="task-mapping-num">03</div>
            <div className="task-mapping-head">Where it gets collected</div>
            <div className="task-mapping-q">Where does the output of that task end up? Drive folder? Inbox? Sheet? Lost?</div>
          </div>
        </div>
        <p className="deck-footnote">Group review: which tasks have a home, which don&rsquo;t, and where the same task lives in three different places.</p>
      </div>
    ),
  },
  {
    id: 'monday-process',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span className="region-badge region-badge-deciding"><span className="region-badge-dot" />Deciding</span>
          <span className="deck-eyebrow" style={{ marginBottom: 0 }}>The Monday question</span>
        </div>
        <h2 className="deck-h2">What needs to be true for Monday to actually work?</h2>
        <p className="deck-body" style={{ marginBottom: 14 }}>
          We&rsquo;re not asking &ldquo;Monday or not&rdquo; — we&rsquo;re asking &ldquo;what would have to be true for it to be the home, every time?&rdquo; Five gates. Walk them.
        </p>
        <div className="monday-flow">
          <div className="monday-flow-step">
            <div className="monday-flow-num">01</div>
            <div className="monday-flow-name">Capture</div>
            <div className="monday-flow-q">What triggers a new item? Who creates it? Within how long?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">02</div>
            <div className="monday-flow-name">Review</div>
            <div className="monday-flow-q">Who validates it&rsquo;s real? On what cadence — daily standup, weekly?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">03</div>
            <div className="monday-flow-name">Approval</div>
            <div className="monday-flow-q">What needs sign-off before it progresses? By whom?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">04</div>
            <div className="monday-flow-name">Action</div>
            <div className="monday-flow-q">Who picks it up? Where do updates go — same place, same field?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">05</div>
            <div className="monday-flow-name">Close</div>
            <div className="monday-flow-q">What defines done? Who confirms? What gets archived where?</div>
          </div>
        </div>
        <p className="deck-footnote">If we can answer all five clearly — Monday becomes the home. If we can&rsquo;t — we know exactly what to fix or replace.</p>
      </div>
    ),
  },
  {
    id: 'b4-action-tracking',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span className="region-badge region-badge-deciding"><span className="region-badge-dot" />Deciding</span>
          <span className="deck-eyebrow" style={{ marginBottom: 0 }}>Decision 1 — action tracking</span>
        </div>
        <h2 className="deck-h2">Monday, Productive, or commit-with-ownership.</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <ToolChip id="monday" />
          <ToolChip id="productive" />
          <ToolChip id="sheets" />
        </div>
        <div className="deck-fork">
          <div className="deck-fork-side">
            <div className="deck-fork-label">Re-commit</div>
            <div className="deck-fork-detail">Monday becomes the SoT. L&amp;P lives on it. Everyone trained. XLS retired. One named owner.</div>
          </div>
          <div className="deck-fork-vs">/</div>
          <div className="deck-fork-side">
            <div className="deck-fork-label">Replace</div>
            <div className="deck-fork-detail">Productive (Mark&rsquo;s already demoed it) — costing/quoting baked in. Migration date set today.</div>
          </div>
        </div>
        <p className="deck-footnote">Mark walks the team through what he saw in the Productive demo. Then we decide.</p>
      </div>
    ),
  },
  {
    id: 'b4-ai-stack',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <span className="region-badge region-badge-thinking"><span className="region-badge-dot" />Thinking</span>
          <span className="region-badge region-badge-memory"><span className="region-badge-dot" />Memory</span>
          <span className="deck-eyebrow" style={{ marginBottom: 0 }}>Decision 2 — AI assistance by task</span>
        </div>
        <h2 className="deck-h2">Which tool, for what?</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ToolCandidateRow
            region="thinking"
            label="Drafting briefs"
            ids={['docs', 'claude', 'chatgpt']}
          />
          <ToolCandidateRow
            region="thinking"
            label="Asking AI"
            ids={['chatgpt', 'claude', 'gemini', 'base44']}
          />
          <ToolCandidateRow
            region="memory"
            label="Meeting capture"
            ids={['read', 'granola', 'docs']}
          />
          <ToolCandidateRow
            region="memory"
            label="Storing research"
            ids={['drive', 'notion', 'docs']}
          />
        </div>
        <p className="deck-footnote">One default per task. Outliers allowed — but named, with a reason.</p>
      </div>
    ),
  },
  {
    id: 'parking-lot',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Parking lot review</div>
        <h2 className="deck-h2">What we said we&rsquo;d come back to.</h2>
        <p className="deck-body" style={{ marginBottom: 14 }}>
          These came up in pre-work and through the day. Not landing them today — but naming where each one goes.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="parking-row">
            <div className="parking-row-topic">AI ethics &amp; client confidentiality</div>
            <div className="parking-row-arrow">→</div>
            <div className="parking-row-home">Separate training session — JP to schedule with Camilla.</div>
          </div>
          <div className="parking-row">
            <div className="parking-row-topic">AI moodboarding</div>
            <div className="parking-row-arrow">→</div>
            <div className="parking-row-home">Mark to define what &ldquo;good&rdquo; looks like before we tool it.</div>
          </div>
          <div className="parking-row">
            <div className="parking-row-topic">External creatives in concept dev</div>
            <div className="parking-row-arrow">→</div>
            <div className="parking-row-home">Revisit once the core stack is set — Workshop 4 territory.</div>
          </div>
          <div className="parking-row">
            <div className="parking-row-topic">BD → Client-Lead handover</div>
            <div className="parking-row-arrow">→</div>
            <div className="parking-row-home">Mark + Camilla offline conversation. Not a workshop topic.</div>
          </div>
          <div className="parking-row">
            <div className="parking-row-topic">Skills, agents &amp; tools — the &ldquo;Creating&rdquo; layer</div>
            <div className="parking-row-arrow">→</div>
            <div className="parking-row-home">Workshop 3. Once Memory, Thinking and Deciding are set.</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'questions',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
        <div className="deck-eyebrow">Questions</div>
        <h1 className="deck-h1" style={{ marginTop: 8 }}>What&rsquo;s still unclear?</h1>
        <p className="deck-body deck-body-large" style={{ marginTop: 18, maxWidth: 720 }}>
          Anything we haven&rsquo;t addressed. Anything you&rsquo;d challenge. Anything missing from the picture before we move into the build.
        </p>
        <p className="deck-footnote deck-footnote-spaced">No bad questions. Surface them now — they&rsquo;re harder to raise once the roadmap lands.</p>
      </div>
    ),
  },
  {
    id: 'next-steps',
    kind: 'closer',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Next steps</div>
        <h2 className="deck-h2">What happens between now and Workshop 3.</h2>
        <div className="next-steps-list">
          <div className="next-steps-row">
            <div className="next-steps-when">This week</div>
            <div className="next-steps-what">
              <div className="next-steps-title">v2 of the L&amp;P workflow drafted</div>
              <div className="next-steps-detail">JP turns today&rsquo;s canvas + the five Monday gates into a written workflow. Circulated for sign-off.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Next week</div>
            <div className="next-steps-what">
              <div className="next-steps-title">Monday rebuild on the capture → close framework</div>
              <div className="next-steps-detail">One named owner reconfigures Monday around the five gates. AUP v0.1 circulated alongside.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Next 14 days</div>
            <div className="next-steps-what">
              <div className="next-steps-title">Spike on a live campaign</div>
              <div className="next-steps-detail">Run the new workflow end-to-end on one upcoming project. JP joins the kickoff. Captured learnings feed Workshop 3.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Workshop 3</div>
            <div className="next-steps-what">
              <div className="next-steps-title">Skills, agents &amp; tools — the Creating layer</div>
              <div className="next-steps-detail">With Memory, Thinking and Deciding set, we design the compositional layer that produces the work. Date TBC.</div>
            </div>
          </div>
        </div>
        <p className="deck-footnote deck-footnote-spaced">Thank you — this is the most useful workshop we&rsquo;ve had so far.</p>
      </div>
    ),
  },
]

export default function DeckPage() {
  const [i, setI] = useState(0)
  const total = slides.length
  const [gridView, setGridView] = useState(false)

  const next = useCallback(() => setI(v => Math.min(v + 1, total - 1)), [total])
  const prev = useCallback(() => setI(v => Math.max(v - 1, 0)), [])
  const toggleGrid = useCallback(() => setGridView(v => !v), [])
  const jumpTo = useCallback((idx: number) => {
    setI(idx)
    setGridView(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G' || e.key === 'Escape') {
        e.preventDefault()
        toggleGrid()
        return
      }
      if (gridView) return // navigation keys disabled in grid view
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        prev()
      } else if (e.key === 'Home') {
        e.preventDefault()
        setI(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        setI(total - 1)
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) document.exitFullscreen()
        else document.documentElement.requestFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, total, toggleGrid, gridView])

  const slide = slides[i]

  return (
    <div className="deck">
      {gridView ? (
        <div className="deck-grid" role="dialog" aria-label="Slide sorter">
          <div className="deck-grid-header">
            <div>
              <div className="deck-grid-title">All slides</div>
              <div className="deck-grid-meta">{total} slides · click to jump · press G or Esc to close</div>
            </div>
            <button onClick={toggleGrid} className="deck-exit" aria-label="Close slide sorter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="deck-grid-scroll">
            <div className="deck-grid-list">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  className={`deck-thumb ${idx === i ? 'deck-thumb-current' : ''}`}
                  onClick={() => jumpTo(idx)}
                  aria-label={`Jump to slide ${idx + 1}: ${s.id}`}
                >
                  <div className="deck-thumb-frame">
                    <div className="deck-thumb-inner" aria-hidden>
                      <div className={`deck-slide deck-slide-${s.kind} deck-slide-thumb`}>
                        {s.render()}
                      </div>
                    </div>
                  </div>
                  <div className="deck-thumb-meta">
                    <span className="deck-thumb-num">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="deck-thumb-id">{s.id}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`deck-slide deck-slide-${slide.kind}`} key={slide.id}>
          {slide.render()}
        </div>
      )}

      <div className="deck-chrome-top">
        <div className="deck-brand">ThreePoint · AI Audit Demo · Workshop 2</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleGrid}
            className={`deck-exit deck-grid-toggle ${gridView ? 'deck-grid-toggle-active' : ''}`}
            aria-label={gridView ? 'Close slide sorter' : 'Open slide sorter'}
            title="Slide sorter (G)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <Link href="/" className="deck-exit" aria-label="Exit deck">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Link>
        </div>
      </div>

      {!gridView && (
        <>
          <div className="deck-chrome-bottom">
            <button onClick={prev} disabled={i === 0} className="deck-nav-btn" aria-label="Previous slide">‹</button>
            <span className="deck-counter">{String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
            <button onClick={next} disabled={i === total - 1} className="deck-nav-btn" aria-label="Next slide">›</button>
            <span className="deck-keyhint">← →  ·  G sorter  ·  F fullscreen</span>
          </div>

          <div className="deck-progress" aria-hidden>
            <div className="deck-progress-fill" style={{ width: `${((i + 1) / total) * 100}%` }} />
          </div>
        </>
      )}
    </div>
  )
}
