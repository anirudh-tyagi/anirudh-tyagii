'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  personalInfo, education, experience, skills, publications, achievements, links,
} from '@/data/profile';
import './DevTerminal.css';

/**
 * An interactive shell over the profile data. Every command reads from
 * src/data/profile.ts, so nothing here restates content that lives
 * elsewhere on the site — it is a different way into the same source.
 */

type Kind = 'text' | 'cmd' | 'head' | 'dim' | 'accent' | 'err' | 'link';

interface Line {
  id: number;
  text: string;
  kind: Kind;
  href?: string;
}

const RESUME = '/resume/Anirudh-Tyagi-Resume.pdf';

let uid = 0;
const mk = (text: string, kind: Kind = 'text', href?: string): Line => ({ id: uid++, text, kind, href });

// Backlog cap. The terminal has no scrollbar of its own, so old output is
// dropped instead of accumulating into an ever-taller page.
const MAX_LINES = 220;

const BOOT: Line[] = [
  mk(`${personalInfo.name} · ${personalInfo.title}`, 'accent'),
  mk('Interactive profile shell. Type a command, or tap one below.', 'dim'),
  mk("Try `whoami`, `experience`, or `neofetch`. `help` lists everything.", 'dim'),
];

const SUGGESTIONS = ['whoami', 'experience', 'skills', 'education', 'projects', 'neofetch', 'contact'];

export default function DevTerminal() {
  const [lines, setLines] = useState<Line[]>(BOOT);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Record<string, () => Line[]>>(() => ({
    help: () => [
      mk('Available commands', 'head'),
      ...[
        ['whoami', 'who I am, in one paragraph'],
        ['experience', 'where I have worked'],
        ['education', 'degree, CGPA, coursework'],
        ['skills', 'languages, frameworks, tools'],
        ['publications', 'papers under review'],
        ['achievements', 'things I am proud of'],
        ['interests', 'what I do outside code'],
        ['projects', 'jump to my project work'],
        ['contact', 'how to reach me'],
        ['resume', 'download the PDF'],
        ['neofetch', 'the system summary'],
        ['clear', 'wipe the screen'],
      ].map(([c, d]) => mk(`  ${c.padEnd(14)}${d}`, 'text')),
    ],

    whoami: () => [
      mk(personalInfo.name, 'head'),
      mk(personalInfo.title, 'accent'),
      mk(''),
      ...wrap(personalInfo.summary).map((l) => mk(l)),
    ],

    experience: () =>
      experience.flatMap((job) => [
        mk(`${job.role} · ${job.company}`, 'head'),
        mk(`${job.duration}  ·  ${job.location}`, 'dim'),
        ...job.details.flatMap((d) => wrap(d, 84, '  • ', '    ').map((l) => mk(l))),
        mk(''),
      ]),

    education: () => [
      mk(education.school, 'head'),
      mk(education.degree, 'accent'),
      mk(`${education.duration}  ·  CGPA ${education.cgpa}`, 'dim'),
      mk(''),
      mk('Coursework', 'head'),
      ...chunk(education.coursework, 3).map((row) => mk(`  ${row.join(' · ')}`)),
    ],

    skills: () => [
      ...Object.entries(skills).flatMap(([group, items]) => [
        mk(group.charAt(0).toUpperCase() + group.slice(1), 'head'),
        ...chunk(items as string[], 4).map((row) => mk(`  ${row.join(' · ')}`)),
        mk(''),
      ]),
    ],

    publications: () =>
      publications.flatMap((p) => [
        ...wrap(p.citation, 84, '  ', '  ').map((l) => mk(l)),
        mk(`  ${p.status}`, 'dim'),
        mk(''),
      ]),

    achievements: () =>
      achievements.flatMap((a) => [
        mk(`${a.title}${a.meta ? ` · ${a.meta}` : ''}`, 'head'),
        ...wrap(a.description, 84, '  ', '  ').map((l) => mk(l)),
        mk(''),
      ]),

    interests: () => [
      mk('Outside the editor', 'head'),
      ...personalInfo.interests.map((i) => mk(`  • ${i}`)),
    ],

    projects: () => [
      mk('Project work lives on its own page.', 'text'),
      mk('→ View projects', 'link', '/projects'),
      mk('→ Live GitHub activity', 'link', '/activity'),
    ],

    contact: () => [
      mk('Get in touch', 'head'),
      mk(`→ ${personalInfo.email}`, 'link', `mailto:${personalInfo.email}`),
      mk('→ GitHub', 'link', links.github),
      mk('→ LinkedIn', 'link', links.linkedin),
      mk(''),
      mk('Or use the contact page for everything at once.', 'dim'),
      mk('→ Contact', 'link', '/contact'),
    ],

    resume: () => [
      mk('Anirudh-Tyagi-Resume.pdf', 'head'),
      mk('→ Download PDF', 'link', RESUME),
    ],

    neofetch: () => {
      const totalSkills = Object.values(skills).reduce((n, arr) => n + (arr as string[]).length, 0);
      const info: [string, string][] = [
        ['user', 'anirudh'],
        ['role', personalInfo.title],
        ['school', education.school],
        ['cgpa', education.cgpa],
        ['roles held', String(experience.length)],
        ['skills', String(totalSkills)],
        ['papers', String(publications.length)],
        ['shell', 'portfolio-sh 1.0'],
      ];
      const art = [
        '     ___     ',
        '    /   \\    ',
        '   | o o |   ',
        '   |  ^  |   ',
        '   | \\_/ |   ',
        '    \\___/    ',
        '   /|   |\\   ',
        '  ',
      ];
      return art.map((a, i) => {
        const pair = info[i];
        return mk(`${a}  ${pair ? `${pair[0].padEnd(11)}${pair[1]}` : ''}`, i === 0 ? 'accent' : 'text');
      });
    },

    ls: () => [
      mk('whoami  experience  education  skills  publications  achievements  interests  projects  contact  resume'),
    ],

    sudo: () => [mk('Nice try. You already have everything you need. 🐾', 'dim')],
    exit: () => [mk('There is no escape from a single-page app.', 'dim')],
  }), []);

  const aliases: Record<string, string> = useMemo(() => ({
    exp: 'experience', edu: 'education', pubs: 'publications', pub: 'publications',
    about: 'whoami', me: 'whoami', cv: 'resume', h: 'help', '?': 'help',
  }), []);

  const run = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setHistory((h) => [...h, raw.trim()]);
    setHistIndex(-1);

    if (cmd === 'clear') {
      setLines([]);
      return;
    }

    const resolved = aliases[cmd] ?? cmd;
    const fn = commands[resolved];

    // Nothing clips the output any more, so cap the backlog rather than
    // letting a long session stretch the page indefinitely.
    setLines((prev) => [
      ...prev.slice(-MAX_LINES),
      mk(raw.trim(), 'cmd'),
      ...(fn
        ? fn()
        : [mk(`command not found: ${raw.trim()}`, 'err'), mk("Type `help` to see what is available.", 'dim')]),
    ]);
  }, [aliases, commands]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const next = histIndex === -1 ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(history[next]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex === -1) return;
      const next = histIndex + 1;
      if (next >= history.length) {
        setHistIndex(-1);
        setInput('');
      } else {
        setHistIndex(next);
        setInput(history[next]);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.trim().toLowerCase();
      if (!partial) return;
      const pool = [...Object.keys(commands), ...Object.keys(aliases)];
      const match = pool.find((c) => c.startsWith(partial));
      if (match) setInput(match);
    }
  };

  // Fixed box: new output lands at the bottom and older lines ride up out
  // of view, so the panel never changes size no matter how much you run.
  // overflow is hidden, but scrollTop still works programmatically, so the
  // newest output is pinned into view while older lines ride up out of it.
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);


  return (
    <div
      className="devterm"
      onClick={() => {
        // Let people select output text without the caret jumping away.
        if (window.getSelection()?.toString()) return;
        inputRef.current?.focus();
      }}
    >
      <div className="devterm-bar">
        <span className="devterm-dot devterm-dot-r" />
        <span className="devterm-dot devterm-dot-y" />
        <span className="devterm-dot devterm-dot-g" />
        <span className="devterm-bar-title">anirudh@portfolio : zsh</span>
      </div>

      <div className="devterm-body" ref={bodyRef}>
        {lines.map((line) =>
          line.kind === 'link' && line.href ? (
            <a
              key={line.id}
              className="devterm-line devterm-link"
              href={line.href}
              target={line.href.startsWith('http') || line.href.endsWith('.pdf') ? '_blank' : undefined}
              rel="noopener noreferrer"
              {...(line.href.endsWith('.pdf') ? { download: true } : {})}
            >
              {line.text}
            </a>
          ) : (
            <div key={line.id} className={`devterm-line devterm-${line.kind}`}>
              {line.kind === 'cmd' && <span className="devterm-prompt">$&nbsp;</span>}
              {line.text || '\u00A0'}
            </div>
          )
        )}

        <div className="devterm-inputrow">
          <span className="devterm-prompt">$&nbsp;</span>
          <input
            ref={inputRef}
            className="devterm-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
            placeholder="type a command…"
          />
        </div>
      </div>

      {/* Tapping beats typing on a phone, and it advertises what exists. */}
      <div className="devterm-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="devterm-chip" onClick={() => run(s)}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Soft-wrap long prose so the shell keeps its monospace column feel. */
function wrap(text: string, width = 88, first = '', rest = ''): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let line = first;
  let prefix = first;

  for (const w of words) {
    if (line.length + w.length + 1 > width && line.trim() !== prefix.trim()) {
      out.push(line);
      prefix = rest;
      line = rest + w;
    } else {
      line = line.trim() === '' ? line + w : `${line} ${w}`;
    }
  }
  if (line.trim()) out.push(line);
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
