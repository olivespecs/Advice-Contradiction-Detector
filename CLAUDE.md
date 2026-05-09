# Claude Code Agents - Ruflo Configuration

This project uses ruflo agents configured with the minimax-m2.5-free model.

## Available Agents

All agents use the minimax-m2.5-free model configured via settings.json.

### Core Development Agents

| Agent | Description | Use Case |
|-------|-------------|----------|
| `$coder` | Code implementation specialist | Writing production-quality code |
| `$planner` | Strategic planning and orchestration | Breaking down complex tasks |
| `$reviewer` | Code review and QA | Quality assurance, security |
| `$tester` | Testing specialist | Unit, integration, e2e tests |
| `$researcher` | Research and analysis | Context gathering, investigation |
| `$architect` | System architecture | Design scalable systems |

### Specialized Agents

| Agent | Description | Use Case |
|-------|-------------|----------|
| `$security-auditor` | Security analysis | Vulnerability detection |
| `$performance-engineer` | Performance optimization | Speed and efficiency |
| `$devops` | CI/CD and infrastructure | Automation, deployments |
| `$data-engineer` | Data pipelines | ETL, databases |
| `$mobile-developer` | Mobile apps | iOS/Android development |
| `$backend-developer` | Backend APIs | REST/GraphQL services |

## Usage

Invoke agents in prompts:

```
As a $coder, implement user authentication...
As a $planner, create a plan for the feature...
As a $reviewer, check this code for security issues...
```

## Model Configuration

All agents use:
- **Model**: minimax-m2.5-free
- **Provider**: OpenCode.ai (via custom endpoint)
- **Base URL**: https://opencode.ai/zen

Configuration is in `.claude/settings.json`.

## Skills Structure

Skills are defined in `.claude/settings.json` under the `skills` key. Each skill has:
- `description`: Brief description
- `instructions`: Detailed system prompt
- `enabled`: Whether to activate

## Agent Collaboration

For complex tasks, spawn multiple agents:
- Use Task tool with `run_in_background: true`
- Coordinate via shared context
- Let agents pass results to each other

## Ruflo Source

The agent definitions are derived from the ruflo repository (https://github.com/ruvnet/ruflo) - a comprehensive multi-agent system with 100+ specialized agents.