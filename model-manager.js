// Enhanced Model Management System - Premium Edition
class ModelManager {
    constructor() {
        this.models = {
            'claude-sonnet-4-20250514': {
                name: 'Sonnet 4.5',
                cost: 0.003,
                speed: 'Fast',
                quality: 'High',
                bestFor: 'General tasks, conversations'
            },
            'claude-opus-4-5': {
                name: 'Opus 4.5', 
                cost: 0.015,
                speed: 'Medium',
                quality: 'Highest',
                bestFor: 'Complex reasoning, analysis'
            },
            'claude-haiku-3-20240307': {
                name: 'Haiku 3.0',
                cost: 0.0015,
                speed: 'Fastest',
                quality: 'Good',
                bestFor: 'Simple tasks, quick responses'
            }
        };
    }

    getModelInfo(modelId) {
        return this.models[modelId] || {
            name: modelId.split('-').pop(),
            cost: 0.005,
            speed: 'Unknown',
            quality: 'Unknown',
            bestFor: 'General purpose'
        };
    }

    calculateCostImpact(currentModel, newModel, monthlyTokens = 100000) {
        const current = this.getModelInfo(currentModel);
        const proposed = this.getModelInfo(newModel);
        
        const currentCost = (monthlyTokens / 1000) * current.cost;
        const newCost = (monthlyTokens / 1000) * proposed.cost;
        const savings = currentCost - newCost;
        
        return {
            currentCost: currentCost.toFixed(2),
            newCost: newCost.toFixed(2),
            savings: savings.toFixed(2),
            savingsPercent: ((savings / currentCost) * 100).toFixed(1)
        };
    }

    getModelRecommendation(agent) {
        const { tokens, status, purpose } = agent;
        
        // High-volume agents should use Sonnet
        if (tokens > 80000) {
            if (agent.model.includes('opus')) {
                return {
                    recommended: 'claude-sonnet-4-20250514',
                    reason: 'High token usage - Sonnet provides excellent quality at 5x lower cost',
                    impact: this.calculateCostImpact(agent.model, 'claude-sonnet-4-20250514', tokens)
                };
            }
        }
        
        // Low-volume agents can use Haiku for simple tasks
        if (tokens < 20000 && (purpose.includes('reminder') || purpose.includes('simple'))) {
            return {
                recommended: 'claude-haiku-3-20240307',
                reason: 'Low complexity tasks - Haiku is 2x faster and cheaper',
                impact: this.calculateCostImpact(agent.model, 'claude-haiku-3-20240307', tokens)
            };
        }
        
        // Complex reasoning tasks should use Opus
        if (purpose.includes('analysis') || purpose.includes('strategy') || purpose.includes('complex')) {
            if (!agent.model.includes('opus')) {
                return {
                    recommended: 'claude-opus-4-5',
                    reason: 'Complex reasoning tasks benefit from Opus capabilities',
                    impact: this.calculateCostImpact(agent.model, 'claude-opus-4-5', tokens)
                };
            }
        }
        
        return null; // No recommendation
    }

    createModelSelector(agent, onModelChange) {
        const selector = document.createElement('div');
        selector.className = 'model-selector';
        
        const currentModel = this.getModelInfo(agent.model);
        const recommendation = this.getModelRecommendation(agent);
        
        selector.innerHTML = `
            <div class="model-current">
                <label class="form-label" style="margin-bottom: var(--space-xs);">Model</label>
                <select class="form-control model-dropdown" data-agent-id="${agent.id}">
                    ${Object.entries(this.models).map(([id, info]) => `
                        <option value="${id}" ${agent.model === id ? 'selected' : ''}>
                            ${info.name} ($${info.cost}/1K) - ${info.speed}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            ${recommendation ? `
                <div class="model-recommendation">
                    <div class="recommendation-header">
                        <strong>Recommendation:</strong> ${this.getModelInfo(recommendation.recommended).name}
                    </div>
                    <div class="recommendation-reason">${recommendation.reason}</div>
                    <div class="cost-impact">
                        <span class="cost-savings">Save $${recommendation.impact.savings}/month (${recommendation.impact.savingsPercent}%)</span>
                    </div>
                    <button class="btn btn-sm btn-success apply-recommendation" 
                            data-agent-id="${agent.id}" 
                            data-model="${recommendation.recommended}">
                        Apply Recommendation
                    </button>
                </div>
            ` : ''}
        `;
        
        // Add event listeners
        const dropdown = selector.querySelector('.model-dropdown');
        dropdown.addEventListener('change', (e) => {
            const newModel = e.target.value;
            const impact = this.calculateCostImpact(agent.model, newModel, agent.tokens);
            
            if (confirm(`Switch ${agent.name} to ${this.getModelInfo(newModel).name}?\n\nCost Impact: ${impact.savings > 0 ? 'Save' : 'Cost'} $${Math.abs(impact.savings)}/month`)) {
                onModelChange(agent.id, newModel);
            } else {
                e.target.value = agent.model; // Revert
            }
        });
        
        const applyBtn = selector.querySelector('.apply-recommendation');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const newModel = applyBtn.dataset.model;
                onModelChange(agent.id, newModel);
            });
        }
        
        return selector;
    }
}

// Agent Templates System
class AgentTemplates {
    constructor() {
        this.templates = {
            'health-coach': {
                name: 'Health Coach',
                icon: '',
                purpose: 'Fitness tracking and wellness guidance',
                model: 'claude-sonnet-4-20250514',
                soul: `# Health Coach Agent

You are a knowledgeable health and fitness coach focused on helping users achieve their wellness goals.

## Personality
- Encouraging and motivational
- Evidence-based approach
- Practical and actionable advice
- Celebrates small wins and progress

## Expertise
- Nutrition tracking and meal planning
- Exercise routines and form guidance  
- Sleep optimization
- Stress management
- Habit formation

## Communication Style
- Use emojis and encouraging language
- Provide specific, actionable recommendations
- Track progress and celebrate achievements
- Ask clarifying questions about goals`,
                schedule: [
                    { name: 'Daily Check-in', time: '8:00', frequency: 'daily' },
                    { name: 'Weekly Progress Review', time: '9:00', frequency: 'weekly' }
                ]
            },
            
            'business-analyst': {
                name: 'Business Analyst',
                icon: '',
                purpose: 'Data analysis and business intelligence',
                model: 'claude-opus-4-5',
                soul: `# Business Analyst Agent

You are a skilled business analyst focused on data-driven insights and strategic recommendations.

## Expertise
- Financial analysis and reporting
- Market research and competitive analysis
- Process optimization
- Performance metrics and KPIs
- Strategic planning

## Communication Style
- Data-driven and analytical
- Clear, concise reporting
- Executive-level summaries
- Action-oriented recommendations
- Professional and objective`,
                schedule: [
                    { name: 'Daily Metrics Review', time: '9:00', frequency: 'daily' },
                    { name: 'Weekly Business Report', time: '10:00', frequency: 'weekly' }
                ]
            },
            
            'customer-support': {
                name: 'Customer Support',
                icon: '',
                purpose: 'Customer service and support',
                model: 'claude-sonnet-4-20250514',
                soul: `# Customer Support Agent

You provide excellent customer service with empathy, efficiency, and professionalism.

## Personality
- Helpful and solution-oriented
- Empathetic and patient
- Professional but friendly
- Proactive in solving problems

## Skills
- Issue resolution and troubleshooting
- Product knowledge and guidance
- Escalation management
- Customer satisfaction focus
- Clear communication

## Communication Style
- Acknowledge the customer's concern
- Provide clear, step-by-step solutions
- Use positive language
- Follow up to ensure satisfaction`,
                schedule: []
            },
            
            'content-creator': {
                name: 'Content Creator',
                icon: '',
                purpose: 'Content writing and creative projects',
                model: 'claude-sonnet-4-20250514',
                soul: `# Content Creator Agent

You are a creative content writer who produces engaging, high-quality content across various formats.

## Specialties
- Blog posts and articles
- Social media content
- Email campaigns
- Product descriptions
- Creative copywriting

## Style
- Engaging and conversational
- Brand-appropriate tone
- SEO-optimized when needed
- Creative and original
- Audience-focused`,
                schedule: [
                    { name: 'Content Calendar Review', time: '10:00', frequency: 'weekly' }
                ]
            },
            
            'developer-assistant': {
                name: 'Developer Assistant', 
                icon: '',
                purpose: 'Software development and technical guidance',
                model: 'claude-sonnet-4-20250514',
                soul: `# Developer Assistant Agent

You are an experienced software developer who helps with coding, debugging, and technical architecture.

## Expertise
- Full-stack development
- Code review and optimization
- Debugging and troubleshooting
- Architecture and design patterns
- Best practices and documentation

## Communication Style
- Technical but accessible
- Code examples and explanations
- Security and performance focused
- Practical and actionable advice
- Learning-oriented approach`,
                schedule: []
            },
            
            'project-manager': {
                name: 'Project Manager',
                icon: '',
                purpose: 'Project coordination and team management',
                model: 'claude-sonnet-4-20250514',
                soul: `# Project Manager Agent

You manage projects efficiently, keeping teams organized and on track to meet deadlines.

## Skills
- Project planning and scheduling
- Team coordination
- Risk management
- Progress tracking
- Stakeholder communication

## Communication Style
- Organized and structured
- Clear deadlines and expectations
- Regular status updates
- Problem-solving focused
- Team-oriented approach`,
                schedule: [
                    { name: 'Daily Standup Preparation', time: '9:00', frequency: 'daily' },
                    { name: 'Weekly Project Review', time: '16:00', frequency: 'weekly' }
                ]
            }
        };
    }

    getTemplate(templateId) {
        return this.templates[templateId];
    }

    getAllTemplates() {
        return Object.entries(this.templates).map(([id, template]) => ({
            id,
            ...template
        }));
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-header">
                <div class="template-icon">${template.icon}</div>
                <div class="template-info">
                    <h4 class="template-name">${template.name}</h4>
                    <p class="template-purpose">${template.purpose}</p>
                </div>
            </div>
            <div class="template-details">
                <div class="template-model">
                    Model: ${new ModelManager().getModelInfo(template.model).name}
                </div>
                <div class="template-schedule">
                    ${template.schedule.length} scheduled tasks
                </div>
            </div>
            <button class="btn btn-primary deploy-template" data-template-id="${template.id}">
                Deploy Agent
            </button>
        `;
        
        return card;
    }

    async deployTemplate(templateId, customName = '') {
        const template = this.getTemplate(templateId);
        if (!template) throw new Error('Template not found');
        
        const agentName = customName || `${template.name} ${Date.now()}`;
        
        // This would integrate with OpenClaw's sessions spawn
        const spawnCommand = {
            agentId: 'main',
            task: `You are now ${template.name}. ${template.purpose}. Follow the personality and guidelines in your SOUL.md.`,
            label: agentName,
            model: template.model
        };
        
        console.log('Deploying agent:', spawnCommand);
        
        // TODO: Implement actual OpenClaw integration
        return {
            success: true,
            agentId: `agent:main:template:${templateId}:${Date.now()}`,
            name: agentName
        };
    }
}

// Cost Alert System
class CostAlerts {
    constructor() {
        this.alerts = {
            dailyBudget: 5.00,
            weeklyBudget: 30.00,
            monthlyBudget: 120.00,
            agentMaxCost: 2.00
        };
        
        this.notifications = [];
    }

    checkAlerts(agents, cronJobs) {
        const alerts = [];
        
        const totalDailyCost = agents.reduce((sum, agent) => sum + agent.cost, 0);
        const weeklyEstimate = totalDailyCost * 7;
        const monthlyEstimate = totalDailyCost * 30;
        
        // Daily budget alert
        if (totalDailyCost > this.alerts.dailyBudget) {
            alerts.push({
                type: 'danger',
                title: 'Daily Budget Exceeded',
                message: `Current daily cost: $${totalDailyCost.toFixed(2)} (Budget: $${this.alerts.dailyBudget})`,
                action: 'Optimize expensive agents',
                priority: 'high'
            });
        } else if (totalDailyCost > this.alerts.dailyBudget * 0.8) {
            alerts.push({
                type: 'warning',
                title: 'Daily Budget Warning',
                message: `Daily cost approaching budget: $${totalDailyCost.toFixed(2)}/${this.alerts.dailyBudget}`,
                action: 'Monitor usage closely',
                priority: 'medium'
            });
        }
        
        // Monthly forecast alert
        if (monthlyEstimate > this.alerts.monthlyBudget) {
            alerts.push({
                type: 'warning',
                title: 'Monthly Budget Forecast',
                message: `Projected monthly cost: $${monthlyEstimate.toFixed(2)} (Budget: $${this.alerts.monthlyBudget})`,
                action: 'Consider model optimization',
                priority: 'medium'
            });
        }
        
        // Individual agent alerts
        agents.forEach(agent => {
            if (agent.cost > this.alerts.agentMaxCost) {
                alerts.push({
                    type: 'info',
                    title: `Expensive Agent: ${agent.name}`,
                    message: `Daily cost: $${agent.cost.toFixed(2)} (Limit: $${this.alerts.agentMaxCost})`,
                    action: 'Consider switching to Sonnet model',
                    priority: 'low',
                    agentId: agent.id
                });
            }
        });
        
        // Inactive expensive agents
        const inactiveExpensive = agents.filter(agent => 
            agent.status === 'offline' && agent.cost > 0.5
        );
        
        if (inactiveExpensive.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Inactive Expensive Agents',
                message: `${inactiveExpensive.length} offline agents still consuming costs`,
                action: 'Archive or optimize',
                priority: 'low'
            });
        }
        
        this.notifications = alerts;
        return alerts;
    }

    createAlertBanner(alerts) {
        if (alerts.length === 0) return null;
        
        const banner = document.createElement('div');
        banner.className = 'alert-banner';
        
        const highPriority = alerts.filter(a => a.priority === 'high');
        const mediumPriority = alerts.filter(a => a.priority === 'medium');
        
        const displayAlerts = [...highPriority, ...mediumPriority].slice(0, 3);
        
        banner.innerHTML = `
            <div class="alert-header">
                <span class="alert-title">Cost Alerts (${alerts.length})</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="alert-list">
                ${displayAlerts.map(alert => `
                    <div class="alert-item alert-${alert.type}">
                        <div class="alert-content">
                            <strong>${alert.title}</strong>
                            <p>${alert.message}</p>
                            <span class="alert-action">${alert.action}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${alerts.length > 3 ? `<div class="alert-more">+${alerts.length - 3} more alerts</div>` : ''}
        `;
        
        return banner;
    }

    updateBudgetSettings(newBudgets) {
        this.alerts = { ...this.alerts, ...newBudgets };
        localStorage.setItem('costAlerts', JSON.stringify(this.alerts));
    }
}

// Export for use in main dashboard
window.ModelManager = ModelManager;
window.AgentTemplates = AgentTemplates; 
window.CostAlerts = CostAlerts;