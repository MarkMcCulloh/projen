import { directorySnapshot, execProjenCLI, withProjectDir } from './util';
import prompts from 'prompts';

test('creating node project with prompts', () => {
  withProjectDir(projectdir => {

    prompts.inject(['description', 'package-name', false])
    execProjenCLI(projectdir, ['new', 'node', '--prompt', '--no-synth']);

    const projenrc = directorySnapshot(projectdir)['.projenrc.js'];
    expect(projenrc).toMatchSnapshot();
  });
});
