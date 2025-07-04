// Google Cloud monitoring integration
const { Logging } = require('@google-cloud/logging');
const { Monitoring } = require('@google-cloud/monitoring');

class GCPMonitoring {
  constructor() {
    this.logging = new Logging();
    this.monitoring = new Monitoring.MetricServiceClient();
    this.log = this.logging.log('road-sign-factory-api');
  }

  async logUserAction(userId, action, metadata = {}) {
    const entry = this.log.entry({
      severity: 'INFO',
      resource: { type: 'gae_app' }
    }, {
      userId,
      action,
      metadata,
      timestamp: new Date().toISOString()
    });

    await this.log.write(entry);
  }

  async recordMetric(metricName, value, labels = {}) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const request = {
      name: `projects/${projectId}`,
      timeSeries: [{
        metric: {
          type: `custom.googleapis.com/road_sign_factory/${metricName}`,
          labels
        },
        resource: {
          type: 'gae_app',
          labels: {
            project_id: projectId,
            module_id: 'api'
          }
        },
        points: [{
          interval: {
            endTime: { seconds: Date.now() / 1000 }
          },
          value: { doubleValue: value }
        }]
      }]
    };

    try {
      await this.monitoring.createTimeSeries(request);
    } catch (error) {
      console.error('Metric recording failed:', error);
    }
  }
}

module.exports = { GCPMonitoring };
