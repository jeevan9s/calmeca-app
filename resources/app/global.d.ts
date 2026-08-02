declare global {
  interface Window {
    Neutralino?: any;
  }
}

declare module "@iconify-icons/feather" {
  const content: Record<string, any>;
  export = content;
}

declare module "*.css";