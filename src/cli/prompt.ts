import * as prompts from "prompts";
import { ProjectType } from "../inventory";

export interface PromptInfo {
    type: string;
    message: string;
    choices?: string[];
  }

export async function addArgsFromPrompt(projectType: ProjectType, args: Record<string, any>) {
    const promptObjects: any[] = [];

    const showOptionalPrompts = !!args.prompt

    for (const option of projectType.options) {
        if(args[option.switch] === undefined && option.featured && (!option.optional || (option.optional && showOptionalPrompts))) {
            const basePrompt = option.prompt;
            let type = option.prompt.type;
            let message = option.prompt.message;
            let choices = option.prompt.choices;
            let name = option.switch;

            if(!type) {
                // figure out best type
                // TODO Get enum values
                if(basePrompt.choices) {
                    type = 'select'
                } else if(option.simpleType === 'string') {
                    type = 'text'
                } else if(option.simpleType === 'boolean') {
                    type = 'toggle'
                } else if(option.simpleType === 'number') {
                    type = 'number'
                }
            }

            if(!message) {
                message = option.name;
            }

            if(!choices) {
                // TODO Get enum values
            }

            if(type) {
                promptObjects.push({
                    name,
                    type,
                    message,
                    choices,
                })
            }
        }
    }
    
    const promptResults = await prompts(promptObjects);

    Object.assign(args, promptResults)
}