/**
 * 权限判断 composable
 * 从 usePermissions() 读取权限列表（登录时单独存储，不受 getinfo 覆盖影响）
 */
export function usePermission() {
  const permissions = usePermissions();

  const permissionList = computed(() => normalizePermissions(permissions.value));

  function hasPermission(code) {
    if (!code) return true;
    const perms = permissionList.value;
    if (!perms.length) return false;
    if (perms.includes('*') || perms.includes('*:*:*')) return true;
    return perms.includes(code);
  }

  function hasAnyPermission(...codes) {
    return codes.some(c => hasPermission(c));
  }

  return { hasPermission, hasAnyPermission, permissionList };
}

function normalizePermissions(rawPermissions) {
  const result = new Set();

  collectPermissions(rawPermissions, result);

  return [...result];
}

function collectPermissions(value, bucket) {
  if (!value) return;

  if (typeof value === 'string') {
    bucket.add(value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPermissions(item, bucket));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      // 只递归处理子节点，不把分组 key（如 "course"、"book"）当权限码加入
      collectPermissions(child, bucket);
    });
  }
}
