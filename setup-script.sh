#!/bin/bash

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
  - name: 'PulseGuard'
    orgId: 1
    folder: 'PulseGuard'
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /var/lib/grafana/dashboards
EOF

# Start the monitoring stack
docker-compose up -d

echo "Telemetry stack is being started..."
echo "Grafana will be available at http://localhost:3100"
echo "Prometheus will be available at http://localhost:9090"
echo "Tempo will be available at http://localhost:3200"
echo "Loki will be available at http://localhost:3101"

echo "Default Grafana credentials:"
echo "Username: admin"
echo "Password: admin"