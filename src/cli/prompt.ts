import prompts, { PromptObject } from "prompts";
import { ProjectType } from "../inventory";

export interface PromptInfo {
    type: string;
    message: string;
    choices?: string[];
  }

export async function createOptionsPrompt(projectType: ProjectType) {
    const promptObjects: any[] = [];

    for (const option of projectType.options) {
        if(option.featured) {
            const basePrompt = option.prompt;
            let type = option.prompt.type;
            let message = option.prompt.message;
            let choices = option.prompt.choices;
            let name = option.name;

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
    
    const response = await prompts(promptObjects);
    
    console.log(response);
}