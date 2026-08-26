import openCvUrl from '@techstark/opencv-js/dist/opencv.js?url';

declare global { interface Window { cv?: any; } }
let loaded: Promise<any> | null = null;
export const loadOpenCv = (): Promise<any> => {
  if (window.cv?.Mat) return Promise.resolve(window.cv);
  if (loaded) return loaded;
  loaded = new Promise((resolve, reject) => {
    let timeout = 0;
    const poll = window.setInterval(() => { if (window.cv?.Mat) { window.clearInterval(poll); window.clearTimeout(timeout); resolve(window.cv); } }, 25);
    timeout = window.setTimeout(() => { window.clearInterval(poll); loaded = null; reject(new Error('OPENCV_WASM_INIT_TIMEOUT')); }, 20_000);
    const script = document.createElement('script'); script.src = openCvUrl; script.async = true;
    script.onerror = () => { window.clearInterval(poll); window.clearTimeout(timeout); loaded = null; reject(new Error('OPENCV_WASM_LOAD_FAILED')); };
    document.head.append(script);
  });
  return loaded;
};
