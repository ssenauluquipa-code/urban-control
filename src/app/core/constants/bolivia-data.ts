// src/app/core/constants/bolivia-data.ts

export interface IDepartamentoBolivia {
  nombre: string;
  provincias: string[];
}

export const BOLIVIA_UBICACION: IDepartamentoBolivia[] = [
  {
    nombre: 'LA PAZ',
    provincias: [
      'Murillo', 'Omasuyos', 'Pacajes', 'Camacho', 'Muñecas', 'Larecaja',
      'Franz Tamayo', 'Ingavi', 'Loayza', 'Inquisivi', 'Sud Yungas',
      'Los Andes', 'Aroma', 'Nor Yungas', 'Abel Iturralde',
      'Bautista Saavedra', 'Manco Kapac', 'Gualberto Villarroel',
      'José Manuel Pando', 'Caranavi'
    ]
  },
  {
    nombre: 'SANTA CRUZ',
    provincias: [
      'Andrés Ibáñez', 'Warnes', 'Velasco', 'Ichilo', 'Chiquitos',
      'Sara', 'Cordillera', 'Vallegrande', 'Florida', 'Obispo Santistevan',
      'Ñuflo de Chávez', 'Ángel Sandoval', 'Manuel María Caballero',
      'Germán Busch', 'Guarayos'
    ]
  },
  {
    nombre: 'COCHABAMBA',
    provincias: [
      'Cercado', 'Campero', 'Ayopaya', 'Esteban Arce', 'Arani',
      'Arque', 'Capinota', 'Germán Jordán', 'Quillacollo',
      'Chapare', 'Tapacarí', 'Carrasco', 'Mizque', 'Punata',
      'Bolívar', 'Tiraque'
    ]
  },
  {
    nombre: 'ORURO',
    provincias: [
      'Cercado', 'Avaroa', 'Carangas', 'Sajama', 'Litoral',
      'Poopó', 'Pantaleón Dalence', 'Ladislao Cabrera',
      'Sabaya', 'Saucarí', 'Tomás Barrón', 'Sur Carangas',
      'San Pedro de Totora', 'Sebastián Pagador',
      'Eduardo Abaroa', 'Nor Carangas'
    ]
  },
  {
    nombre: 'POTOSI',
    provincias: [
      'Tomás Frías', 'Antonio Quijarro', 'Nor Chichas',
      'Sud Chichas', 'Nor Lípez', 'Sud Lípez', 'Daniel Campos',
      'Modesto Omiste', 'Rafael Bustillo', 'Charcas',
      'Chayanta', 'José María Linares', 'Cornelio Saavedra',
      'Alonso de Ibáñez', 'Nor Cinti', 'Sud Cinti'
    ]
  },
  {
    nombre: 'CHUQUISACA',
    provincias: [
      'Oropeza', 'Azurduy', 'Zudáñez', 'Tomina',
      'Hernando Siles', 'Yamparáez', 'Nor Cinti',
      'Sud Cinti', 'Belisario Boeto', 'Luis Calvo'
    ]
  },
  {
    nombre: 'TARIJA',
    provincias: [
      'Cercado', 'Arce', 'Gran Chaco',
      'Avilés', 'Méndez', "Burnet O'Connor"
    ]
  },
  {
    nombre: 'BENI',
    provincias: [
      'Cercado', 'Vaca Díez', 'José Ballivián',
      'Yacuma', 'Moxos', 'Marbán',
      'Mamoré', 'Iténez'
    ]
  },
  {
    nombre: 'PANDO',
    provincias: [
      'Nicolás Suárez', 'Madre de Dios',
      'Manuripi', 'Abuná', 'Federico Román'
    ]
  }
];
