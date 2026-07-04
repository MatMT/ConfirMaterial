export function isAdminMode(): boolean {
  return (
    import.meta.env.ADMIN_MODE === 'true' || import.meta.env.ADMIN_MODE === true ||
    import.meta.env.PUBLIC_ADMIN_MODE === 'true' || import.meta.env.PUBLIC_ADMIN_MODE === true ||
    import.meta.env.ADMIN === 'true' || import.meta.env.ADMIN === true ||
    import.meta.env.PUBLIC_ADMIN === 'true' || import.meta.env.PUBLIC_ADMIN === true
  );
}
