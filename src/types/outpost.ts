export interface OutpostVideo {
  /** Unique identifier displayed as "Video ID" on the page */
  id: string;
  title: string;
  /** Source organization or channel the footage comes from */
  source: string;
  /** Optional thematic category, e.g. "aerospace", "naval operations" */
  category?: string;
  /** Optional viewer advisory shown above the description */
  contentWarning?: string;
  description?: string;
  /** Runtime of the film the trailer is for, e.g. "2h 17m" */
  runtime?: string;
  /** Full embed URL (e.g. https://www.youtube-nocookie.com/embed/VIDEO_ID) */
  embedUrl: string;
}
