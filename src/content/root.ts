export function createContentRoot(id = 'wordwise-crx-root'){
  const root = document.createElement("div");
  root.id  = id
  root.className = 'fixed top-0 right-0 w-[400px] h-screen z-[9999] bg-white shadow'
  document.body.appendChild(root);
  return root
}