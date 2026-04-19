/**
 * 权限判断 composable
 * 从 usePermissions() 读取权限列表（登录时单独存储，不受 getinfo 覆盖影响）
 */
export function usePermission() {
  const permissions = usePermissions();

  const permissionList = computed(() => permissions.value || []);

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
