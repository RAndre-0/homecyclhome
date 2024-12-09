interface Technician {
    id: number;
    email: string;
  }
  
  interface Coordinate {
    latitude: number;
    longitude: number;
  }
  
  interface Polygon {
    id: number;
    name: string;
    colour: string;
    coordinates: Coordinate[];
    technician: number | null;
  }