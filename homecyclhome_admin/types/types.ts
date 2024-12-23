export interface Technician {
  id: number;
  email: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Polygon {
  id: number;
  name: string;
  colour: string;
  coordinates: Coordinate[];
  technician: number | null;
}

export interface Technicien {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Intervention {
  id: number;
  debut: string;
  type_intervention: { nom: string };
  technicien: { id: number };
}