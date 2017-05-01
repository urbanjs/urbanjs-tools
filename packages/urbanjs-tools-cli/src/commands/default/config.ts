export const config = {
  messages: {
    usage: 'Usage: urbanjs <command>'
  },
  options: [{
    name: 'v',
    aliases: ['version'],
    description: 'Version',
    type: 'boolean'
  }],
  commands: [{
    name: 'generate',
    description: 'Generates a new project skeleton'
  }]
};
