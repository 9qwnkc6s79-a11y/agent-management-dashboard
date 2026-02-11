#!/usr/bin/env python3
"""
Load real OpenClaw data and serve it to the dashboard
"""
import json
import subprocess
import sys
from datetime import datetime
import http.server
import socketserver
import urllib.parse
import threading
import time

def run_openclaw_command(command):
    """Execute OpenClaw command and return JSON result"""
    try:
        cmd = ['openclaw'] + command
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode != 0:
            print(f"Command failed: {' '.join(cmd)}")
            print(f"Error: {result.stderr}")
            return None
            
        if result.stdout.strip():
            return json.loads(result.stdout)
        else:
            return None
            
    except subprocess.TimeoutExpired:
        print(f"Command timed out: {' '.join(command)}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Raw output: {result.stdout}")
        return None
    except Exception as e:
        print(f"Error running command: {e}")
        return None

def get_live_data():
    """Fetch live data from OpenClaw"""
    print("🔄 Fetching live agent data...")
    
    # Get sessions
    sessions_data = run_openclaw_command(['sessions', 'list', '--json', '--limit', '20'])
    if not sessions_data:
        print("❌ Failed to get sessions data")
        sessions_data = {'sessions': []}
    
    # Get cron jobs  
    cron_data = run_openclaw_command(['cron', 'list', '--json'])
    if not cron_data:
        print("❌ Failed to get cron data") 
        cron_data = {'jobs': []}
    
    # Process agents
    agents = []
    for session in sessions_data.get('sessions', []):
        agent = process_agent(session)
        if agent:
            agents.append(agent)
    
    # Calculate stats
    stats = calculate_stats(agents, cron_data.get('jobs', []))
    
    return {
        'agents': agents,
        'cronJobs': cron_data.get('jobs', []),
        'stats': stats,
        'timestamp': datetime.now().isoformat()
    }

def process_agent(session):
    """Process a session into agent format"""
    try:
        # Use key instead of displayName for identification
        key = session.get('key', '')
        name = get_agent_name(key)
        purpose = get_agent_purpose(key)
        
        last_activity = session.get('updatedAt', 0)
        hours_ago = (datetime.now().timestamp() * 1000 - last_activity) / (1000 * 60 * 60)
        
        status = 'offline'
        if hours_ago < 1:
            status = 'active'
        elif hours_ago < 24:
            status = 'idle'
        
        tokens = session.get('totalTokens', 0)
        cost = estimate_cost(tokens, session.get('model', ''))
        
        return {
            'id': key,
            'name': name,
            'purpose': purpose,
            'model': session.get('model', 'unknown'),
            'status': status,
            'lastActivity': datetime.fromtimestamp(last_activity / 1000).isoformat(),
            'tokens': tokens,
            'cost': cost,
            'channel': session.get('channel', 'unknown')
        }
    except Exception as e:
        print(f"Error processing agent: {e}")
        return None

def get_agent_name(session_key):
    """Extract agent name from session key"""
    if 'agent:main:main' == session_key:
        return 'Troy (Main)'
    elif '-5251868903' in session_key:
        return 'Health Tracker'
    elif '-5158435516' in session_key:
        return 'Coffee Operations'
    elif '-5194650963' in session_key:
        return 'Developer Assistant'
    elif '-5269268988' in session_key:
        return 'Fitness App Dev'
    elif '-5189755761' in session_key:
        return 'VivPatch Team'
    elif '-1003697592279' in session_key:
        return 'Generic Group'
    elif 'cron:' in session_key.lower():
        return 'Scheduled Task'
    elif 'subagent:' in session_key:
        return 'Sub-Agent'
    else:
        # Extract meaningful part from key
        parts = session_key.split(':')
        if len(parts) > 2:
            return parts[-1].replace('-', ' ').title()[:20]
        return session_key[-15:]  # Show last part

def get_agent_purpose(session_key):
    """Get agent purpose from session key"""
    if 'agent:main:main' == session_key:
        return 'Primary assistant and command center'
    elif '-5251868903' in session_key:
        return 'Fitness tracking and nutrition logging'
    elif '-5158435516' in session_key:
        return 'Coffee shop operations and management'
    elif '-5194650963' in session_key:
        return 'Technical discussions and development'
    elif '-5269268988' in session_key:
        return 'Fitness application development'
    elif '-5189755761' in session_key:
        return 'Wellness patch brand development'
    elif '-1003697592279' in session_key:
        return 'General purpose group assistant'
    elif 'cron:' in session_key.lower():
        return 'Scheduled task automation'
    elif 'subagent:' in session_key:
        return 'Background sub-task processing'
    else:
        return 'General purpose assistant'

def estimate_cost(tokens, model):
    """Estimate cost based on tokens and model"""
    # Rough cost estimates (adjust based on actual pricing)
    if 'opus' in model.lower():
        return tokens * 0.000015  # Higher cost for Opus
    elif 'sonnet' in model.lower():
        return tokens * 0.000003  # Lower cost for Sonnet
    else:
        return tokens * 0.00001   # Default estimate

def calculate_stats(agents, cron_jobs):
    """Calculate dashboard statistics"""
    active_agents = len([a for a in agents if a['status'] == 'active'])
    pending_tasks = len([j for j in cron_jobs if j.get('enabled', False)])
    total_cost = sum(a['cost'] for a in agents)
    total_tokens = sum(a['tokens'] for a in agents)
    
    # Estimate today's usage (very rough)
    tokens_today = total_tokens * 0.1  # Assume 10% used today
    burn_rate = tokens_today / 24 if tokens_today > 0 else 0
    
    return {
        'activeAgents': active_agents,
        'pendingTasks': pending_tasks,
        'totalCost': round(total_cost, 2),
        'totalTokens': total_tokens,
        'tokensToday': int(tokens_today),
        'burnRate': int(burn_rate)
    }

class DataHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that serves static files and live data"""
    
    def do_GET(self):
        if self.path == '/api/data':
            self.serve_live_data()
        else:
            # Serve static files
            super().do_GET()
    
    def serve_live_data(self):
        """Serve live OpenClaw data as JSON"""
        try:
            data = get_live_data()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            json_data = json.dumps(data, indent=2)
            self.wfile.write(json_data.encode())
            
        except Exception as e:
            print(f"Error serving data: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'{"error": "Failed to load data"}')

def start_server():
    """Start HTTP server with live data integration"""
    PORT = 8001
    HOST = "0.0.0.0"  # Bind to all interfaces for mobile access
    
    print("🌐 Starting Agent Management Server...")
    print(f"📍 Desktop: http://localhost:{PORT}")
    print(f"📱 Mobile: http://192.168.1.126:{PORT}")
    print(f"📊 Live data API: http://192.168.1.126:{PORT}/api/data")
    print("⏹️  Press Ctrl+C to stop")
    
    try:
        with socketserver.TCPServer((HOST, PORT), DataHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

def main():
    if '--server' in sys.argv:
        start_server()
    else:
        # Just fetch and print data
        data = get_live_data()
        print("📊 Live Agent Data:")
        print("=" * 30)
        
        for agent in data['agents']:
            status_emoji = {'active': '🟢', 'idle': '🟡', 'offline': '🔴'}.get(agent['status'], '⚪')
            print(f"{status_emoji} {agent['name']}")
            print(f"   Tokens: {agent['tokens']:,} | Cost: ${agent['cost']:.3f} | Model: {agent['model']}")
            print()
        
        print(f"💰 Total Cost: ${data['stats']['totalCost']}")
        print(f"🔥 Total Tokens: {data['stats']['totalTokens']:,}")
        print(f"📈 Active Agents: {data['stats']['activeAgents']}")

if __name__ == "__main__":
    main()