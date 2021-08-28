import { SpawnOptions } from 'child_process';
import { existsSync, statSync } from 'fs';
import { PassThrough } from 'stream';
import { execute } from '@yarnpkg/shell';
import { runAsWorker } from 'synckit';

export interface ShellOptions {
  readonly command: string;
  readonly env: any;
  readonly defaultWorkDir: string;
  readonly logger: Function;
  /**
   * @default - project dir
   */
  readonly cwd?: string;

  readonly logprefix?: string;
  readonly spawnOptions?: SpawnOptions;
  /** @default false */
  readonly quiet?: boolean;
}

/* eslint-ignore-next-line @typescript-eslint/no-floating-promises */
runAsWorker(async (options: ShellOptions) => {
  const quiet = options.quiet ?? false;
  if (!quiet) {
    const log = new Array<string>();

    if (options.logprefix) {
      log.push(options.logprefix);
    }

    log.push(options.command);

    if (options.cwd) {
      log.push(`(cwd: ${options.cwd})`);
    }

    options.logger(log.join(' '));
  }

  const cwd = options.cwd ?? options.defaultWorkDir;
  if (!existsSync(cwd) || !statSync(cwd).isDirectory()) {
    throw new Error(`invalid workdir (cwd): ${cwd} must be an existing directory`);
  }
  const stdout = new PassThrough();
  const stderr = new PassThrough();
  const stdoutChunks: Array<Buffer> = [];
  const stderrChunks: Array<Buffer> = [];

  stdout.on('data', chunk => {
    stdoutChunks.push(chunk);
  });

  stderr.on('data', chunk => {
    stderrChunks.push(chunk);
  });

  const exitCode = await execute(options.command, [], {
    ...options,
    stdout,
    stderr,
    env: {
      ...process.env,
      ...options.env,
    },
    cwd: cwd as any,
    ...options.spawnOptions,
  });

  return {
    exitCode,
    stdout: Buffer.concat(stdoutChunks).toString(),
    stderr: Buffer.concat(stderrChunks).toString(),
  };
});