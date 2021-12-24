import * as prompts from 'prompts';
import { ProjectType } from '../inventory';

export async function addArgsFromPrompt(projectType: ProjectType, args: Record<string, any>) {
  const promptObjects: any[] = [];

  const showOptionalPrompts = !!args.prompt;

  for (const option of projectType.options) {
    const noArgAvailable = args[option.switch] === undefined;
    const hasDefaultValue = option.default !== undefined;
    if (option.featured && noArgAvailable && ((!option.optional && !hasDefaultValue) || (option.optional && showOptionalPrompts))) {
      let name = option.switch;
      let message = `${option.name} - ${option.docs ?? ''}\n[${option.default ?? ''}]`.trim();
      let type;

      // figure out best type
      if (option.simpleType === 'string') {
        type = 'text';
      } else if (option.simpleType === 'boolean') {
        type = 'toggle';
      } else if (option.simpleType === 'number') {
        type = 'number';
      }

      if (type) {
        promptObjects.push({
          name,
          type,
          message,
        });
      }
    }
  }

  let result = true;

  const promptResults = await prompts(promptObjects, {
    onCancel: () => {
      result = false;
    },
  });

  Object.assign(args, promptResults);

  return result;
}