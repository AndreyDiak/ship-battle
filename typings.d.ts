interface User {
  id: string
  email: string
  photoURL: string
  displayName: string
  friends: string[]
}
interface ShownField {
  value: string
}
interface UserFields {
  owner: string
  field: Field[]
  shownField: ShownField[]
}
interface Field {
  value: string
  isShip: boolean
  isFree: boolean
  backlight: boolean
  health: number
  shipHealth: number
  maxHealth: number
  id: (number | null)[]
  index: null | number
}
interface Game {
  approved: boolean
  owner: string
  users: string[]
  startTime: string
}

type ShipType = 'large' | 'big' | 'medium' | 'small'
interface Ship {
  type: ShipType
  left: number
  length: number
}
