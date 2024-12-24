export interface User {
  firstName: string
  lastName: string
  avatarUrl: string
}

export interface CheckInEvent {
  userId: string
  checkInDay: string
  user: User
  timestamp: string
  message: string
}
