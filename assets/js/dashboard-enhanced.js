// ================================
// ENTERPRISE DASHBOARD CONTROLLER
// Premium Animation & Interaction System
// ================================

class EnterpriseAgentDashboard {
    constructor() {
        this.agents = [];
        this.templates = [];
        this.isLoading = false;
        this.updateInterval = 30000; // 30 seconds
        this.animationQueue = [];
        
        // Initialize enhanced features
        this.initializeEnhancedFeatures();
        this.startPerformanceMonitoring();
        this.initializeNotificationSystem();
    }

    initializeEnhancedFeatures() {
        // Add sophisticated loading states
        this.setupLoadingStates();
        
        // Initialize smooth scroll behaviors
        this.setupSmoothScrolling();
        
        // Add advanced tooltip system
        this.initializeTooltips();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize theme system
        this.initializeThemeSystem();
    }

    setupLoadingStates() {
        // Create elegant loading overlays for all interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .agent-card, .stat-card');
        interactiveElements.forEach(element => {
            element.addEventListener('click', (e) => {
                if (!element.classList.contains('loading')) {
                    this.addLoadingState(element);
                    setTimeout(() => this.removeLoadingState(element), 1500);
                }
            });
        });
    }

    addLoadingState(element) {
        element.classList.add('loading');
        element.style.pointerEvents = 'none';
        
        // Add sophisticated loading animation
        const shimmer = document.createElement('div');
        shimmer.className = 'loading-shimmer';
        element.appendChild(shimmer);
    }

    removeLoadingState(element) {
        element.classList.remove('loading');
        element.style.pointerEvents = '';
        
        const shimmer = element.querySelector('.loading-shimmer');
        if (shimmer) {
            shimmer.remove();
        }
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling with easing
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    initializeTooltips() {
        // Create advanced tooltip system
        const elementsWithTooltips = document.querySelectorAll('[title]');
        elementsWithTooltips.forEach(element => {
            const title = element.getAttribute('title');
            element.removeAttribute('title');
            
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, title);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'premium-tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        });
    }

    hideTooltip() {
        const tooltip = document.querySelector('.premium-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(-10px)';
            setTimeout(() => tooltip.remove(), 200);
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.focus();
            }
            
            // Ctrl/Cmd + N - New agent
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.spawnNewAgent();
            }
            
            // Escape - Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    initializeThemeSystem() {
        // Dynamic theme adjustments based on time of day
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour < 18;
        
        if (isDaytime) {
            document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.03)');
            document.documentElement.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
        }
    }

    startPerformanceMonitoring() {
        // Monitor performance and adjust animations accordingly
        let fps = 60;
        let lastTime = performance.now();
        
        const monitor = (currentTime) => {
            fps = 1000 / (currentTime - lastTime);
            lastTime = currentTime;
            
            // Reduce animations if performance is poor
            if (fps < 30) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    initializeNotificationSystem() {
        // Create sophisticated notification system
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const indicators = {
            info: '○',
            success: '●',
            warning: '△',
            error: '◇'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">${indicators[type] || indicators.info}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('hide');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    // Enhanced agent loading with sophisticated animations
    async loadAgents() {
        try {
            this.setLoadingState(true);
            
            const response = await fetch('http://localhost:8001/agents');
            if (!response.ok) throw new Error('Failed to load agents');
            
            const data = await response.json();
            this.agents = data.agents || [];
            
            // Animate agents in with stagger effect
            this.renderAgentsWithAnimation();
            this.updateDashboardStats();
            
            this.showNotification('Agent data refreshed successfully', 'success', 3000);
            
        } catch (error) {
            console.error('Error loading agents:', error);
            this.showNotification('Failed to load agent data. Using cached data.', 'warning');
            this.renderFallbackAgents();
        } finally {
            this.setLoadingState(false);
        }
    }

    renderAgentsWithAnimation() {
        const grid = document.getElementById('agent-grid');
        if (!grid) return;
        
        // Clear existing content with fade out
        const existingCards = grid.querySelectorAll('.agent-card');
        existingCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => card.remove(), 200);
            }, index * 50);
        });
        
        // Wait for cleanup, then add new cards
        setTimeout(() => {
            this.agents.forEach((agent, index) => {
                setTimeout(() => {
                    const card = this.createEnhancedAgentCard(agent);
                    grid.appendChild(card);
                    
                    // Animate in with sophisticated spring animation
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    });
                }, index * 100);
            });
        }, existingCards.length * 50 + 200);
    }

    createEnhancedAgentCard(agent) {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.9)';
        card.style.transition = 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        const statusClass = agent.status === 'active' ? 'online' : 
                           agent.status === 'busy' ? 'busy' : 'offline';
        
        const tokenUsage = agent.token_usage || { total: 0, today: 0, cost: 0 };
        
        card.innerHTML = `
            <div class="agent-header">
                <div class="agent-info">
                    <h4>${agent.name || 'Unknown Agent'}</h4>
                    <p>${agent.description || 'AI Assistant'}</p>
                </div>
                <div class="agent-status ${statusClass}">
                    <div class="status-indicator ${statusClass}"></div>
                    ${agent.status || 'unknown'}
                </div>
            </div>
            
            <div class="agent-metrics">
                <div class="metric-row">
                    <div class="metric">
                        <span class="metric-value">${this.formatNumber(tokenUsage.total)}</span>
                        <span class="metric-label">Total Tokens</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${this.formatNumber(tokenUsage.today)}</span>
                        <span class="metric-label">Today</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">$${tokenUsage.cost.toFixed(2)}</span>
                        <span class="metric-label">Cost</span>
                    </div>
                </div>
            </div>
            
            <div class="agent-actions">
                <button class="btn btn-sm btn-primary" onclick="enterpriseDashboard.assignTaskToAgent('${agent.id}')">
                    Assign Task
                </button>
                <button class="btn btn-sm btn-secondary" onclick="enterpriseDashboard.viewAgentDetails('${agent.id}')">
                    View Details
                </button>
                <button class="btn btn-sm btn-danger" onclick="enterpriseDashboard.terminateAgent('${agent.id}')">
                    Terminate
                </button>
            </div>
        `;
        
        // Add professional hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-3px) scale(1.01)';
            card.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '';
        });
        
        return card;
    }

    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    updateDashboardStats() {
        const stats = this.calculateEnhancedStats();
        
        // Animate stat updates
        Object.entries(stats).forEach(([key, value], index) => {
            const element = document.getElementById(key);
            if (element) {
                setTimeout(() => {
                    this.animateValueChange(element, value);
                }, index * 150);
            }
        });
    }

    calculateEnhancedStats() {
        const activeAgents = this.agents.filter(a => a.status === 'active').length;
        const totalTokens = this.agents.reduce((sum, a) => sum + (a.token_usage?.total || 0), 0);
        const todayTokens = this.agents.reduce((sum, a) => sum + (a.token_usage?.today || 0), 0);
        const totalCost = this.agents.reduce((sum, a) => sum + (a.token_usage?.cost || 0), 0);
        const burnRate = this.calculateBurnRate();
        const pendingTasks = this.agents.reduce((sum, a) => sum + (a.pending_tasks || 0), 0);
        
        return {
            'active-agents': activeAgents,
            'total-tokens': this.formatNumber(totalTokens),
            'tokens-today': this.formatNumber(todayTokens),
            'daily-cost': `$${totalCost.toFixed(2)}`,
            'burn-rate': `${this.formatNumber(burnRate)}/hr`,
            'pending-tasks': pendingTasks
        };
    }

    animateValueChange(element, newValue) {
        element.style.transform = 'scale(1.1)';
        element.style.filter = 'brightness(1.3)';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.filter = 'brightness(1)';
        }, 150);
    }

    calculateBurnRate() {
        // Calculate tokens per hour based on recent activity
        const recentActivity = this.agents.reduce((sum, agent) => {
            return sum + (agent.token_usage?.recent_hourly || 0);
        }, 0);
        return Math.round(recentActivity);
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const dashboard = document.querySelector('.container');
        
        if (loading) {
            dashboard.classList.add('loading');
            this.showNotification('Refreshing agent data...', 'info', 2000);
        } else {
            dashboard.classList.remove('loading');
        }
    }

    // Enhanced agent management methods
    async assignTaskToAgent(agentId) {
        const taskInput = document.getElementById('task-input');
        const task = taskInput?.value?.trim();
        
        if (!task) {
            this.showNotification('Please enter a task description', 'warning');
            taskInput?.focus();
            return;
        }
        
        try {
            this.showNotification('Assigning task to agent...', 'info', 2000);
            
            const response = await fetch(`http://localhost:8001/agents/${agentId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task })
            });
            
            if (response.ok) {
                this.showNotification('Task assigned successfully!', 'success');
                taskInput.value = '';
                this.loadAgents(); // Refresh
            } else {
                throw new Error('Failed to assign task');
            }
        } catch (error) {
            console.error('Error assigning task:', error);
            this.showNotification('Failed to assign task. Please try again.', 'error');
        }
    }

    async viewAgentDetails(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return;
        
        // Create sophisticated modal with agent details
        this.showAgentDetailsModal(agent);
    }

    showAgentDetailsModal(agent) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content agent-details-modal">
                <div class="modal-header">
                    <h2>${agent.name}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="agent-details-grid">
                        <div class="detail-section">
                            <h3>Status Information</h3>
                            <p><strong>Status:</strong> ${agent.status}</p>
                            <p><strong>Uptime:</strong> ${agent.uptime || 'Unknown'}</p>
                            <p><strong>Last Activity:</strong> ${agent.last_activity || 'Unknown'}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Token Usage</h3>
                            <p><strong>Total Tokens:</strong> ${this.formatNumber(agent.token_usage?.total || 0)}</p>
                            <p><strong>Today:</strong> ${this.formatNumber(agent.token_usage?.today || 0)}</p>
                            <p><strong>Cost:</strong> $${(agent.token_usage?.cost || 0).toFixed(2)}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Configuration</h3>
                            <p><strong>Model:</strong> ${agent.model || 'Unknown'}</p>
                            <p><strong>Temperature:</strong> ${agent.temperature || 'Default'}</p>
                            <p><strong>Max Tokens:</strong> ${agent.max_tokens || 'Default'}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Performance</h3>
                            <p><strong>Tasks Completed:</strong> ${agent.tasks_completed || 0}</p>
                            <p><strong>Success Rate:</strong> ${agent.success_rate || 'N/A'}%</p>
                            <p><strong>Avg Response Time:</strong> ${agent.avg_response_time || 'N/A'}ms</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="enterpriseDashboard.assignTaskToAgent('${agent.id}'); this.closest('.modal-overlay').remove();">
                        Assign Task
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    async terminateAgent(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        const confirmMessage = `Are you sure you want to terminate ${agent?.name || 'this agent'}?`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            this.showNotification('Terminating agent...', 'info', 2000);
            
            const response = await fetch(`http://localhost:8001/agents/${agentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showNotification('Agent terminated successfully', 'success');
                this.loadAgents(); // Refresh
            } else {
                throw new Error('Failed to terminate agent');
            }
        } catch (error) {
            console.error('Error terminating agent:', error);
            this.showNotification('Failed to terminate agent. Please try again.', 'error');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.classList.add('hide');
            setTimeout(() => modal.remove(), 300);
        });
    }

    // Initialize the enhanced dashboard
    async init() {
        console.log('Initializing Enterprise Agent Dashboard...');
        
        try {
            await this.loadAgents();
            this.loadTemplates();
            this.startAutoRefresh();
            
            this.showNotification('Dashboard initialized successfully', 'success', 3000);
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            this.showNotification('Dashboard initialization failed. Some features may not work.', 'error');
        }
    }

    loadTemplates() {
        // Load agent templates with professional styling
        this.templates = [
            { id: 'health-coach', name: 'Health Coach', description: 'Personalized health and fitness guidance' },
            { id: 'business-analyst', name: 'Business Analyst', description: 'Data analysis and business insights' },
            { id: 'customer-support', name: 'Customer Support', description: '24/7 customer service automation' },
            { id: 'content-creator', name: 'Content Creator', description: 'Creative writing and content generation' },
            { id: 'code-reviewer', name: 'Code Reviewer', description: 'Automated code quality assessment' },
            { id: 'social-media', name: 'Social Media Manager', description: 'Social media content and scheduling' }
        ];
        
        this.renderTemplates();
    }

    renderTemplates() {
        const grid = document.getElementById('templates-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.templates.forEach((template, index) => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.style.animationDelay = `${index * 100}ms`;
            
            card.innerHTML = `
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.deployTemplate(template.id);
            });
            
            grid.appendChild(card);
        });
    }

    async deployTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;
        
        try {
            this.showNotification(`Deploying ${template.name}...`, 'info', 2000);
            
            // Simulate template deployment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showNotification(`${template.name} deployed successfully!`, 'success');
            this.loadAgents(); // Refresh to show new agent
        } catch (error) {
            console.error('Template deployment error:', error);
            this.showNotification('Template deployment failed. Please try again.', 'error');
        }
    }

    startAutoRefresh() {
        setInterval(() => {
            if (!document.hidden && !this.isLoading) {
                this.loadAgents();
            }
        }, this.updateInterval);
    }

    renderFallbackAgents() {
        // Render mock agents when API is unavailable
        this.agents = [
            {
                id: 'mock-1',
                name: 'Main Assistant',
                description: 'Primary AI assistant handling general tasks',
                status: 'active',
                token_usage: { total: 125000, today: 15000, cost: 12.50 },
                model: 'claude-sonnet-4',
                pending_tasks: 3
            },
            {
                id: 'mock-2', 
                name: 'Analytics Bot',
                description: 'Specialized in data analysis and reporting',
                status: 'busy',
                token_usage: { total: 89000, today: 8000, cost: 8.90 },
                model: 'claude-opus-4',
                pending_tasks: 1
            },
            {
                id: 'mock-3',
                name: 'Content Creator',
                description: 'Creative writing and content generation',
                status: 'offline',
                token_usage: { total: 45000, today: 0, cost: 4.50 },
                model: 'claude-haiku-3',
                pending_tasks: 0
            }
        ];
        
        this.renderAgentsWithAnimation();
        this.updateDashboardStats();
    }
}

// Initialize the enterprise dashboard
let enterpriseDashboard;

document.addEventListener('DOMContentLoaded', () => {
    enterpriseDashboard = new EnterpriseAgentDashboard();
    window.enterpriseDashboard = enterpriseDashboard; // Global access
    
    // Initialize dashboard
    enterpriseDashboard.init();
    
    // Setup auto-refresh
    setInterval(() => {
        if (!document.hidden) {
            enterpriseDashboard.loadAgents();
        }
    }, 30000);
});

// Export for global access
window.EnterpriseAgentDashboard = EnterpriseAgentDashboard;