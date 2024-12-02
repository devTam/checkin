export interface User {
  firstName: string
  lastName: string
  avatar: string
}

export interface CheckInEvent {
  userId: string
  checkInDay: string
  user: User
  timestamp: string
}
