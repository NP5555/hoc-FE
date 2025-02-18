/**
 *  Set Home URL based on User Roles
 */
export const getHomeRoute = role => {
  if (role === 'client') return '/acl/redeem'
  else return '/dashboards/analytics'
}

export const getOTPRoute = role => {
  if (role === 'client') return '/acl/redeem'
  else return '/otp'
}
