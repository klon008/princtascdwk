/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALBUM_LINK_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
