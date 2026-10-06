const serviceName = process.env.SERVICE_NAME || 'wf-online-banking';
const environment = process.env.APP_ENV || 'local';

function emit(level, event, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: serviceName,
    environment,
    event,
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === 'ERROR') {
    process.stderr.write(`${line}\n`);
  } else {
    process.stdout.write(`${line}\n`);
  }
}

module.exports = {
  logger: {
    info: (event, fields) => emit('INFO', event, fields),
    warn: (event, fields) => emit('WARN', event, fields),
    error: (event, fields) => emit('ERROR', event, fields),
  },
};
