export function appendChildToBody(child: HTMLElement) {
  document.body.appendChild(child)
}

export function removeChildFromBody(child: HTMLElement, isExamine = true) {
  if (isExamine) {
    if (document.body.contains(child)) {
      document.body.removeChild(child)
    }
  } else {
    document.body.removeChild(child)
  }
}

export function removeRoot(root: HTMLElement) {
  if (root) {
    document.body.removeChild(root)
  }
}

export function createSideRoot(id = 'wordwise-side-crx-root') {
  const root = document.createElement('div')
  root.id = id
  root.className =
    'fixed top-0 right-0 w-[400px] h-screen z-[9999] bg-white shadow'
  return root
}

export function createQueryRoot(id = 'wordwise-query-crx-root') {
  const root = document.createElement('div')
  root.id = id
  root.className = 'fixed top-0 right-0 w-screen h-screen z-[99999]'
  return root
}
