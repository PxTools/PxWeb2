/**
 * Represents a contact in PxWeb.
 */
export type Contact = {
  /**
   * The name of the contact.
   */
  name?: string;
  /**
   * The phone number of the contact.
   */
  phone?: string;
  /**
   * The email of the contact.
   */
  mail?: string;
  /**
   * The organization of the contact.
   */
  organization?: string;
  /**
   * Contact information as a raw, unformatted string.
   */
  raw?: string;
};
