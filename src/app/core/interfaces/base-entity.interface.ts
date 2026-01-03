export interface BaseEntity {
  id: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface BaseDto {
  id?: number;
}