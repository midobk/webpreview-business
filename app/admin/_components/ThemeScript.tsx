/**
 * ThemeScript — runs before React hydrates to prevent light-mode flash.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('admin-theme');if(!t)t='system';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}