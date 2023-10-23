export function createContentRoot(id = 'wordwise-crx-root'){
  const root = document.createElement("div");
  root.id  = id
  document.body.appendChild(root);
  return root
}