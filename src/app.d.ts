declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  interface Window {
    __BUNBUN_FALLBACK_SVG__: string;
    __BUNBUN_IMG_ERR__: (img: HTMLImageElement) => void;
  }
}

export {};
