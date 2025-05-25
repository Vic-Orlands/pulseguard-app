#!/bin/bash

# Gradient colors
C_CYAN="\033[38;5;45m"
C_RESET="\033[0m"

echo "Cleaning up old containers..."
docker-compose down --remove-orphans --timeout 1 2>/dev/null || true
docker stop grafana loki prometheus 2>/dev/null || true
docker rm -f grafana loki prometheus 2>/dev/null || true

# Ensure all necessary directories exist
mkdir -p grafana/provisioning/datasources
mkdir -p grafana/provisioning/dashboards
mkdir -p grafana/dashboards

# Create Grafana datasource provisioning configuration
cat > grafana/provisioning/datasources/datasources.yaml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    url: http://prometheus:9090
    isDefault: true
    version: 1
    editable: false
  
  - name: Loki
    type: loki
    access: proxy
    orgId: 1
    url: http://loki:3100
    version: 1
    editable: false
  
  - name: Tempo
    type: tempo
    access: proxy
    orgId: 1
    url: http://tempo:3200
    version: 1
    editable: false
    uid: tempo
    jsonData:
      httpMethod: GET
      tracesToLogs:
        datasourceUid: 'loki'
        tags: ['job', 'instance', 'service.name', 'service.namespace']
        mappedTags: [{ key: 'service.name', value: 'service' }]
        spanStartTimeShift: '-1h'
        spanEndTimeShift: '1h'
        filterByTraceID: true
        filterBySpanID: false
EOF

# Create Grafana dashboard provisioning configuration
cat > grafana/provisioning/dashboards/dashboards.yaml << EOF
apiVersion: 1

providers:
  - name: 'pulseguard'
    orgId: 1
    folder: 'pulseguard'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Start the monitoring stack
echo ""
echo -e "${C_CYAN}Initializing PulseGuard environment...${C_RESET}"
echo ""

docker-compose up -d

echo ""
echo -e "${C_CYAN}Grafana is ready!${C_RESET}"
echo -e "${C_CYAN}Prometheus is ready!${C_RESET}"
echo -e "${C_CYAN}Tempo is ready!${C_RESET}"
echo -e "${C_CYAN}Loki is ready!${C_RESET}"
echo -e "${C_CYAN}Loki is ready!${C_RESET}"
echo -e "${C_CYAN}Postgres is ready!${C_RESET}"
echo -e "${C_CYAN}Go-backend is ready!${C_RESET}"
echo -e "${C_CYAN}PgAdmin is ready!${C_RESET}"
echo ""

# Call the terminal banner script
bash ./start-terminal.sh
