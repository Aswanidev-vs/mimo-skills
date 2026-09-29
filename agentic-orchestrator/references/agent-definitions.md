# Agent Definitions Reference

## Frontend Agent

**ID**: `frontend`
**Subagents**: `component-builder`, `style-specialist`, `a11y-auditor`

### Capabilities
- UI component architecture (React, Vue, Angular, Svelte)
- Responsive design systems
- CSS-in-JS, Tailwind, SCSS
- Animation and transitions
- State management (Redux, Zustand, Pinia)
- Bundle optimization

### Component Builder Subagent
```yaml
specialization: UI component creation
inputs:
  - component_name: string
  - framework: react|vue|angular|svelte
  - props: object
  - styles: string
outputs:
  - component_file: string
  - story_file: string (optional)
  - test_file: string (optional)
```

### Style Specialist Subagent
```yaml
specialization: CSS/styling systems
inputs:
  - design_tokens: object
  - framework: string
  - responsive_breakpoints: object
outputs:
  - style_system: string
  - theme_config: object
```

### A11y Auditor Subagent
```yaml
specialization: Accessibility validation
inputs:
  - component: string
  - wcag_level: A|AA|AAA
outputs:
  - audit_report: object
  - violations: array
  - recommendations: array
```

---

## Backend Agent

**ID**: `backend`
**Subagents**: `api-designer`, `db-architect`, `auth-specialist`

### Capabilities
- RESTful API design
- GraphQL schema design
- Database design (SQL, NoSQL)
- Authentication/Authorization
- Caching strategies
- Message queues

### API Designer Subagent
```yaml
specialization: API endpoint design
inputs:
  - endpoints: array
  - format: openapi|raml
  - auth_required: boolean
outputs:
  - api_spec: object
  - endpoint_files: array
```

### DB Architect Subagent
```yaml
specialization: Database schema design
inputs:
  - entities: array
  - relationships: array
  - database_type: postgresql|mysql|mongodb
outputs:
  - schema: object
  - migrations: array
  - seed_data: object
```

### Auth Specialist Subagent
```yaml
specialization: Authentication implementation
inputs:
  - auth_method: jwt|oauth2|session
  - providers: array
  - security_level: standard|high
outputs:
  - auth_module: string
  - middleware: string
  - configuration: object
```

---

## Security Agent

**ID**: `security`
**Subagents**: `pen-tester`, `compliance-checker`, `dependency-auditor`

### Capabilities
- OWASP Top 10 analysis
- Input validation review
- Authentication security
- Authorization checks
- Dependency vulnerability scanning
- Security configuration review

### Pen Tester Subagent
```yaml
specialization: Vulnerability testing
inputs:
  - target: string
  - test_type: static|dynamic
outputs:
  - vulnerabilities: array
  - severity_levels: object
  - remediation: array
```

### Compliance Checker Subagent
```yaml
specialization: Regulatory compliance
inputs:
  - standard: owasp|pci-dss|hipaa|gdpr
  - scope: array
outputs:
  - compliance_report: object
  - gaps: array
  - remediation_steps: array
```

### Dependency Auditor Subagent
```yaml
specialization: Dependency security
inputs:
  - manifest_files: array
  - lock_files: array
outputs:
  - vulnerable_deps: array
  - severity: object
  - upgrade_recommendations: array
```

---

## Review Agent

**ID**: `review`
**Subagents**: `style-reviewer`, `pattern-checker`, `doc-auditor`

### Capabilities
- Code quality analysis
- Design pattern validation
- Documentation review
- Test coverage analysis
- Refactoring suggestions

### Style Reviewer Subagent
```yaml
specialization: Code style analysis
inputs:
  - code_files: array
  - style_guide: string
outputs:
  - violations: array
  - suggestions: array
  - formatted_files: array
```

### Pattern Checker Subagent
```yaml
specialization: Design pattern validation
inputs:
  - code_files: array
  - patterns_to_check: array
outputs:
  - pattern_usage: object
  - anti_patterns: array
  - recommendations: array
```

### Doc Auditor Subagent
```yaml
specialization: Documentation review
inputs:
  - code_files: array
  - doc_requirements: object
outputs:
  - coverage_report: object
  - missing_docs: array
  - generated_docs: array
```

---

## Connector Agent

**ID**: `connector`
**Subagents**: `state-manager`, `contract-validator`

### Capabilities
- Shared state management
- Interface contract validation
- Conflict detection and resolution
- Cross-agent dependency management

### State Manager Subagent
```yaml
specialization: State synchronization
inputs:
  - state_updates: object
  - source_agent: string
outputs:
  - synced_state: object
  - conflicts: array
```

### Contract Validator Subagent
```yaml
specialization: API contract validation
inputs:
  - provider_agent: string
  - consumer_agent: string
  - interface_spec: object
outputs:
  - valid: boolean
  - violations: array
  - suggestions: array
```

---

## Evaluator Agent

**ID**: `evaluator`
**Subagents**: `metrics-collector`, `benchmark-runner`

### Capabilities
- Quality metrics collection
- Performance benchmarking
- Score calculation
- Report generation

### Metrics Collector Subagent
```yaml
specialization: Metrics gathering
inputs:
  - metrics_to_collect: array
  - source_agents: array
outputs:
  - metrics: object
  - trends: array
```

### Benchmark Runner Subagent
```yaml
specialization: Performance testing
inputs:
  - benchmarks: array
  - targets: array
outputs:
  - results: object
  - comparisons: array
  - recommendations: array
```
