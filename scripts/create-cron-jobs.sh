#!/bin/bash
# TheKeyn Platform Monitoring Cron Jobs Setup
# This script creates periodic monitoring jobs for production systems

echo "🕐 Setting up periodic monitoring jobs for TheKeyn platform..."

# Create monitoring script that can be called by cron
cat > /tmp/thekeyn-monitor.sh << 'EOF'
#!/bin/bash
cd /app
npm run monitor >> /var/log/thekeyn-monitor.log 2>&1
EOF

chmod +x /tmp/thekeyn-monitor.sh

# Create schema verification script
cat > /tmp/thekeyn-schema-check.sh << 'EOF'
#!/bin/bash
cd /app
npm run verify-schema >> /var/log/thekeyn-schema.log 2>&1
EOF

chmod +x /tmp/thekeyn-schema-check.sh

echo "📋 Recommended cron jobs (add to crontab with 'crontab -e'):"
echo ""
echo "# Run health monitoring every hour"
echo "0 * * * * /tmp/thekeyn-monitor.sh"
echo ""
echo "# Run schema verification twice daily"
echo "0 8,20 * * * /tmp/thekeyn-schema-check.sh"
echo ""
echo "# Weekly comprehensive health check (Sundays at 2 AM)"
echo "0 2 * * 0 cd /app && npm run test:integration >> /var/log/thekeyn-tests.log 2>&1"
echo ""
echo "📝 Manual setup required:"
echo "1. Copy scripts to appropriate location (e.g., /usr/local/bin/)"
echo "2. Ensure log directories exist (/var/log/)"
echo "3. Set up log rotation for monitoring logs"
echo "4. Configure alerting based on log outputs"
echo ""
echo "For Railway deployment:"
echo "- Use Railway's environment variables for configuration"
echo "- Set up external monitoring services (e.g., Uptime Robot)"
echo "- Configure alerts via Railway's notification system"