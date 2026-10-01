/** Read projection of public site settings; writes remain in the site administration owner. */
export interface PublicSettingsReaderPort {
  /** Value of a setting flagged as public, or undefined when it is missing or private. */
  getPublicSetting(key: string): Promise<unknown>;
}
