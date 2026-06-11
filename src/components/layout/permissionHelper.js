// ./permissionHelper.js
export function flattenPermissions(permissions) {
  const result = new Set();

  function traverse(perms) {
    perms.forEach((p) => {
      result.add(p.name.trim());
      if (p.children && p.children.length > 0) {
        traverse(p.children);
      }
    });
  }

  traverse(permissions);
  return result;
}
