// Agent Management Dashboard - Enhanced Professional Version
class AgentDashboard {
    constructor() {
        this.agents = [];
        this.cronJobs = [];
        this.selectedAgents = new Set();
        this.stats = {};
        this.filters = {
            status: 'all',
            sort: 'name'
        };
        this.modelManager = new ModelManager();
        this.agentTemplates = new AgentTemplates();
        this.costAlerts = new CostAlerts();
        this.init();
    }

    async init() {
        try {
            await this.loadAgents();
            await this.loadCronJobs();
            this.renderDashboard();
            this.setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    setupEventListeners() {
        // Filter and sort listeners
        const filterSelect = document.getElementById('agent-filter');
        const sortSelect = document.getElementById('agent-sort');
        
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.renderAgentGrid();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.filters.sort = e.target.value;
                this.renderAgentGrid();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        openTaskModal();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshDashboard();
                        break;
                }
            }
        });
    }

    async loadAgents() {
        try {
            showLoadingOverlay();
            const response = await fetch('/api/data');
            
            if (response.ok) {
                const data = await response.json();
                this.agents = data.agents || [];
                this.cronJobs = data.cronJobs || [];
                this.stats = data.stats || this.calculateStats();
                
                // Add enhanced metrics
                this.enhanceAgentData();
                
                console.log('✅ Loaded live agent data:', data);
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            console.warn('Failed to load live data, using mock data:', error);
            this.agents = this.getMockAgents();
            this.cronJobs = this.getMockCronJobs();
            this.stats = this.calculateStats();
            this.enhanceAgentData();
        } finally {
            hideLoadingOverlay();
        }
    }

    async loadCronJobs() {
        // Data loaded together in loadAgents()
    }

    enhanceAgentData() {
        this.agents.forEach(agent => {
            // Calculate efficiency metrics
            agent.efficiency = agent.tokens > 0 ? (agent.tokens / agent.cost).toFixed(0) : 0;
            
            // Determine status level for better visualization
            agent.statusLevel = this.getStatusLevel(agent.status);
            
            // Calculate activity score
            agent.activityScore = this.calculateActivityScore(agent);
            
            // Add trend data (mock for now)
            agent.trend = this.generateTrendData(agent);
        });
    }

    getStatusLevel(status) {
        const levels = {
            'active': 3,
            'idle': 2,
            'offline': 1,
            'connecting': 1
        };
        return levels[status] || 1;
    }

    calculateActivityScore(agent) {
        const now = new Date();
        const lastActivity = new Date(agent.lastActivity);
        const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60);
        
        if (hoursSinceActivity < 1) return 100;
        if (hoursSinceActivity < 6) return 80;
        if (hoursSinceActivity < 24) return 60;
        if (hoursSinceActivity < 72) return 40;
        return 20;
    }

    generateTrendData(agent) {
        // Mock trend data - in real app this would come from historical data
        const trends = ['up', 'down', 'stable'];
        const trendIcons = { up: '↗', down: '↘', stable: '→' };
        const trend = trends[Math.floor(Math.random() * trends.length)];
        return {
            direction: trend,
            icon: trendIcons[trend],
            percentage: Math.floor(Math.random() * 30) + 5
        };
    }

    calculateStats() {
        const activeAgents = this.agents.filter(a => a.status === 'active').length;
        const pendingTasks = this.cronJobs.filter(j => j.enabled).length;
        const totalCost = this.agents.reduce((sum, agent) => sum + (agent.cost || 0), 0);
        const totalTokens = this.agents.reduce((sum, agent) => sum + (agent.tokens || 0), 0);
        const tokensToday = Math.round(totalTokens * 0.15); // Mock calculation
        const burnRate = Math.round(tokensToday / 24);

        return {
            activeAgents,
            pendingTasks,
            totalCost: totalCost.toFixed(2),
            totalTokens,
            tokensToday,
            burnRate
        };
    }

    getAgentCalendar(agentId) {
        return this.cronJobs
            .filter(job => {
                const deliveryTo = job.delivery?.to;
                return deliveryTo && (
                    deliveryTo === agentId || 
                    deliveryTo.includes(agentId) ||
                    job.agentId === 'main'
                );
            })
            .map(job => ({
                name: job.name,
                schedule: job.schedule.expr,
                nextRun: new Date(job.state.nextRunAtMs),
                enabled: job.enabled
            }))
            .sort((a, b) => a.nextRun - b.nextRun)
            .slice(0, 3);
    }

    renderDashboard() {
        this.renderCostAlerts();
        this.renderQuickStats();
        this.renderTokenAnalytics();
        this.renderAgentTemplates();
        this.renderAgentGrid();
        this.renderAgentSelector();
        
        // Add loading states
        this.addSkeletonLoaders();
    }

    renderQuickStats() {
        const stats = this.stats;
        
        this.updateStatWithAnimation('active-agents', stats.activeAgents || 0);
        this.updateStatWithAnimation('pending-tasks', stats.pendingTasks || 0);
        this.updateStatWithAnimation('daily-cost', `$${stats.totalCost || '0.00'}`);
        this.updateStatWithAnimation('total-tokens', `${Math.round((stats.totalTokens || 0) / 1000)}K`);
        this.updateStatWithAnimation('tokens-today', `${Math.round((stats.tokensToday || 0) / 1000)}K`);
        this.updateStatWithAnimation('burn-rate', `${stats.burnRate || 0}K/hr`);
    }

    updateStatWithAnimation(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.textContent = value;
            element.style.transform = 'scale(1)';
        }, 100);
    }

    renderTokenAnalytics() {
        const sortedAgents = [...this.agents].sort((a, b) => (b.tokens || 0) - (a.tokens || 0));
        
        this.renderTokenLeaderboard(sortedAgents);
        this.renderPerformanceMetrics(sortedAgents);
        this.renderTokenRecommendations(sortedAgents);
    }

    renderTokenLeaderboard(sortedAgents) {
        const leaderboard = document.getElementById('token-leaderboard');
        if (!leaderboard) return;
        
        leaderboard.innerHTML = '';
        
        sortedAgents.slice(0, 5).forEach((agent, index) => {
            const maxTokens = sortedAgents[0]?.tokens || 1;
            const percentage = maxTokens > 0 ? (agent.tokens / maxTokens * 100).toFixed(1) : '0';
            const costPerK = agent.tokens > 0 ? (agent.cost / (agent.tokens / 1000)).toFixed(3) : '0.000';
            
            const item = document.createElement('div');
            item.className = 'token-leaderboard-item';
            item.innerHTML = `
                <div class="leaderboard-rank">#${index + 1}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${agent.name}</div>
                    <div class="leaderboard-meta">
                        $${costPerK}/1K • ${agent.model.split('-').pop().toUpperCase()} • 
                        <span class="status status-${agent.status}">
                            <span class="status-dot"></span>
                            ${agent.status}
                        </span>
                    </div>
                </div>
                <div class="leaderboard-stats">
                    <div class="leaderboard-value">${Math.round(agent.tokens / 1000)}K</div>
                    <div class="leaderboard-percentage">${percentage}%</div>
                </div>
            `;
            
            // Add click handler for agent details
            item.addEventListener('click', () => this.showAgentDetails(agent.id));
            item.style.cursor = 'pointer';
            
            leaderboard.appendChild(item);
        });
    }

    renderPerformanceMetrics(sortedAgents) {
        const totalTokens = this.agents.reduce((sum, agent) => sum + (agent.tokens || 0), 0);
        const totalCost = this.agents.reduce((sum, agent) => sum + (agent.cost || 0), 0);
        const avgTokensPerAgent = this.agents.length > 0 ? totalTokens / this.agents.length : 0;
        const tokensPerDollar = totalCost > 0 ? totalTokens / totalCost : 0;
        
        // Find most efficient agent
        const mostEfficient = this.agents.reduce((best, agent) => {
            if (agent.cost === 0 || agent.tokens === 0) return best;
            const efficiency = agent.tokens / agent.cost;
            const bestEfficiency = best && best.tokens > 0 ? best.tokens / best.cost : 0;
            return efficiency > bestEfficiency ? agent : best;
        }, null);

        this.updateStatWithAnimation('avg-tokens-per-agent', `${Math.round(avgTokensPerAgent / 1000)}K`);
        this.updateStatWithAnimation('tokens-per-dollar', `${Math.round(tokensPerDollar / 1000)}K`);
        this.updateStatWithAnimation('most-efficient', mostEfficient ? mostEfficient.name : '--');
    }

    renderTokenRecommendations(sortedAgents) {
        const recommendations = this.generateRecommendations(sortedAgents);
        const container = document.getElementById('token-recommendations');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <span class="recommendation-icon">${rec.icon}</span>
                <span>${rec.text}</span>
            </div>
        `).join('');
    }

    renderCostAlerts() {
        const alerts = this.costAlerts.checkAlerts(this.agents, this.cronJobs);
        const container = document.getElementById('cost-alerts');
        
        if (alerts.length > 0) {
            const banner = this.costAlerts.createAlertBanner(alerts);
            container.innerHTML = '';
            container.appendChild(banner);
        } else {
            container.innerHTML = '';
        }
    }

    renderAgentTemplates() {
        const container = document.getElementById('templates-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const templates = this.agentTemplates.getAllTemplates();
        templates.forEach(template => {
            const templateCard = this.agentTemplates.createTemplateCard(template);
            
            // Add event listener for deployment
            const deployBtn = templateCard.querySelector('.deploy-template');
            deployBtn.addEventListener('click', async () => {
                try {
                    const result = await this.agentTemplates.deployTemplate(template.id);
                    if (result.success) {
                        showNotification(`${template.name} deployed successfully!`, 'success');
                        // Refresh agent list
                        setTimeout(() => this.loadAgents(), 2000);
                    }
                } catch (error) {
                    showNotification(`Failed to deploy ${template.name}: ${error.message}`, 'error');
                }
            });
            
            container.appendChild(templateCard);
        });
    }

    generateRecommendations(sortedAgents) {
        const recommendations = [];
        const totalCost = this.agents.reduce((sum, agent) => sum + (agent.cost || 0), 0);
        
        // High-cost agents using expensive models
        const expensiveAgents = this.agents.filter(agent => 
            agent.model && agent.model.includes('opus') && agent.tokens > 50000
        );
        if (expensiveAgents.length > 0) {
            recommendations.push({
                icon: '',
                text: `Consider switching ${expensiveAgents[0].name} to Sonnet for routine tasks (potential savings: ~$0.50/day)`
            });
        }

        // Inactive agents with high token usage
        const inactiveHighUsage = this.agents.filter(agent => 
            agent.status === 'offline' && agent.tokens > 25000
        );
        if (inactiveHighUsage.length > 0) {
            recommendations.push({
                icon: '🗄️',
                text: `Archive ${inactiveHighUsage[0].name} to reduce context costs and improve efficiency`
            });
        }

        // Cost optimization
        if (totalCost > 5) {
            recommendations.push({
                icon: '⚠️',
                text: `Daily cost ($${totalCost.toFixed(2)}) exceeds optimal range. Consider agent consolidation.`
            });
        } else if (totalCost < 1) {
            recommendations.push({
                icon: '📈',
                text: 'Low usage detected. Consider expanding agent capabilities for better ROI.'
            });
        } else {
            recommendations.push({
                icon: '✅',
                text: 'Token usage is well-optimized for your current agent fleet'
            });
        }

        // Performance recommendations
        const activeTokens = this.agents
            .filter(a => a.status === 'active')
            .reduce((sum, a) => sum + (a.tokens || 0), 0);
        
        if (activeTokens > 100000) {
            recommendations.push({
                icon: '🔍',
                text: 'High active token usage detected - monitor for runaway conversations'
            });
        }

        // Response time optimization
        const slowAgents = this.agents.filter(a => a.activityScore < 60);
        if (slowAgents.length > 0) {
            recommendations.push({
                icon: '⚡',
                text: `${slowAgents.length} agent(s) showing low activity. Consider performance review.`
            });
        }

        return recommendations.slice(0, 4); // Limit to 4 recommendations
    }

    renderAgentGrid() {
        const container = document.getElementById('agent-grid');
        if (!container) return;

        // Apply filters and sorting
        let filteredAgents = this.filterAgents();
        filteredAgents = this.sortAgents(filteredAgents);

        container.innerHTML = '';
        
        if (filteredAgents.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: var(--spacing-2xl); color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: var(--spacing-md);">🤖</div>
                    <h3>No agents found</h3>
                    <p>Try adjusting your filters or spawn a new agent to get started.</p>
                </div>
            `;
            return;
        }

        filteredAgents.forEach((agent, index) => {
            const card = this.createEnhancedAgentCard(agent);
            
            // Add stagger animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
            
            container.appendChild(card);
        });
    }

    filterAgents() {
        if (this.filters.status === 'all') {
            return this.agents;
        }
        return this.agents.filter(agent => agent.status === this.filters.status);
    }

    sortAgents(agents) {
        const sortFunctions = {
            name: (a, b) => a.name.localeCompare(b.name),
            status: (a, b) => b.statusLevel - a.statusLevel || a.name.localeCompare(b.name),
            tokens: (a, b) => (b.tokens || 0) - (a.tokens || 0),
            cost: (a, b) => (b.cost || 0) - (a.cost || 0)
        };
        
        return [...agents].sort(sortFunctions[this.filters.sort] || sortFunctions.name);
    }

    createEnhancedAgentCard(agent) {
        const card = document.createElement('div');
        card.className = 'agent-card agent-card-premium';
        
        const statusClass = `status-${agent.status}`;
        const statusIcon = {
            'active': '●',
            'idle': '●', 
            'offline': '●',
            'connecting': '●'
        }[agent.status] || '○';

        const calendar = this.getAgentCalendar(agent.id);
        const calendarHtml = calendar.length > 0 ? 
            `<div class="calendar-preview">
                <h4>📅 Upcoming Tasks</h4>
                ${calendar.map(item => `
                    <div class="calendar-item">
                        <span>${item.name}</span>
                        <span class="calendar-time">${this.formatDate(item.nextRun)}</span>
                    </div>
                `).join('')}
            </div>` : 
            `<div class="calendar-preview">
                <h4>📅 Schedule</h4>
                <div style="color: var(--text-muted); font-size: 0.8125rem; padding: var(--spacing-sm) 0;">
                    No scheduled tasks
                </div>
            </div>`;

        const efficiencyScore = agent.tokens > 0 ? Math.min(100, Math.round((agent.tokens / agent.cost) / 100)) : 0;

        card.innerHTML = `
            <div class="agent-status-indicator"></div>
            
            <div class="agent-header">
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <div class="agent-purpose">${agent.purpose}</div>
                    <div class="status ${statusClass}">
                        <span class="status-dot"></span>
                        ${agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                    </div>
                </div>
                <div style="font-size: 2rem; opacity: 0.8;">${statusIcon}</div>
            </div>
            
            <div class="agent-stats">
                <div class="stat">
                    <span class="stat-value">${Math.round((agent.tokens || 0) / 1000)}K</span>
                    <span class="stat-label">Tokens</span>
                </div>
                <div class="stat">
                    <span class="stat-value">$${(agent.cost || 0).toFixed(2)}</span>
                    <span class="stat-label">Cost</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${efficiencyScore}%</span>
                    <span class="stat-label">Efficiency</span>
                </div>
            </div>
            
            <div style="padding: var(--spacing-md); background: rgba(51, 65, 85, 0.2); border-radius: var(--radius); margin: var(--spacing-md) 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                    <span style="font-size: 0.8125rem; color: var(--text-secondary);">Model</span>
                    <span style="font-weight: var(--font-weight-semibold); color: var(--primary-color);">
                        ${agent.model ? agent.model.split('-').pop().toUpperCase() : 'Unknown'}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                    <span style="font-size: 0.8125rem; color: var(--text-secondary);">Activity</span>
                    <span style="color: ${agent.activityScore > 80 ? 'var(--success-color)' : agent.activityScore > 50 ? 'var(--warning-color)' : 'var(--danger-color)'};">
                        ${agent.activityScore}%
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8125rem; color: var(--text-secondary);">Last Seen</span>
                    <span style="font-size: 0.8125rem; color: var(--text-muted);">
                        ${this.formatRelativeTime(agent.lastActivity)}
                    </span>
                </div>
            </div>
            
            ${calendarHtml}
            
            <div class="agent-actions">
                <button class="btn btn-sm btn-primary" onclick="assignTaskToAgent('${agent.id}')" title="Assign Task">
                    📋 Task
                </button>
                <button class="btn btn-sm" onclick="messageAgent('${agent.id}')" title="Send Message">
                    💬 Message
                </button>
                <button class="btn btn-sm" onclick="dashboard.showAgentDetails('${agent.id}')" title="View Details">
                    👁️ Details
                </button>
                <button class="btn btn-sm" onclick="toggleAgentStatus('${agent.id}')" title="Toggle Status">
                    ${agent.status === 'active' ? '⏸️' : '▶️'}
                </button>
                <button class="btn btn-sm clone-agent-btn" onclick="dashboard.cloneAgent('${agent.id}')" title="Clone Agent">
                    🔗 Clone
                </button>
            </div>
        `;

        // Add model selector after creating the card
        const modelSelector = this.modelManager.createModelSelector(agent, (agentId, newModel) => {
            this.changeAgentModel(agentId, newModel);
        });
        
        card.appendChild(modelSelector);

        return card;
    }

    renderAgentSelector() {
        const container = document.getElementById('agent-selector');
        if (!container) return;

        container.innerHTML = '';

        this.agents.forEach(agent => {
            const chip = document.createElement('div');
            chip.className = 'agent-chip';
            chip.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--spacing-xs);">
                    <span class="status-dot" style="background: ${
                        agent.status === 'active' ? 'var(--success-color)' : 
                        agent.status === 'idle' ? 'var(--warning-color)' : 
                        'var(--danger-color)'
                    };"></span>
                    ${agent.name}
                </div>
            `;
            chip.onclick = () => this.toggleAgentSelection(chip, agent.id);
            chip.dataset.agentId = agent.id;
            container.appendChild(chip);
        });
    }

    toggleAgentSelection(chip, agentId) {
        chip.classList.toggle('selected');
        
        if (chip.classList.contains('selected')) {
            this.selectedAgents.add(agentId);
        } else {
            this.selectedAgents.delete(agentId);
        }
        
        // Update task input placeholder
        this.updateTaskInputPlaceholder();
    }

    updateTaskInputPlaceholder() {
        const taskInput = document.getElementById('task-input');
        if (!taskInput) return;
        
        if (this.selectedAgents.size === 0) {
            taskInput.placeholder = 'Select an agent first, then describe your task...';
        } else if (this.selectedAgents.size === 1) {
            const agentName = this.agents.find(a => this.selectedAgents.has(a.id))?.name;
            taskInput.placeholder = `Describe the task for ${agentName}...`;
        } else {
            taskInput.placeholder = `Describe the task for ${this.selectedAgents.size} selected agents...`;
        }
    }

    showAgentDetails(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return;

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                <div class="modal-header">
                    <h2>🤖 ${agent.name} - Detailed Overview</h2>
                </div>
                
                <div class="grid-2" style="gap: var(--spacing-xl);">
                    <div>
                        <h4 style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">Agent Information</h4>
                        <div style="space-y: var(--spacing-sm);">
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-primary);">
                                <span>Purpose</span>
                                <span style="color: var(--text-secondary);">${agent.purpose}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-primary);">
                                <span>Model</span>
                                <span style="color: var(--primary-color); font-weight: var(--font-weight-semibold);">${agent.model}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-primary);">
                                <span>Status</span>
                                <span class="status status-${agent.status}">
                                    <span class="status-dot"></span>
                                    ${agent.status}
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0; border-bottom: 1px solid var(--border-primary);">
                                <span>Channel</span>
                                <span style="color: var(--text-secondary);">${agent.channel || 'Unknown'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: var(--spacing-sm) 0;">
                                <span>Last Activity</span>
                                <span style="color: var(--text-secondary);">${new Date(agent.lastActivity).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">Performance Metrics</h4>
                        <div class="grid-2" style="gap: var(--spacing-md);">
                            <div class="stat-card">
                                <span class="metric-value text-primary">${(agent.tokens || 0).toLocaleString()}</span>
                                <span class="metric-label">Total Tokens</span>
                            </div>
                            <div class="stat-card">
                                <span class="metric-value text-warning">$${(agent.cost || 0).toFixed(3)}</span>
                                <span class="metric-label">Total Cost</span>
                            </div>
                            <div class="stat-card">
                                <span class="metric-value text-info">${agent.efficiency || 0}</span>
                                <span class="metric-label">Efficiency</span>
                            </div>
                            <div class="stat-card">
                                <span class="metric-value text-success">${agent.activityScore}%</span>
                                <span class="metric-label">Activity Score</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: var(--spacing-xl); padding-top: var(--spacing-lg); border-top: 1px solid var(--border-primary);">
                    <div class="d-flex gap-3">
                        <button class="btn btn-primary" onclick="assignTaskToAgent('${agent.id}'); this.closest('.modal').remove();">
                            📋 Assign Task
                        </button>
                        <button class="btn btn-success" onclick="messageAgent('${agent.id}');">
                            💬 Send Message
                        </button>
                        <button class="btn btn-danger" onclick="confirmAgentAction('${agent.id}', 'terminate');">
                            🛑 Terminate
                        </button>
                        <button class="btn" onclick="this.closest('.modal').remove();">
                            ❌ Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Tomorrow ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Date(date).toLocaleDateString();
    }

    addSkeletonLoaders() {
        // Add subtle loading animations to cards while data loads
        const cards = document.querySelectorAll('.agent-card, .stat-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    showError(message) {
        showNotification(message, 'error');
    }

    async refreshDashboard() {
        try {
            await this.loadAgents();
            this.renderDashboard();
            showNotification('Dashboard refreshed successfully', 'success');
        } catch (error) {
            this.showError('Failed to refresh dashboard');
        }
    }

    // Mock data methods (fallback when API is unavailable)
    getMockAgents() {
        return [
            {
                id: 'agent:main:main',
                name: 'Troy (Main)',
                purpose: 'Primary assistant and command center orchestration',
                model: 'claude-sonnet-4-20250514',
                status: 'active',
                lastActivity: new Date(),
                tokens: 22632,
                cost: 0.23,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5251868903',
                name: 'Health Tracker',
                purpose: 'Comprehensive fitness tracking and nutrition optimization',
                model: 'claude-sonnet-4-20250514',
                status: 'active',
                lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
                tokens: 89162,
                cost: 0.89,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5158435516',
                name: 'Coffee Operations',
                purpose: 'Boundaries Coffee business operations and customer service',
                model: 'claude-opus-4-5',
                status: 'idle',
                lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
                tokens: 124278,
                cost: 1.24,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5194650963',
                name: 'Developer Assistant',
                purpose: 'Technical discussions, code review, and development support',
                model: 'claude-sonnet-4-20250514',
                status: 'idle',
                lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
                tokens: 91395,
                cost: 0.91,
                channel: 'telegram'
            },
            {
                id: 'agent:main:telegram:group:-5269268988',
                name: 'Fitness App Dev',
                purpose: 'Specialized fitness application development and UX design',
                model: 'claude-sonnet-4-20250514',
                status: 'offline',
                lastActivity: new Date(Date.now() - 72 * 60 * 60 * 1000),
                tokens: 25864,
                cost: 0.26,
                channel: 'telegram'
            },
            {
                id: 'agent:research:001',
                name: 'Research Analyst',
                purpose: 'Market research, data analysis, and trend identification',
                model: 'claude-sonnet-4-20250514',
                status: 'active',
                lastActivity: new Date(Date.now() - 30 * 60 * 1000),
                tokens: 45123,
                cost: 0.45,
                channel: 'api'
            }
        ];
    }

    getMockCronJobs() {
        return [
            {
                id: 'c3b46ca1-980f-4638-9d46-ce4407be6366',
                name: 'Daily Weigh-In Reminder',
                enabled: true,
                schedule: { expr: '30 6 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: Date.now() + 10 * 60 * 60 * 1000 }
            },
            {
                id: '61339f7a-cda6-43b2-8f0e-d9f5a48539e1',
                name: 'Lunch Logging Reminder',
                enabled: true,
                schedule: { expr: '0 12 * * *' },
                delivery: { to: '-5251868903' },
                state: { nextRunAtMs: Date.now() + 15 * 60 * 60 * 1000 }
            },
            {
                id: '46306457-97c0-4fde-b7b6-c89c2a843df4',
                name: 'Coffee Shop Morning Briefing',
                enabled: true,
                schedule: { expr: '0 7 * * 1-5' },
                delivery: { to: '-5158435516' },
                state: { nextRunAtMs: Date.now() + 21 * 60 * 60 * 1000 }
            }
        ];
    }

    // Model Management Methods
    async changeAgentModel(agentId, newModel) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) {
            showNotification('Agent not found', 'error');
            return;
        }

        try {
            // TODO: Implement actual OpenClaw model switching
            console.log(`Changing ${agent.name} from ${agent.model} to ${newModel}`);
            
            // Update local state
            agent.model = newModel;
            
            // Recalculate cost
            agent.cost = this.modelManager.getModelInfo(newModel).cost * (agent.tokens / 1000);
            
            showNotification(`${agent.name} switched to ${this.modelManager.getModelInfo(newModel).name}`, 'success');
            
            // Refresh dashboard
            this.renderDashboard();
        } catch (error) {
            showNotification(`Failed to change model: ${error.message}`, 'error');
        }
    }

    async cloneAgent(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) {
            showNotification('Agent not found', 'error');
            return;
        }

        const newName = prompt(`Clone ${agent.name} as:`, `${agent.name} Clone`);
        if (!newName) return;

        try {
            // TODO: Implement actual OpenClaw agent cloning
            console.log(`Cloning ${agent.name} as ${newName}`);
            
            const cloneId = `agent:main:clone:${Date.now()}`;
            const clone = {
                ...agent,
                id: cloneId,
                name: newName,
                tokens: 0,
                cost: 0,
                status: 'offline',
                lastActivity: new Date().toISOString()
            };
            
            this.agents.push(clone);
            
            showNotification(`${agent.name} cloned as ${newName}`, 'success');
            this.renderAgentGrid();
        } catch (error) {
            showNotification(`Failed to clone agent: ${error.message}`, 'error');
        }
    }
}

// Global functions for UI interactions
async function assignTask() {
    if (dashboard.selectedAgents.size === 0) {
        showNotification('Please select at least one agent first', 'warning');
        return;
    }
    
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();
    
    if (!task) {
        showNotification('Please enter a task description', 'warning');
        taskInput.focus();
        return;
    }
    
    const priority = document.querySelector('.priority-btn.active')?.dataset.priority || 'normal';
    let successCount = 0;
    
    showLoadingOverlay();
    
    try {
        for (const agentId of dashboard.selectedAgents) {
            const agent = dashboard.agents.find(a => a.id === agentId);
            if (agent) {
                try {
                    await sendTaskToAgent(agentId, task, priority);
                    successCount++;
                    
                    // Visual feedback on agent card
                    const agentCard = document.querySelector(`[onclick*="${agentId}"]`)?.closest('.agent-card');
                    if (agentCard) {
                        agentCard.style.borderColor = 'var(--success-color)';
                        setTimeout(() => {
                            agentCard.style.borderColor = '';
                        }, 2000);
                    }
                } catch (error) {
                    console.error(`Failed to assign task to ${agent.name}:`, error);
                }
            }
        }
        
        if (successCount > 0) {
            showNotification(`Task assigned to ${successCount} agent(s)`, 'success');
            
            // Clear form
            dashboard.selectedAgents.clear();
            document.querySelectorAll('.agent-chip.selected').forEach(chip => {
                chip.classList.remove('selected');
            });
            taskInput.value = '';
            dashboard.updateTaskInputPlaceholder();
            
            // Reset priority to normal
            document.querySelectorAll('.priority-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-priority="normal"]').classList.add('active');
        } else {
            showNotification('Failed to assign task to any agent', 'error');
        }
    } finally {
        hideLoadingOverlay();
    }
}

async function sendTaskToAgent(agentId, task, priority = 'normal') {
    const priorityText = `${priority.toUpperCase()} PRIORITY`;
    const formattedTask = `${priorityText}\n\n${task}`;
    
    try {
        // Simulate API call - in real implementation, this would use OpenClaw sessions
        console.log('Sending task:', { agentId, task: formattedTask, priority });
        
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Simulate success/failure
        if (Math.random() > 0.9) {
            throw new Error('Network error');
        }
        
        return { success: true };
    } catch (error) {
        throw new Error(`Failed to send task: ${error.message}`);
    }
}

function assignTaskToAgent(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    // Clear previous selections
    dashboard.selectedAgents.clear();
    document.querySelectorAll('.agent-chip').forEach(chip => {
        chip.classList.remove('selected');
    });
    
    // Select this agent
    const chip = document.querySelector(`[data-agent-id="${agentId}"]`);
    if (chip) {
        chip.classList.add('selected');
        dashboard.selectedAgents.add(agentId);
    }
    
    // Focus on task input and scroll to it
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.focus();
        taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    dashboard.updateTaskInputPlaceholder();
    showNotification(`Selected ${agent.name} for task assignment`, 'info');
}

async function messageAgent(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const message = prompt(`Send message to ${agent.name}:\n\n(This will be sent immediately)`);
    
    if (message && message.trim()) {
        try {
            showLoadingOverlay();
            await sendTaskToAgent(agentId, message, 'normal');
            showNotification(`Message sent to ${agent.name}`, 'success');
        } catch (error) {
            showNotification(`Failed to send message to ${agent.name}`, 'error');
        } finally {
            hideLoadingOverlay();
        }
    }
}

async function spawnNewAgent() {
    const name = prompt('Agent name:');
    if (!name || !name.trim()) return;
    
    const task = prompt('Initial task/purpose:');
    if (!task || !task.trim()) return;
    
    try {
        showLoadingOverlay();
        
        // Simulate agent spawning
        console.log('Spawning new agent:', { name: name.trim(), task: task.trim() });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        showNotification(`Agent "${name}" is being spawned...`, 'info');
        
        // Refresh dashboard after spawn
        setTimeout(async () => {
            await dashboard.refreshDashboard();
        }, 3000);
        
    } catch (error) {
        showNotification('Failed to spawn new agent', 'error');
    } finally {
        hideLoadingOverlay();
    }
}

function toggleAgentStatus(agentId) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const newStatus = agent.status === 'active' ? 'idle' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'pause';
    
    if (confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${agent.name}?`)) {
        agent.status = newStatus;
        dashboard.renderAgentGrid();
        showNotification(`${agent.name} ${action}d`, 'success');
    }
}

function confirmAgentAction(agentId, action) {
    const agent = dashboard.agents.find(a => a.id === agentId);
    if (!agent) return;
    
    const actionText = {
        terminate: 'terminate',
        restart: 'restart',
        archive: 'archive'
    }[action] || action;
    
    if (confirm(`Are you sure you want to ${actionText} ${agent.name}?\n\nThis action cannot be undone.`)) {
        showNotification(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ing ${agent.name}...`, 'info');
        // In real implementation, this would make API calls
    }
}

function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: var(--spacing-xl);
        right: var(--spacing-xl);
        padding: var(--spacing-md) var(--spacing-xl);
        border-radius: var(--radius-lg);
        color: white;
        font-weight: var(--font-weight-medium);
        font-size: 0.875rem;
        z-index: var(--z-tooltip);
        max-width: 400px;
        box-shadow: var(--shadow-lg);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transform: translateX(100%);
        transition: var(--transition);
    `;
    
    const colors = {
        success: 'rgba(16, 185, 129, 0.9)',
        error: 'rgba(239, 68, 68, 0.9)',
        warning: 'rgba(245, 158, 11, 0.9)',
        info: 'rgba(59, 130, 246, 0.9)'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
            <span style="font-size: 1rem;">${icons[type] || icons.info}</span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

function openTaskModal() {
    document.getElementById('task-modal').classList.add('active');
    
    // Populate agent dropdown
    const agentSelect = document.getElementById('task-agent');
    if (agentSelect && dashboard.agents) {
        agentSelect.innerHTML = dashboard.agents.map(agent => 
            `<option value="${agent.id}">${agent.name} (${agent.status})</option>`
        ).join('');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function submitTask(event) {
    event.preventDefault();
    
    const agentId = document.getElementById('task-agent').value;
    const priority = document.getElementById('task-priority').value;
    const description = document.getElementById('task-description').value.trim();
    const duration = document.getElementById('task-duration').value;
    
    if (!description) {
        showNotification('Please enter a task description', 'warning');
        return;
    }
    
    const enhancedDescription = `${description}\n\nEstimated Duration: ${duration}\nPriority: ${priority}`;
    
    sendTaskToAgent(agentId, enhancedDescription, priority)
        .then(() => {
            showNotification('Task assigned successfully', 'success');
            closeModal('task-modal');
            document.getElementById('task-description').value = '';
        })
        .catch(() => {
            showNotification('Failed to assign task', 'error');
        });
}

// Utility functions for loading states
function showLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Navigation functions
function openProfileManager() {
    showNotification('Profile Manager - Coming Soon!', 'info');
}

// Template deployment functions
async function deployQuickTemplate(templateId) {
    if (!dashboard || !dashboard.agentTemplates) {
        showNotification('Dashboard not ready', 'error');
        return;
    }

    try {
        const template = dashboard.agentTemplates.getTemplate(templateId);
        if (!template) {
            showNotification('Template not found', 'error');
            return;
        }

        const result = await dashboard.agentTemplates.deployTemplate(templateId);
        if (result.success) {
            showNotification(`${template.name} deployed successfully!`, 'success');
            // Refresh dashboard after a short delay
            setTimeout(() => {
                if (dashboard) {
                    dashboard.loadAgents();
                }
            }, 2000);
        }
    } catch (error) {
        showNotification(`Failed to deploy template: ${error.message}`, 'error');
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new AgentDashboard();
});

// Export for debugging
window.dashboard = dashboard;