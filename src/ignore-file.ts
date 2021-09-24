import { FileBase, IResolver } from './file';
import { FilePatternList } from './file-pattern-list';
import { Project } from './project';


export class IgnoreFile extends FileBase {
  private readonly _filePatternList = new FilePatternList();

  constructor(project: Project, filePath: string) {
    super(project, filePath, { editGitignore: filePath !== '.gitignore' });
  }

  /**
   * Add ignore patterns. Files that match this pattern will be ignored. If the
   * pattern starts with a negation mark `!`, files that match will _not_ be
   * ignored.
   *
   * Comment lines (start with `#`) are ignored.
   *
   * @param patterns Ignore patterns.
   */
  public addPatterns(...patterns: string[]) {
    this._filePatternList.addPatterns(...patterns);
  }

  /**
   * Removes patterns previously added from the ignore file.
   *
   * If `addPattern()` is called after this, the pattern will be added again.
   *
   * @param patterns patterns to remove.
   */
  public removePatterns(...patterns: string[]) {
    this._filePatternList.removePatterns(...patterns);
  }
  /**
   * Ignore the files that match these patterns.
   * @param patterns The patterns to match.
   */
  public exclude(...patterns: string[]) {
    return this._filePatternList.addPatterns(...patterns);
  }

  /**
   * Always include the specified file patterns.
   * @param patterns Patterns to include in git commits.
   */
  public include(...patterns: string[]) {
    return this._filePatternList.exclude(...patterns);
  }

  protected synthesizeContent(resolver: IResolver): string | undefined {
    const lines = [
      `# ${FileBase.PROJEN_MARKER}`,
      ...this._filePatternList.patterns,
    ];

    return `${resolver.resolve(lines).join('\n')}\n`;
  }
}