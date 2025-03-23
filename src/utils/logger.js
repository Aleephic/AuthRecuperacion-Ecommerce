const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  // Background 
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

function getTimestamp() {
  const now = new Date();
  return now.toISOString();
}

function formatLog(level, message, details) {
  const timestamp = getTimestamp();
  let formattedMessage = `${timestamp} [${level}] ${message}`;
  
  if (details) {
    if (typeof details === 'string') {
      formattedMessage += ` - ${details}`;
    } else {
      try {
        formattedMessage += ` - ${JSON.stringify(details)}`;
      } catch (error) {
        formattedMessage += ` - [Unstringifiable Object]`;
      }
    }
  }
  
  return formattedMessage;
}

const log = {
 
  debug: (message, details) => {
    console.log(`${colors.cyan}${formatLog('DEBUG', message, details)}${colors.reset}`);
  },
  info: (message, details) => {
    console.log(`${colors.green}${formatLog('INFO', message, details)}${colors.reset}`);
  },
  warn: (message, details) => {
    console.log(`${colors.yellow}${formatLog('WARN', message, details)}${colors.reset}`);
  },
  error: (message, details) => {
    console.error(`${colors.red}${formatLog('ERROR', message, details)}${colors.reset}`);
  },
  
  fatal: (message, details) => {
    console.error(`${colors.bgMagenta}${colors.white}${formatLog('FATAL', message, details)}${colors.reset}`);
  },
  
  http: (message) => {
    console.log(`${colors.blue}${formatLog('HTTP', message)}${colors.reset}`);
  }
};

module.exports = {
  log,
  colors
};
