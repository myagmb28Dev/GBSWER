/**
 * 커뮤니티 권한 정책
 * 글쓴이: 조회, 댓글, 수정, 삭제
 * 관리자: 조회, 댓글, 삭제 (수정 불가)
 * 일반 사용자: 조회, 댓글, 파일 다운로드/미리보기
 * 관계자: 조회, 댓글, 삭제
 */

export const PERMISSION_POLICY = {
  author: ['read', 'comment', 'edit', 'delete'],
  admin: ['read', 'comment', 'delete'],
  user: ['read', 'comment', 'download', 'preview'],
  related: ['read', 'comment', 'delete']
};

/**
 * 사용자의 역할에 따른 권한 확인
 * @param {string} userRole - 사용자 역할 (admin, student)
 * @param {string} postAuthorId - 글 작성자 ID
 * @param {string} currentUserId - 현재 사용자 ID
 * @returns {string} 사용자의 권한 유형
 */
export const getUserPermissionType = (userRole, postAuthorId, currentUserId) => {
  // 글쓴이
  if (postAuthorId === currentUserId) {
    return 'author';
  }

  // 관리자
  if (userRole === 'admin') {
    return 'admin';
  }

  // 관계자 (같은 클래스의 학생)
  // TODO: 클래스 정보를 기반으로 관계자 판단
  // if (isSameClass(currentUserId, postAuthorId)) {
  //   return 'related';
  // }

  // 일반 사용자
  return 'user';
};

/**
 * 특정 권한이 있는지 확인
 * @param {string} permissionType - 권한 유형
 * @param {string} action - 수행할 액션
 * @returns {boolean} 권한 여부
 */
export const hasPermission = (permissionType, action) => {
  const permissions = PERMISSION_POLICY[permissionType] || [];
  return permissions.includes(action);
};

/**
 * 사용자가 특정 액션을 수행할 수 있는지 확인
 * @param {string} userRole - 사용자 역할
 * @param {string} postAuthorId - 글 작성자 ID
 * @param {string} currentUserId - 현재 사용자 ID
 * @param {string} action - 수행할 액션
 * @returns {boolean} 수행 가능 여부
 */
export const canPerformAction = (userRole, postAuthorId, currentUserId, action) => {
  const permissionType = getUserPermissionType(userRole, postAuthorId, currentUserId);
  return hasPermission(permissionType, action);
};

/**
 * 사용자가 수행할 수 있는 모든 액션 반환
 * @param {string} userRole - 사용자 역할
 * @param {string} postAuthorId - 글 작성자 ID
 * @param {string} currentUserId - 현재 사용자 ID
 * @returns {string[]} 수행 가능한 액션 배열
 */
export const getAvailableActions = (userRole, postAuthorId, currentUserId) => {
  const permissionType = getUserPermissionType(userRole, postAuthorId, currentUserId);
  return PERMISSION_POLICY[permissionType] || [];
};
