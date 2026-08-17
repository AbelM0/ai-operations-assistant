import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const onnxRuntimeLinuxFiles = [
  "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
  "./node_modules/.pnpm/onnxruntime-node@*/node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node",
];
const sharpLinuxFiles = [
  "./node_modules/.pnpm/@img+sharp-linux-x64@*/node_modules/@img/sharp-linux-x64/**/*",
  "./node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/node_modules/@img/sharp-libvips-linux-x64/**/*",
];
const pdfJsRuntimeFiles = [
  "./node_modules/.pnpm/pdfjs-dist@*/node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
];
// Tesseract's Node worker loads its parent worker module and OCR core variants
// dynamically, so Next.js cannot discover them through static output tracing.
const tesseractRuntimeFiles = [
  "./node_modules/.pnpm/tesseract.js@*/node_modules/tesseract.js/**/*",
  "./node_modules/.pnpm/tesseract.js-core@*/node_modules/tesseract.js-core/**/*",
  "./node_modules/.pnpm/wasm-feature-detect@*/node_modules/wasm-feature-detect/**/*",
];
const documentProcessingRuntimeFiles = [
  ...onnxRuntimeLinuxFiles,
  ...sharpLinuxFiles,
  ...pdfJsRuntimeFiles,
  ...tesseractRuntimeFiles,
];

const nextConfig: NextConfig = {
  // Keep production builds stable on memory-constrained development machines.
  experimental: {
    cpus: 1,
  },
  typescript: {
    // Dev route declarations live under `.next/dev` and can be regenerated
    // while a production build is running. Keep them out of the build graph.
    tsconfigPath: isProduction ? "tsconfig.build.json" : "tsconfig.json",
  },
  serverExternalPackages: [
    "@huggingface/transformers",
    "@napi-rs/canvas",
    "pdfjs-dist",
    "sharp",
    "tesseract.js",
    "unpdf",
  ],
  outputFileTracingIncludes: {
    "/api/chat": onnxRuntimeLinuxFiles,
    "/api/documents": documentProcessingRuntimeFiles,
    "/api/documents/\\[documentId\\]": documentProcessingRuntimeFiles,
  },
};

export default nextConfig;
