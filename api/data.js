// Vercel serverless function for demo data
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Mock data for demo purposes
  const demoData = {
    agents: [
      {
        id: 'agent:main:main',
        name: 'Troy (Main)',
        purpose: 'Primary assistant and command center',
        model: 'claude-sonnet-4-20250514',
        status: 'active',
        lastActivity: new Date().toISOString(),
        tokens: 90203,
        cost: 0.27,
        channel: 'telegram'
      },
      {
        id: 'agent:main:telegram:group:-5251868903',
        name: 'Health Tracker',
        purpose: 'Fitness tracking and nutrition logging',
        model: 'claude-sonnet-4-20250514',
        status: 'active',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tokens: 89162,
        cost: 0.89,
        channel: 'telegram'
      },
      {
        id: 'agent:main:telegram:group:-5158435516',
        name: 'Coffee Operations',
        purpose: 'Coffee shop operations and management',
        model: 'claude-opus-4-5',
        status: 'idle',
        lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        tokens: 124278,
        cost: 1.86,
        channel: 'telegram'
      },
      {
        id: 'agent:main:telegram:group:-5194650963',
        name: 'Developer Assistant',
        purpose: 'Technical discussions and development',
        model: 'claude-sonnet-4-20250514',
        status: 'offline',
        lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        tokens: 91395,
        cost: 0.91,
        channel: 'telegram'
      },
      {
        id: 'agent:main:telegram:group:-5269268988',
        name: 'Fitness App Dev',
        purpose: 'Fitness application development',
        model: 'claude-sonnet-4-20250514',
        status: 'offline',
        lastActivity: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        tokens: 25864,
        cost: 0.26,
        channel: 'telegram'
      },
      {
        id: 'agent:main:telegram:group:-5189755761',
        name: 'VivPatch Team',
        purpose: 'Wellness patch brand development',
        model: 'claude-sonnet-4-20250514',
        status: 'offline',
        lastActivity: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        tokens: 28794,
        cost: 0.09,
        channel: 'telegram'
      }
    ],
    cronJobs: [
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
        name: 'Dinner Logging Reminder',
        enabled: true,
        schedule: { expr: '0 18 * * *' },
        delivery: { to: '-5251868903' },
        state: { nextRunAtMs: Date.now() + 21 * 60 * 60 * 1000 }
      },
      {
        id: 'de765e96-c608-4418-b38c-e3cd1f39a9f7',
        name: 'VivPatch Domain Registration',
        enabled: true,
        schedule: { expr: '0 9 1 2 *' },
        delivery: { to: 'main' },
        state: { nextRunAtMs: new Date('2026-02-01T09:00:00').getTime() }
      },
      {
        id: 'sample-weekly',
        name: 'Weekly Business Review',
        enabled: false,
        schedule: { expr: '0 9 * * 1' },
        delivery: { to: '-5158435516' },
        state: { nextRunAtMs: Date.now() + 7 * 24 * 60 * 60 * 1000 }
      }
    ],
    stats: {
      activeAgents: 2,
      pendingTasks: 5,
      totalCost: 4.28,
      totalTokens: 449696,
      tokensToday: 44970,
      burnRate: 1874
    },
    timestamp: new Date().toISOString()
  };

  res.status(200).json(demoData);
}