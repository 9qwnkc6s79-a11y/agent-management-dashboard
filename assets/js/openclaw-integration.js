/**
 * OpenClaw Integration Script
 * Connects the Agent Management System to OpenClaw's APIs and services
 */

class OpenClawIntegration {
    constructor() {
        this.baseUrl = '/api'; // OpenClaw API base URL
        this.wsUrl = 'ws://localhost:8080/ws'; // WebSocket endpoint
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 5000;
        this.init();
    }

    async init() {
        this.setupWebSocket();
        this.startHealthCheck();
        console.log('OpenClaw Integration initialized');
    }

    // WebSocket Connection
    setupWebSocket() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket connected to OpenClaw');
                this.reconnectAttempts = 0;
                this.onConnectionRestored();
            };

            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            };

            this.ws.onclose = () => {
                console.log('WebSocket connection closed');
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.setupWebSocket();
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
            this.showConnectionError();
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'agent_status_update':
                this.updateAgentStatus(data.agentId, data.status);
                break;
            case 'cron_job_executed':
                this.notifyCronExecution(data.jobId, data.result);
                break;
            case 'cost_alert':
                this.showCostAlert(data.message, data.amount);
                break;
            case 'system_notification':
                this.showSystemNotification(data.message, data.priority);
                break;
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }

    // API Methods

    // Agent Management
    async getAgents() {
        try {
            const response = await fetch(`${this.baseUrl}/agents`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch agents:', error);
            return this.getMockAgents(); // Fallback to mock data
        }
    }

    async getAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch agent ${agentId}:`, error);
            return null;
        }
    }

    async createAgent(agentConfig) {
        try {
            const response = await fetch(`${this.baseUrl}/agents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(agentConfig)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to create agent:', error);
            throw error;
        }
    }

    async updateAgent(agentId, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to update agent ${agentId}:`, error);
            throw error;
        }
    }

    async deleteAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete agent ${agentId}:`, error);
            throw error;
        }
    }

    async sendMessageToAgent(agentId, message, priority = 'normal') {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    priority,
                    timestamp: Date.now()
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to send message to agent ${agentId}:`, error);
            throw error;
        }
    }

    async broadcastMessage(agentIds, message, priority = 'normal') {
        try {
            const response = await fetch(`${this.baseUrl}/agents/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    agentIds,
                    message,
                    priority,
                    timestamp: Date.now()
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to broadcast message:', error);
            throw error;
        }
    }

    // Cron Job Management
    async getCronJobs() {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch cron jobs:', error);
            return this.getMockCronJobs(); // Fallback to mock data
        }
    }

    async createCronJob(jobConfig) {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobConfig)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to create cron job:', error);
            throw error;
        }
    }

    async updateCronJob(jobId, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs/${jobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to update cron job ${jobId}:`, error);
            throw error;
        }
    }

    async deleteCronJob(jobId) {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs/${jobId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete cron job ${jobId}:`, error);
            throw error;
        }
    }

    async toggleCronJob(jobId) {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs/${jobId}/toggle`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to toggle cron job ${jobId}:`, error);
            throw error;
        }
    }

    async runCronJobNow(jobId) {
        try {
            const response = await fetch(`${this.baseUrl}/cron/jobs/${jobId}/run`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to run cron job ${jobId}:`, error);
            throw error;
        }
    }

    // Analytics and Metrics
    async getAnalytics(timeRange = 'week') {
        try {
            const response = await fetch(`${this.baseUrl}/analytics?range=${timeRange}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            return this.getMockAnalytics(); // Fallback to mock data
        }
    }

    async getCostBreakdown(timeRange = 'week') {
        try {
            const response = await fetch(`${this.baseUrl}/analytics/costs?range=${timeRange}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch cost breakdown:', error);
            return {};
        }
    }

    async getPerformanceMetrics(agentId = null) {
        const url = agentId 
            ? `${this.baseUrl}/analytics/performance/${agentId}`
            : `${this.baseUrl}/analytics/performance`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch performance metrics:', error);
            return {};
        }
    }

    // File Management
    async getAgentSoul(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/soul`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch agent soul ${agentId}:`, error);
            return '';
        }
    }

    async updateAgentSoul(agentId, soulContent) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/soul`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: soulContent
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error(`Failed to update agent soul ${agentId}:`, error);
            throw error;
        }
    }

    async getAgentMemory(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/memory`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch agent memory ${agentId}:`, error);
            return '';
        }
    }

    async updateAgentMemory(agentId, memoryContent) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/memory`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: memoryContent
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return true;
        } catch (error) {
            console.error(`Failed to update agent memory ${agentId}:`, error);
            throw error;
        }
    }

    async getWorkspaceFiles(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/workspace`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch workspace files ${agentId}:`, error);
            return [];
        }
    }

    // System Operations
    async getSystemStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/system/status`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch system status:', error);
            return { status: 'unknown', agents: 0, cronJobs: 0 };
        }
    }

    async restartAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/restart`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to restart agent ${agentId}:`, error);
            throw error;
        }
    }

    async pauseAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/pause`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to pause agent ${agentId}:`, error);
            throw error;
        }
    }

    async resumeAgent(agentId) {
        try {
            const response = await fetch(`${this.baseUrl}/agents/${agentId}/resume`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Failed to resume agent ${agentId}:`, error);
            throw error;
        }
    }

    // Event Handlers
    updateAgentStatus(agentId, status) {
        // Update UI elements with new agent status
        const agentCards = document.querySelectorAll(`[data-agent-id="${agentId}"]`);
        agentCards.forEach(card => {
            const statusElement = card.querySelector('.status');
            if (statusElement) {
                statusElement.className = `status status-${status}`;
                statusElement.innerHTML = `<span class="status-dot"></span>${status.charAt(0).toUpperCase() + status.slice(1)}`;
            }
        });

        // Show notification
        if (window.agentManager) {
            agentManager.showNotification(`Agent ${agentId} is now ${status}`, 'info');
        }
    }

    notifyCronExecution(jobId, result) {
        const message = result.success 
            ? `Cron job ${jobId} completed successfully`
            : `Cron job ${jobId} failed: ${result.error}`;
        
        const type = result.success ? 'success' : 'error';
        
        if (window.agentManager) {
            agentManager.showNotification(message, type);
        }
    }

    showCostAlert(message, amount) {
        if (window.agentManager) {
            agentManager.showNotification(`Cost Alert: ${message} ($${amount})`, 'warning');
        }
    }

    showSystemNotification(message, priority) {
        const type = priority === 'urgent' ? 'error' : priority === 'high' ? 'warning' : 'info';
        
        if (window.agentManager) {
            agentManager.showNotification(message, type);
        }
    }

    onConnectionRestored() {
        if (window.agentManager) {
            agentManager.showNotification('Connected to OpenClaw', 'success');
        }
    }

    showConnectionError() {
        if (window.agentManager) {
            agentManager.showNotification('Unable to connect to OpenClaw. Using offline mode.', 'warning');
        }
    }

    // Health Check
    startHealthCheck() {
        setInterval(async () => {
            try {
                await this.getSystemStatus();
            } catch (error) {
                console.warn('Health check failed:', error);
            }
        }, 60000); // Check every minute
    }

    // Fallback mock data (same as in main.js but organized here)
    getMockAgents() {
        return [
            {
                id: 'agent-main',
                name: 'Main Agent',
                status: 'active',
                model: 'claude-sonnet-4',
                tokensUsed: 45230,
                costToday: 2.45,
                responseTime: 1.2,
                lastActivity: Date.now() - 300000,
                soul: 'Primary assistant agent',
                memory: '2.3MB',
                sessions: 3
            },
            // ... other mock agents
        ];
    }

    getMockCronJobs() {
        return [
            {
                id: 'cron-weather',
                name: 'Weather Updates',
                schedule: '0 6,12,18 * * *',
                status: 'active',
                lastRun: Date.now() - 3600000,
                nextRun: Date.now() + 3600000,
                successRate: 98.5,
                agent: 'agent-main',
                description: 'Daily weather briefings'
            },
            // ... other mock cron jobs
        ];
    }

    getMockAnalytics() {
        return {
            totalCostToday: 8.15,
            totalCostWeek: 42.30,
            totalTokens: 174770,
            avgResponseTime: 1.34,
            activeAgents: 3,
            totalAgents: 5,
            activeCrons: 4,
            totalCrons: 5,
            efficiencyScore: 92.5
        };
    }

    // Utility Methods
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    sendWebSocketMessage(data) {
        if (this.isConnected()) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, message not sent:', data);
        }
    }

    // Configuration
    configure(config) {
        if (config.baseUrl) this.baseUrl = config.baseUrl;
        if (config.wsUrl) this.wsUrl = config.wsUrl;
        
        // Restart connections with new configuration
        if (this.ws) {
            this.ws.close();
        }
        this.setupWebSocket();
    }
}

// Global integration instance
window.openclawIntegration = new OpenClawIntegration();

// Extend existing managers to use real API calls
document.addEventListener('DOMContentLoaded', () => {
    // Replace mock functions in existing managers with real API calls
    if (window.agentManager) {
        const originalLoadAgents = window.agentManager.loadAgents;
        window.agentManager.loadAgents = async function() {
            try {
                this.agents = await window.openclawIntegration.getAgents();
                this.renderAgents();
            } catch (error) {
                console.warn('Using mock data due to API error');
                originalLoadAgents.call(this);
            }
        };
        
        const originalLoadCronJobs = window.agentManager.loadCronJobs;
        window.agentManager.loadCronJobs = async function() {
            try {
                this.cronJobs = await window.openclawIntegration.getCronJobs();
                this.renderCronJobs();
            } catch (error) {
                console.warn('Using mock data due to API error');
                originalLoadCronJobs.call(this);
            }
        };
    }
    
    // Similar extensions for other managers...
    console.log('OpenClaw integration enabled for all managers');
});