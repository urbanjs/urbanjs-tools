export const help = 'Usage: urbanjs generate -n clean-project -f';
export const options = [
  {
    name: 'n',
    aliases: ['name'],
    type: 'string',
    description: 'Name of the project & folder',
    required: true
  },
  {
    name: 'f',
    aliases: ['force'],
    type: 'boolean',
    description: 'Remove the specified folder if exists'
  },
  {
    name: 't',
    aliases: ['type'],
    type: 'string',
    enum: ['js', 'javascript', 'ts', 'typescript'],
    description: 'The type of the sourcecode'
  }
];
