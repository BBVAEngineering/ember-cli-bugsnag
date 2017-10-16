/**
 * Default functions to determine if an error must be skipped (true) or included (false).
 *
 * All error types that can be skipped are listed in config/environment.js
 */
export const errorIs = {

  /**
   * Returns if is a plain error.
   *
   * @method plain
   * @param  {Mixed} error
   * @return {Boolean}
   */
  plain(error) {
    return !(error instanceof Error);
  }

};
