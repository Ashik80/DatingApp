import { Photo } from './photo';

export interface User {
    id: number;
    userName: string;
    knownAs: string;
    gender: string;
    age: number;
    created: Date;
    lastActive: Date;
    city: string;
    country: string;
    photoUrl: string;
    introduction?: string;
    lookingFor?: string;
    interests?: string;
    photos?: Photo[];
}
