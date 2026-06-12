export interface OutpostVideo {
  /** Unique identifier displayed as "Video ID" on the page */
  id: string;
  title: string;
  /** Source organization or channel the footage comes from */
  source: string;
  description: string;
  /** Full embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID) */
  embedUrl: string;
}
