import * as prompts from 'prompts';
import { ProjectType } from '../inventory';

export async function addArgsFromPrompt(projectType: ProjectType, args: Record<string, any>) {
  const promptObjects: any[] = [];

  const showOptionalPrompts = !!args.prompt;

  for (const option of projectType.options) {
    if (args[option.switch] === undefined && option.featured && (!option.optional || (option.optional && showOptionalPrompts))) {
      let name = option.switch;
      let type;
      let message;
      let choices;

      if (!type) {
        // figure out best type
        if (option.simpleType === 'string') {
          type = 'text';
        } else if (option.simpleType === 'boolean') {
          type = 'toggle';
        } else if (option.simpleType === 'number') {
          type = 'number';
        }
      }

      if (!message) {
        message = option.name;
      }

      if (!choices) {
        // TODO Get enum values
      }

      if (type) {
        promptObjects.push({
          name,
          type,
          message,
          choices,
        });
      }
    }
  }

  const promptResults = await prompts(promptObjects);

  Object.assign(args, promptResults);
}