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
        <div className="deck-eyebrow">ThreePoint</div>
        <h1 className="deck-h1">The 4AI Brain</h1>
        <p className="deck-lede">An AI readiness audit for your organisation</p>
        <div className="deck-meta-row">
          <span>Facilitated by James Poulter</span>
          <span>·</span>
          <span>ThreePoint</span>
        </div>
        <div className="deck-hint">Press → to begin</div>
      </div>
    ),
  },
  {
    id: 'how-audit-works',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">What we're doing today</div>
        <h2 className="deck-h2">We're going to map your AI brain.</h2>
        <p className="deck-body">Every organisation that uses AI has four distinct systems at work — whether they know it or not. Memory, Thinking, Deciding, and Creating. Today we audit all four: where they're strong, where they're absent, and where the gaps are costing you time.</p>
        <div className="deck-journey">
          <div className="deck-journey-step deck-journey-step-now">
            <span className="deck-journey-num">01</span>
            <span className="deck-journey-label">Memory</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step">
            <span className="deck-journey-num">02</span>
            <span className="deck-journey-label">Thinking</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step">
            <span className="deck-journey-num">03</span>
            <span className="deck-journey-label">Deciding</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step">
            <span className="deck-journey-num">04</span>
            <span className="deck-journey-label">Creating</span>
          </div>
          <div className="deck-journey-arrow">→</div>
          <div className="deck-journey-step">
            <span className="deck-journey-num">05</span>
            <span className="deck-journey-label">Synthesis</span>
          </div>
        </div>
        <p className="deck-footnote">Honest answers matter more than impressive ones.</p>
      </div>
    ),
  },
  {
    id: 'rag-explainer',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Quick framework — RAG</div>
        <h2 className="deck-h2">The model doesn't know your stuff.</h2>
        <p className="deck-body">Retrieval-Augmented Generation. The LLM is generic — trained on the public internet up to a cut-off. To make it useful for your work, you fetch the right context from somewhere you trust and pass it in alongside the question.</p>
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
        <p className="deck-footnote">If the right context can't be retrieved, the answer can't be right. That's why where you store things matters.</p>
      </div>
    ),
  },
  {
    id: 'ai-brain-overview',
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
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Thinking</div>
                <div className="brain-legend-title">Where it reasons</div>
                <div className="brain-legend-region-name">Frontal cortex</div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Deciding</div>
                <div className="brain-legend-title">Where actions live</div>
                <div className="brain-legend-region-name">Prefrontal &amp; cingulate</div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Creating</div>
                <div className="brain-legend-title">Where it enacts</div>
                <div className="brain-legend-region-name">Motor cortex &amp; cerebellum</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'memory-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">01</div>
        <h2 className="deck-section-title">Memory</h2>
        <div className="deck-section-meta">Where your organisation stores what it knows.</div>
      </div>
    ),
  },
  {
    id: 'memory-what-it-is',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Memory — Hippocampus &amp; temporal lobe</div>
        <h2 className="deck-h2">Where does your context live?</h2>
        <p className="deck-body">Your AI is only as good as the context you can give it. Memory is the layer where knowledge, history, and working context sit — briefs, past projects, client notes, brand voice. If your team can't find it, the AI can't find it either.</p>
        <div className="deck-three-up">
          <div className="deck-tile">
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Storage</div>
            <div className="deck-tile-meta">Where files, briefs, notes and history actually live — Drive, Notion, SharePoint, email.</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">Retrieval</div>
            <div className="deck-tile-meta">Can you — or an AI — find the right thing at the right moment, or is it buried?</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">03</div>
            <div className="deck-tile-title">Quality</div>
            <div className="deck-tile-meta">Is what's stored accurate, up to date, and structured enough to be useful?</div>
          </div>
        </div>
        <p className="deck-footnote">Most organisations have a memory problem masquerading as an AI problem.</p>
      </div>
    ),
  },
  {
    id: 'memory-questions',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Memory audit — questions for the room</div>
        <h2 className="deck-h2">Where does your organisation's knowledge live?</h2>
        <ul className="deck-rules">
          <li>If a new person joined tomorrow, where would they find what they need to do their job?</li>
          <li>When you're about to create something — a proposal, a report, a brief — where do you go first?</li>
          <li>What's stored in people's heads that should be written down somewhere?</li>
          <li>Have you ever lost important context because someone left, a laptop died, or a thread got buried?</li>
          <li>If you wanted to give an AI your organisation's institutional memory — where would you point it?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'memory-exercise',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow deck-eyebrow-orange">Memory — mapping exercise · 10 min</div>
        <h2 className="deck-h2">Three columns. Be honest.</h2>
        <div className="task-mapping-grid">
          <div className="task-mapping-col task-mapping-col-memory">
            <div className="task-mapping-num">01</div>
            <div className="task-mapping-head">What we store</div>
            <div className="task-mapping-q">List the types of information your team creates and relies on. Briefs, client notes, past projects, research, decisions.</div>
          </div>
          <div className="task-mapping-col task-mapping-col-memory">
            <div className="task-mapping-num">02</div>
            <div className="task-mapping-head">Where it lives</div>
            <div className="task-mapping-q">For each type — where does it actually live today? Drive? Email? Notion? Someone's desktop?</div>
          </div>
          <div className="task-mapping-col task-mapping-col-memory">
            <div className="task-mapping-num">03</div>
            <div className="task-mapping-head">How findable?</div>
            <div className="task-mapping-q">Would a new colleague find it without asking someone? Would an AI be able to use it? Rate 1–5.</div>
          </div>
        </div>
        <p className="deck-footnote">Group review: spot where context is trapped, siloed, or missing entirely.</p>
      </div>
    ),
  },
  {
    id: 'thinking-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">02</div>
        <h2 className="deck-section-title">Thinking</h2>
        <div className="deck-section-meta">Which AI does the reasoning — and what does it need to know?</div>
      </div>
    ),
  },
  {
    id: 'thinking-what-it-is',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Thinking — The frontal cortex</div>
        <h2 className="deck-h2">Which AI are you using — and for what?</h2>
        <p className="deck-body">The Thinking layer is where the LLM does its work. But most teams are using AI reactively — when they remember to, for whatever they happen to need at the moment. To get consistent value, you need to know which model your team reaches for, what it's being asked to do, and whether it's being given the right context to be useful.</p>
        <div className="deck-three-up">
          <div className="deck-tile">
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Which model</div>
            <div className="deck-tile-meta">ChatGPT, Claude, Gemini, or something else? Is there a default — or is it fragmented?</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">For what tasks</div>
            <div className="deck-tile-meta">Drafting, summarising, researching, coding, analysing? Where is AI adding value today?</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">03</div>
            <div className="deck-tile-title">With what context</div>
            <div className="deck-tile-meta">Is your AI getting the right background before it answers — or is it working blind?</div>
          </div>
        </div>
        <p className="deck-footnote">A model without context is a clever guesser. Context is the difference.</p>
      </div>
    ),
  },
  {
    id: 'thinking-questions',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Thinking audit — questions for the room</div>
        <h2 className="deck-h2">What AI does your team actually use?</h2>
        <ul className="deck-rules">
          <li>Which AI tools does your team use regularly? Be honest — not what you think you should use, what you actually open.</li>
          <li>Is there a single default LLM across the team — or is everyone on different tools?</li>
          <li>What tasks do you use AI for most? What do you still do entirely manually that you probably shouldn't?</li>
          <li>When AI gives you a bad answer — what's usually the reason? Wrong tool, wrong prompt, or missing context?</li>
          <li>What's the one task where, if AI worked reliably, it would save you the most time per week?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'thinking-tool-mapping',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Thinking — which AI for what</div>
        <h2 className="deck-h2">Map your team's default AI by task.</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ToolCandidateRow region="thinking" label="Drafting &amp; writing" ids={['chatgpt', 'claude', 'gemini']} />
          <ToolCandidateRow region="thinking" label="Research &amp; analysis" ids={['chatgpt', 'claude', 'gemini']} />
          <ToolCandidateRow region="thinking" label="Summarising &amp; synthesis" ids={['claude', 'chatgpt', 'gemini']} />
          <ToolCandidateRow region="thinking" label="Coding &amp; automation" ids={['claude', 'chatgpt', 'gemini']} />
        </div>
        <p className="deck-footnote">One default per task. Outliers allowed — but named, with a reason.</p>
      </div>
    ),
  },
  {
    id: 'deciding-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">03</div>
        <h2 className="deck-section-title">Deciding</h2>
        <div className="deck-section-meta">Where actions live — and how work actually moves forward.</div>
      </div>
    ),
  },
  {
    id: 'deciding-what-it-is',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Deciding — The prefrontal &amp; cingulate cortex</div>
        <h2 className="deck-h2">Where do decisions and actions end up?</h2>
        <p className="deck-body">Deciding is the action layer — where work gets captured, assigned, tracked, and moved forward. In most organisations, this is the layer most damaged by fragmentation: actions in emails, tasks in chat threads, decisions in people's heads. Without a reliable Deciding layer, AI can reason all it wants — but nothing gets done.</p>
        <div className="deck-three-up">
          <div className="deck-tile">
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Capture</div>
            <div className="deck-tile-meta">When an action is agreed — where does it go? Same place every time, or wherever feels right?</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">Track</div>
            <div className="deck-tile-meta">Can you see at a glance what's in progress, what's blocked, and what's due?</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">03</div>
            <div className="deck-tile-title">Progress</div>
            <div className="deck-tile-meta">Does work move forward without someone manually chasing — or is chasing the system?</div>
          </div>
        </div>
        <p className="deck-footnote">A fragmented Deciding layer is where AI value goes to die.</p>
      </div>
    ),
  },
  {
    id: 'deciding-questions',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Deciding audit — questions for the room</div>
        <h2 className="deck-h2">How does work actually move forward in your organisation?</h2>
        <ul className="deck-rules">
          <li>When a decision is made in a meeting, what happens next? Is there a single place it gets written down?</li>
          <li>Does everyone on the team track their work in the same system — or does each person have their own approach?</li>
          <li>How do you know what's blocked or overdue without asking someone directly?</li>
          <li>In the last month, what fell through the cracks — and why?</li>
          <li>What would have to be true for your current system to be the single source of truth for all active work?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'deciding-five-gates',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Deciding — the five gates</div>
        <h2 className="deck-h2">Every action has five moments. Map yours.</h2>
        <div className="monday-flow">
          <div className="monday-flow-step">
            <div className="monday-flow-num">01</div>
            <div className="monday-flow-name">Capture</div>
            <div className="monday-flow-q">What triggers a new action? Who creates it? Within how long of it being agreed?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">02</div>
            <div className="monday-flow-name">Review</div>
            <div className="monday-flow-q">Who validates it's real and prioritised? On what cadence?</div>
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
            <div className="monday-flow-q">Who picks it up? Where do updates go — same place, same field, every time?</div>
          </div>
          <div className="monday-flow-arrow">→</div>
          <div className="monday-flow-step">
            <div className="monday-flow-num">05</div>
            <div className="monday-flow-name">Close</div>
            <div className="monday-flow-q">What defines done? Who confirms? What gets archived and where?</div>
          </div>
        </div>
        <p className="deck-footnote">If you can answer all five clearly — you have a Deciding layer. If you can't — you know what to fix.</p>
      </div>
    ),
  },
  {
    id: 'creating-section',
    kind: 'section',
    render: () => (
      <div className="deck-section">
        <div className="deck-section-num">04</div>
        <h2 className="deck-section-title">Creating</h2>
        <div className="deck-section-meta">The skills, agents, and tools that produce the work.</div>
      </div>
    ),
  },
  {
    id: 'creating-what-it-is',
    kind: 'standard',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow">Creating — Motor cortex &amp; cerebellum</div>
        <h2 className="deck-h2">What does your AI actually produce?</h2>
        <p className="deck-body">Creating is the compositional layer — where all four parts come together. Memory provides the context. Thinking does the reasoning. Deciding manages the output. Creating is the moment of execution: documents written, analyses run, emails drafted, workflows triggered. This is where humans and AI collaborate most directly.</p>
        <div className="deck-three-up">
          <div className="deck-tile">
            <div className="deck-tile-num">01</div>
            <div className="deck-tile-title">Skills</div>
            <div className="deck-tile-meta">The repeatable tasks AI can run: drafting, formatting, summarising, translating, coding.</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">02</div>
            <div className="deck-tile-title">Agents</div>
            <div className="deck-tile-meta">Automated workflows that chain tasks — triggered by an event, running without a human in the loop.</div>
          </div>
          <div className="deck-tile">
            <div className="deck-tile-num">03</div>
            <div className="deck-tile-title">Quality</div>
            <div className="deck-tile-meta">Human oversight at the right moments. What needs a review, and what can ship direct?</div>
          </div>
        </div>
        <p className="deck-footnote">Creating is built on top of the other three. Get Memory, Thinking and Deciding right first.</p>
      </div>
    ),
  },
  {
    id: 'creating-questions',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack">
        <div className="deck-eyebrow deck-eyebrow-orange">Creating audit — questions for the room</div>
        <h2 className="deck-h2">What are you producing — and what could AI produce for you?</h2>
        <ul className="deck-rules">
          <li>What are the most time-consuming outputs your team produces? Documents, reports, proposals, comms, analysis — list them.</li>
          <li>Which of those outputs follow a pattern — the same structure, the same type of content, every time?</li>
          <li>Where is AI already helping you produce things? Is the quality good enough to use without heavy editing?</li>
          <li>Where have you tried AI for output and it didn't work — what went wrong?</li>
          <li>If you could automate one complete workflow end-to-end, which one would have the biggest impact?</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'creating-exercise',
    kind: 'exercise',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow deck-eyebrow-orange">Creating — output mapping · 10 min</div>
        <h2 className="deck-h2">What gets made. How it gets made. Who checks it.</h2>
        <div className="task-mapping-grid">
          <div className="task-mapping-col task-mapping-col-thinking">
            <div className="task-mapping-num">01</div>
            <div className="task-mapping-head">What we produce</div>
            <div className="task-mapping-q">List the main outputs your team creates regularly. Proposals, reports, briefs, comms, analysis, decks.</div>
          </div>
          <div className="task-mapping-col task-mapping-col-deciding">
            <div className="task-mapping-num">02</div>
            <div className="task-mapping-head">AI's current role</div>
            <div className="task-mapping-q">For each — is AI involved now? Not at all / assists / drafts / produces autonomously?</div>
          </div>
          <div className="task-mapping-col task-mapping-col-memory">
            <div className="task-mapping-num">03</div>
            <div className="task-mapping-head">The quality gate</div>
            <div className="task-mapping-q">Who reviews it before it goes? Every time, sometimes, or never?</div>
          </div>
        </div>
        <p className="deck-footnote">The goal: AI handles the pattern work, humans own the judgment calls.</p>
      </div>
    ),
  },
  {
    id: 'synthesis',
    kind: 'standard',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Synthesis</div>
        <h2 className="deck-h2">Your AI brain, mapped.</h2>
        <div className="brain-stage">
          <div className="brain-svg-wrap">
            <BrainAnatomy showLabels showSynapses />
          </div>
          <div className="brain-legend">
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#7902f3' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#7902f3' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Memory</div>
                <div className="brain-legend-title">Where your context lives</div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#f46c42' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Thinking</div>
                <div className="brain-legend-title">Your default AI layer</div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#c59f4d' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Deciding</div>
                <div className="brain-legend-title">Where actions go</div>
              </div>
            </div>
            <div className="brain-legend-item" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties}>
              <div className="brain-legend-marker" style={{ ['--legend-colour' as string]: '#d1f503' } as React.CSSProperties} />
              <div className="brain-legend-body">
                <div className="brain-legend-tag">Creating</div>
                <div className="brain-legend-title">What AI produces for you</div>
              </div>
            </div>
          </div>
        </div>
        <p className="deck-body" style={{ marginTop: 12 }}>The four parts don't work in isolation. A strong Thinking layer with a weak Memory layer is a capable AI working blind. A strong Memory layer with no Deciding layer produces good analysis that never becomes action.</p>
        <p className="deck-footnote">The goal isn't to be advanced at all four. It's to be intentional about all four.</p>
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
          Anything we haven&rsquo;t addressed. Anything you&rsquo;d challenge. Anything missing from the picture before we move to next steps.
        </p>
        <p className="deck-footnote deck-footnote-spaced">No bad questions. Surface them now — they&rsquo;re harder to raise once the recommendations land.</p>
      </div>
    ),
  },
  {
    id: 'next-steps',
    kind: 'closer',
    render: () => (
      <div className="deck-stack-tight">
        <div className="deck-eyebrow">Next steps</div>
        <h2 className="deck-h2">What happens next.</h2>
        <div className="next-steps-list">
          <div className="next-steps-row">
            <div className="next-steps-when">This week</div>
            <div className="next-steps-what">
              <div className="next-steps-title">Findings synthesised</div>
              <div className="next-steps-detail">The audit map gets written up — what we heard, where the gaps are, what&rsquo;s most urgent.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Next week</div>
            <div className="next-steps-what">
              <div className="next-steps-title">Priorities agreed</div>
              <div className="next-steps-detail">One conversation to align on which part of the brain to fix first — and what that fix looks like.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Next 30 days</div>
            <div className="next-steps-what">
              <div className="next-steps-title">First intervention scoped</div>
              <div className="next-steps-detail">A concrete first step: a tool decision, a workflow design, a training session, or a quick-win automation.</div>
            </div>
          </div>
          <div className="next-steps-row">
            <div className="next-steps-when">Ongoing</div>
            <div className="next-steps-what">
              <div className="next-steps-title">The brain gets stronger</div>
              <div className="next-steps-detail">Each intervention builds on the last. Memory makes Thinking better. Thinking makes Deciding faster. Deciding makes Creating more reliable.</div>
            </div>
          </div>
        </div>
        <p className="deck-footnote deck-footnote-spaced">Thank you — this is where the real work starts.</p>
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
        <div className="deck-brand">ThreePoint · 4AI Brain Audit</div>
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
