export const RESOURCE_STATUS = Object.freeze({
  DRAFT: 0,
  PENDING_AUDIT: 2,
  PUBLISHED: 4,
  OFF_SHELF: 6,
});

export function isPublishedStatus(status) {
  return Number(status) === RESOURCE_STATUS.PUBLISHED;
}

export function isOffShelfStatus(status) {
  return Number(status) === RESOURCE_STATUS.OFF_SHELF;
}
