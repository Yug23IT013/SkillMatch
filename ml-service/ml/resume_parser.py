import re
import io

# Master skills list (mirrors the one in recommendation engine)
MASTER_SKILLS = [
    # Programming Languages
    'python', 'javascript', 'java', 'c++', 'c#', 'c', 'ruby', 'go', 'rust', 'kotlin',
    'swift', 'scala', 'r', 'matlab', 'php', 'perl', 'typescript',
    # Web Frontend
    'react', 'react.js', 'next.js', 'vue', 'vue.js', 'angular', 'html', 'css',
    'tailwind', 'tailwindcss', 'bootstrap', 'sass', 'redux', 'jquery',
    # Web Backend
    'node.js', 'nodejs', 'express', 'express.js', 'django', 'flask', 'fastapi',
    'spring', 'spring boot', 'laravel', 'rails', 'graphql', 'rest api', 'rest',
    # Databases
    'mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'elasticsearch',
    'firebase', 'dynamodb', 'cassandra', 'oracle', 'sql', 'nosql',
    # ML / AI
    'machine learning', 'deep learning', 'data science', 'nlp',
    'natural language processing', 'computer vision', 'tensorflow', 'pytorch',
    'scikit-learn', 'sklearn', 'pandas', 'numpy', 'keras', 'opencv',
    'hugging face', 'transformers', 'bert', 'gpt', 'llm', 'rag',
    # Cloud & DevOps
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'google cloud',
    'ci/cd', 'jenkins', 'github actions', 'terraform', 'ansible',
    'linux', 'bash', 'shell scripting',
    # Tools
    'git', 'github', 'gitlab', 'jira', 'figma', 'postman',
    # Concepts
    'data structures', 'algorithms', 'system design', 'microservices',
    'agile', 'scrum', 'object oriented', 'oop', 'design patterns',
    # Soft skills
    'communication', 'teamwork', 'leadership', 'problem solving',
    'time management', 'critical thinking', 'adaptability',
]

# Canonical display names
SKILL_DISPLAY = {
    'react.js': 'React', 'react': 'React', 'node.js': 'Node.js', 'nodejs': 'Node.js',
    'express.js': 'Express', 'express': 'Express', 'next.js': 'Next.js',
    'vue.js': 'Vue.js', 'vue': 'Vue.js', 'tailwindcss': 'Tailwind',
    'tailwind': 'Tailwind', 'sklearn': 'scikit-learn', 'scikit-learn': 'scikit-learn',
    'gcp': 'GCP', 'aws': 'AWS', 'sql': 'SQL', 'nosql': 'NoSQL',
    'html': 'HTML', 'css': 'CSS', 'git': 'Git', 'c++': 'C++', 'c#': 'C#',
    'nlp': 'NLP', 'oop': 'OOP', 'ci/cd': 'CI/CD', 'rest api': 'REST API',
    'rest': 'REST API', 'llm': 'LLM', 'rag': 'RAG',
}

# Lightweight set used by the tech-stack line detector
_TECH_TOKENS = {
    'react', 'react.js', 'node', 'node.js', 'express', 'express.js', 'mongodb',
    'mysql', 'postgresql', 'sqlite', 'redis', 'firebase', 'django', 'flask',
    'fastapi', 'spring', 'laravel', 'angular', 'vue', 'vue.js', 'next.js',
    'typescript', 'javascript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
    'kotlin', 'swift', 'php', 'ruby', 'html', 'css', 'sass', 'bootstrap',
    'tailwind', 'tailwindcss', 'redux', 'graphql', 'rest', 'jwt', 'oauth',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab',
    'tensorflow', 'pytorch', 'keras', 'pandas', 'numpy', 'sklearn', 'scikit-learn',
    'opencv', 'api', 'sql', 'nosql', 'json', 'xml', 'html5', 'css3', 'es6',
    'webpack', 'vite', 'jest', 'mocha', 'postman', 'figma', 'jira', 'linux',
}


def _display(skill: str) -> str:
    return SKILL_DISPLAY.get(skill.lower(), skill.title())


def _is_tech_stack_line(line: str) -> bool:
    """
    Returns True when a line looks like a comma-separated list of technologies
    rather than a human-readable project title.
    Example: "React.js, Node.js, Express, MongoDB, JWT, Tailwind CSS 2025"
    """
    tokens = [t.strip() for t in line.split(',')]
    if len(tokens) < 2:
        return False
    # Count how many tokens fuzzy-match a known tech name
    matched = 0
    for token in tokens:
        tok_lower = token.lower()
        # Remove trailing year (e.g. "2025")
        tok_lower = re.sub(r'\s*\d{4}$', '', tok_lower).strip()
        if tok_lower in _TECH_TOKENS:
            matched += 1
            continue
        # Fuzzy: does any master-skill appear inside this token?
        if any(s in tok_lower for s in _TECH_TOKENS if len(s) > 3):
            matched += 1
    # If at least half the tokens (min 2) look like tech names → tech-stack line
    return matched >= max(2, len(tokens) // 2)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using pdfplumber."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages = [page.extract_text() or '' for page in pdf.pages]
        return '\n'.join(pages)
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}")


def extract_skills(text: str) -> dict:
    """
    Match skills from the master list against resume text.
    Returns { technicalSkills: [...], softSkills: [...] }
    """
    lower_text = text.lower()

    SOFT = {
        'communication', 'teamwork', 'leadership', 'problem solving',
        'time management', 'critical thinking', 'adaptability',
    }

    found_technical = set()
    found_soft = set()

    for skill in MASTER_SKILLS:
        # Use word-boundary regex to avoid false positives (e.g. 'r' in 'react')
        if len(skill) <= 2:
            pattern = r'(?<![a-zA-Z])' + re.escape(skill) + r'(?![a-zA-Z])'
        else:
            pattern = r'\b' + re.escape(skill) + r'\b'

        if re.search(pattern, lower_text):
            display = _display(skill)
            if skill in SOFT:
                found_soft.add(display)
            else:
                found_technical.add(display)

    return {
        'technicalSkills': sorted(found_technical),
        'softSkills': sorted(found_soft),
    }


def extract_projects(text: str) -> list:
    """
    Heuristically detect project sections and extract project title + description.
    Tech-stack lines (comma-separated technology names) are attached to the most
    recent project's techStack field rather than being treated as a new title.
    """
    SECTION_HEADERS = [
        r'experience', r'work experience', r'internship', r'employment',
        r'education', r'skills', r'certifications?', r'awards?',
        r'achievements?', r'publications?', r'references?', r'activities',
        r'volunteer', r'extra.?curricular',
    ]
    section_end_pattern = re.compile(
        r'^\s*(' + '|'.join(SECTION_HEADERS) + r')\s*$',
        re.IGNORECASE | re.MULTILINE
    )

    # Find "Projects" section start
    project_header = re.search(
        r'(?im)^\s*(projects?|academic projects?|personal projects?|key projects?)\s*$',
        text
    )
    if not project_header:
        return []

    project_start = project_header.end()
    remaining = text[project_start:]

    # Cut at next major section
    end_match = section_end_pattern.search(remaining)
    project_block = remaining[:end_match.start()] if end_match else remaining

    projects = []
    lines = [l.strip() for l in project_block.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]

        # ── Tech-stack line: attach to last project, don't treat as title ─────
        if _is_tech_stack_line(line):
            if projects:
                tech_tokens = [t.strip() for t in line.split(',') if t.strip()]
                # Remove pure year tokens like "2025"
                tech_tokens = [t for t in tech_tokens if not re.fullmatch(r'\d{4}', t)]
                projects[-1]['techStack'] = tech_tokens
            i += 1
            continue

        # ── Title heuristic ──────────────────────────────────────────────────
        is_title = (
            len(line) < 80
            and not line.startswith(('•', '-', '–', '*', '·', '◦'))
            and line[0].isupper()
            and i + 1 < len(lines)
            # A real title has at most 3 commas (e.g. "Foo, Bar & Baz Project")
            and line.count(',') <= 3
        )

        if is_title:
            title = re.sub(r'[|].*$', '', line).strip()  # strip pipe-separated metadata
            desc_lines = []
            pending_tech = []   # tech-stack line found while scanning description
            j = i + 1
            while j < len(lines) and len(desc_lines) < 6:
                next_line = lines[j]
                # Tech-stack line: capture it and KEEP SCANNING for description below
                if _is_tech_stack_line(next_line):
                    tech_tokens = [t.strip() for t in next_line.split(',') if t.strip()]
                    pending_tech = [t for t in tech_tokens if not re.fullmatch(r'\d{4}', t)]
                    j += 1
                    continue
                # Stop at the next title-like line (a new project starts)
                if (
                    len(next_line) < 80
                    and not next_line.startswith(('•', '-', '–', '*', '·', '◦'))
                    and next_line[0].isupper()
                    and next_line.count(',') <= 3
                    and len(desc_lines) > 0
                ):
                    break
                desc_lines.append(next_line.lstrip('•-–*·◦ '))
                j += 1

            description = ' '.join(desc_lines).strip()

            if title and len(title) > 3:
                projects.append({
                    'title': title,
                    'description': description,
                    'techStack': pending_tech,
                    'link': '',
                })
            i = j
        else:
            i += 1

    return projects[:6]  # cap at 6 projects


def extract_education(text: str) -> dict:
    """Extract basic education fields using regex."""
    result = {}

    # CGPA / GPA / Percentage
    cgpa_match = re.search(
        r'(?:cgpa|gpa|grade|percentage|score)[:\s]*([0-9]+(?:\.[0-9]{1,2})?)',
        text, re.IGNORECASE
    )
    if cgpa_match:
        val = float(cgpa_match.group(1))
        # Normalise percentage to 10-point if > 10
        if val > 10:
            val = round(val / 10, 2)
        result['cgpa'] = val

    # Graduation year
    year_match = re.search(
        r'(?:graduating|graduation|batch|passout|pass.?out|class of)[:\s]*(\b20[12][0-9]\b)',
        text, re.IGNORECASE
    )
    if not year_match:
        year_match = re.search(r'\b(202[0-9]|2030)\b', text)
    if year_match:
        result['graduationYear'] = int(year_match.group(1))

    # Degree
    degree_match = re.search(
        r'\b(B\.?Tech|B\.?E\.?|B\.?Sc\.?|M\.?Tech|M\.?E\.?|M\.?Sc\.?|MBA|BCA|MCA|Ph\.?D)\b',
        text, re.IGNORECASE
    )
    if degree_match:
        result['degree'] = degree_match.group(1).strip('.')

    # Branch / Major
    branch_match = re.search(
        r'\b(Computer Science|Information Technology|Electronics|Electrical|Mechanical|'
        r'Civil|Chemical|Biotechnology|Data Science|Artificial Intelligence|'
        r'Information Science|CSE|IT|ECE|EEE|ME|CE)\b',
        text, re.IGNORECASE
    )
    if branch_match:
        result['branch'] = branch_match.group(1)

    return result


def parse_resume(file_bytes: bytes) -> dict:
    """
    Main entry point.
    Returns { technicalSkills, softSkills, projects, education }
    """
    text = extract_text_from_pdf(file_bytes)
    skills = extract_skills(text)
    projects = extract_projects(text)
    education = extract_education(text)

    return {
        'technicalSkills': skills['technicalSkills'],
        'softSkills': skills['softSkills'],
        'projects': projects,
        'education': education,
        'rawTextLength': len(text),
    }
