export interface FilePatternListOptions {
  readonly includedPatterns?: string[];
  readonly excludedPatterns?: string[];
  readonly preferExcluded?: boolean;
}

export class FilePatternList {
  private readonly _includedPatterns = new Array<string>();
  private readonly _excludedPatterns = new Array<string>();
  private readonly _preferExcluded;

  public get patterns() {
    return this._includedPatterns.concat(this._excludedPatterns);
  }
  public get excludedPatterns() {
    return this._excludedPatterns;
  }
  public get includedPatterns() {
    return this._includedPatterns;
  }

  constructor(options?: FilePatternListOptions) {
    this._preferExcluded = options?.preferExcluded ?? false
    options?.excludedPatterns?.forEach(this.addPattern)
    options?.includedPatterns?.forEach(this.addPattern)
  }

  /**
   * Add file patterns. Files that match this pattern will be included. If the
   * pattern starts with a negation mark `!`, files that match will _not_ be
   * included.
   *
   * Comment lines (start with `#`) are ignored.
   *
   * @param patterns Ignore patterns.
   */
  public addPatterns(...patterns: string[]) {
    for (const pattern of patterns) {
      this.addPattern(pattern);
    }
  }

  /**
   * Removes patterns previously added.
   *
   * If `addPatterns()` is called after this, the pattern will be added again.
   *
   * @param patterns patters to remove.
   */
  public removePatterns(...patterns: string[]) {
    for (const p of patterns) {
      remove(this._includedPatterns, p);
      remove(this._excludedPatterns, p);
    }
  }

  /**
   * Ignore the files that match these patterns.
   * @param patterns The patterns to match.
   */
  public exclude(...patterns: string[]) {
    for (let pattern of patterns) {
      if (!pattern.startsWith('!')) {
        pattern = '!' + pattern;
      }

      this.addPatterns(pattern);
    }
  }

  private addPattern(pattern: string) {
    // skip comments
    if (pattern.startsWith('#')) {
      return;
    }

    const isExclude = pattern.startsWith('!')
    const isDirectory = pattern.endsWith('/')
    const opposite = isExclude ? pattern.slice(1) : `!${pattern}`;
    if(isExclude) {
      remove(this._excludedPatterns, pattern);
      if(this._preferExcluded) {
        remove(this._includedPatterns, opposite);
      }
    } else {
      remove(this._includedPatterns, pattern);
      if(!this._preferExcluded) {
        remove(this._excludedPatterns, opposite);
      }
    }

    if (isDirectory) {
      const prefix = opposite;
      for (const p of [...this._includedPatterns]) {
        if (p.startsWith(prefix)) {
          remove(this._includedPatterns, p);
        }
      }
      for (const p of [...this._excludedPatterns]) {
        if (p.startsWith(prefix)) {
          remove(this._excludedPatterns, p);
        }
      }
    }
  }
}

// O(n) hooray!
function remove<T>(arr: T[], value: any) {
  const idx = arr.indexOf(value);
  if (idx >= 0) {
    arr.splice(idx, 1);
  }
}
