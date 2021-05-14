using System;
using System.IO;
using System.Drawing;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.ComponentModel;

namespace System.Runtime.CompilerServices
{
    [EditorBrowsable(EditorBrowsableState.Never)]
    public class IsExternalInit { }
}

namespace JSON_Util
{
    class Program
    {
        static void Main(string[] args)
        {
            new UnitData().Export();
        }
    }

    public enum ModifierType
    {
        FIXED_VALUE = 0,
        PERCENTAGE = 1,
        MULTIPLE = 2
    }
    public enum TileType
    {
        BOUNDARY = 0,
        PLAINS = 1,
        GRASSLAND = 2,
        FOREST = 3,
        JUNGLE = 4,
        STREAM = 5,
        RIVER = 6,
        SWAMP = 7,
        DESERT = 8,
        HILLOCK = 9,
        HILLS = 10,
        MOUNTAINS = 11,
        ROCKS = 12,
        SUBURB = 13,
        CITY = 14,
        METROPOLIS = 15
    }
    public enum PlayerColor
    {
        RED = 0,
        YELLOW = 1,
        BLUE = 2,
        GREEN = 3
    }

    public class Modifier
    {
        public ModifierType Type { get; set; }
        public double Value { get; set; }

        public Modifier() { }
        public Modifier(ModifierType type, double value) => (Type, Value) = (type, value);
    }

    public class Player
    {
        public string Name { get; set; }
        public PlayerColor Color { get; set; }
        public bool IsAI { get; set; }
        public Resources Resources { get; set; }
        public Building[] Buildings { get; set; }
        public Technology[] Researches { get; set; }
        public Customizable[] Customizables { get; set; }
    }

    #region Tiles

    public class TerrainModifiers
    {
        public Modifier Recon { get; set; } = new Modifier();
        public Modifier Camouflage { get; set; } = new Modifier();
        public Modifier Supplies { get; set; } = new Modifier();
        public Modifier Fuel { get; set; } = new Modifier();
        public Modifier Mobility { get; set; } = new Modifier();

        public TerrainModifiers(Modifier recon, Modifier camo, Modifier supplies, Modifier fuel, Modifier mobility)
            => (Recon, Camouflage, Supplies, Fuel, Mobility) = (recon, camo, supplies, fuel, mobility);
    }
    public abstract class Tile
    {
        public string Name { get; set; }
        public Point CoOrds { get; set; } = new Point();
        public TileType Type { get; set; }
        public TerrainModifiers TerrainMod { get; set; }
        public double Obstruction { get; set; }
        public bool AllowConstruction { get; set; }
        public double Height { get; set; }
        [JsonIgnore] public char Symbol { get; set; }
        public static Dictionary<TileType, TerrainModifiers> Terrain_Mods { get; } = new Dictionary<TileType, TerrainModifiers>()
        {
            [TileType.BOUNDARY] = new TerrainModifiers(
                  new Modifier(ModifierType.MULTIPLE, 0),
                  new Modifier(ModifierType.MULTIPLE, 0),
                  new Modifier(ModifierType.MULTIPLE, 99999),
                  new Modifier(ModifierType.MULTIPLE, 99999),
                  new Modifier(ModifierType.MULTIPLE, 0)),
            [TileType.PLAINS] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 2),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0)),
            [TileType.GRASSLAND] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 1),
                  new Modifier(ModifierType.PERCENTAGE, 25),
                  new Modifier(ModifierType.PERCENTAGE, -10),
                  new Modifier(ModifierType.PERCENTAGE, 10),
                  new Modifier(ModifierType.PERCENTAGE, -5)),
            [TileType.FOREST] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 50),
                  new Modifier(ModifierType.PERCENTAGE, -20),
                  new Modifier(ModifierType.PERCENTAGE, 20),
                  new Modifier(ModifierType.PERCENTAGE, -30)),
            [TileType.JUNGLE] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, -1),
                  new Modifier(ModifierType.PERCENTAGE, 100),
                  new Modifier(ModifierType.PERCENTAGE, -30),
                  new Modifier(ModifierType.PERCENTAGE, 30),
                  new Modifier(ModifierType.PERCENTAGE, -50)),
            [TileType.STREAM] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, -20)),
            [TileType.RIVER] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, -10)),
            [TileType.SWAMP] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 40),
                  new Modifier(ModifierType.PERCENTAGE, 50),
                  new Modifier(ModifierType.PERCENTAGE, 100),
                  new Modifier(ModifierType.PERCENTAGE, -75)),
            [TileType.DESERT] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 1),
                  new Modifier(ModifierType.PERCENTAGE, 20),
                  new Modifier(ModifierType.PERCENTAGE, 100),
                  new Modifier(ModifierType.PERCENTAGE, 20),
                  new Modifier(ModifierType.PERCENTAGE, -30)),
            [TileType.HILLOCK] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 2),
                  new Modifier(ModifierType.PERCENTAGE, -10),
                  new Modifier(ModifierType.PERCENTAGE, 10),
                  new Modifier(ModifierType.PERCENTAGE, 50),
                  new Modifier(ModifierType.PERCENTAGE, -60)),
            [TileType.HILLS] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 3),
                  new Modifier(ModifierType.PERCENTAGE, -20),
                  new Modifier(ModifierType.PERCENTAGE, 20),
                  new Modifier(ModifierType.PERCENTAGE, 100),
                  new Modifier(ModifierType.PERCENTAGE, -70)),
            [TileType.MOUNTAINS] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 4),
                  new Modifier(ModifierType.PERCENTAGE, -30),
                  new Modifier(ModifierType.PERCENTAGE, 30),
                  new Modifier(ModifierType.PERCENTAGE, 150),
                  new Modifier(ModifierType.PERCENTAGE, -80)),
            [TileType.ROCKS] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 2),
                  new Modifier(ModifierType.PERCENTAGE, -10),
                  new Modifier(ModifierType.PERCENTAGE, 10),
                  new Modifier(ModifierType.PERCENTAGE, 50),
                  new Modifier(ModifierType.PERCENTAGE, -40)),
            [TileType.SUBURB] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0)),
            [TileType.CITY] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0)),
            [TileType.METROPOLIS] = new TerrainModifiers(
                  new Modifier(ModifierType.FIXED_VALUE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0),
                  new Modifier(ModifierType.PERCENTAGE, 0))
        };
        public Tile() { }
    }
    public abstract class Cities : Tile
    {
        public Player Owner { get; set; }
        public double Population { get; set; }
        public Attribute ConstructionRange { get; set; } = new Attribute();
        public Resources Production { get; set; } = new Resources();
        public Attribute Durability { get; set; } = new Attribute();
        public Attribute Morale { get; set; } = new Attribute(250);
    }

    public sealed class Boundary : Tile
    {
        public Boundary() : base()
        {
            Name = "boundary";
            Type = TileType.BOUNDARY;
            TerrainMod = Terrain_Mods[TileType.BOUNDARY];
            Obstruction = double.MaxValue;
            AllowConstruction = false;
            Height = double.MaxValue;
            Symbol = 'B';
        }
        public Boundary(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Plains : Tile
    {
        public Plains() : base()
        {
            Name = "plains";
            Type = TileType.PLAINS;
            TerrainMod = Terrain_Mods[TileType.PLAINS];
            Obstruction = 0;
            AllowConstruction = true;
            Height = 1;
            Symbol = 'P';
        }
        public Plains(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Grassland : Tile
    {
        public Grassland() : base()
        {
            Name = "grassland";
            Type = TileType.GRASSLAND;
            TerrainMod = Terrain_Mods[TileType.GRASSLAND];
            Obstruction = 0.1;
            AllowConstruction = true;
            Height = 1;
            Symbol = 'G';
        }
        public Grassland(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Forest : Tile
    {
        public Forest() : base()
        {
            Name = "forest";
            Type = TileType.FOREST;
            TerrainMod = Terrain_Mods[TileType.FOREST];
            Obstruction = 0.3;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'F';
        }
        public Forest(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Jungle : Tile
    {
        public Jungle() : base()
        {
            Name = "jungle";
            Type = TileType.JUNGLE;
            TerrainMod = Terrain_Mods[TileType.JUNGLE];
            Obstruction = 0.5;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'J';
        }
        public Jungle(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Stream : Tile
    {
        public Stream() : base()
        {
            Name = "stream";
            Type = TileType.STREAM;
            TerrainMod = Terrain_Mods[TileType.STREAM];
            Obstruction = 0;
            AllowConstruction = false;
            Height = -1;
            Symbol = 'S';
        }
        public Stream(Point coords) : this() => CoOrds = coords;
    }
    public sealed class River : Tile
    {
        public River() : base()
        {
            Name = "river";
            Type = TileType.RIVER;
            TerrainMod = Terrain_Mods[TileType.RIVER];
            Obstruction = 0;
            AllowConstruction = false;
            Height = -2;
            Symbol = 'R';
        }
        public River(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Swamp : Tile
    {
        public Swamp() : base()
        {
            Name = "swamp";
            Type = TileType.SWAMP;
            TerrainMod = Terrain_Mods[TileType.SWAMP];
            Obstruction = 0;
            AllowConstruction = false;
            Height = 0;
            Symbol = 'W';
        }
        public Swamp(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Desert : Tile
    {
        public Desert() : base()
        {
            Name = "desert";
            Type = TileType.DESERT;
            TerrainMod = Terrain_Mods[TileType.DESERT];
            Obstruction = 0.2;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'D';
        }
        public Desert(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Hillock : Tile
    {
        public Hillock() : base()
        {
            Name = "hillock";
            Type = TileType.HILLOCK;
            TerrainMod = Terrain_Mods[TileType.HILLOCK];
            Obstruction = 0.75;
            AllowConstruction = false;
            Height = 2;
            Symbol = 'I';
        }
        public Hillock(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Hills : Tile
    {
        public Hills() : base()
        {
            Name = "hills";
            Type = TileType.HILLS;
            TerrainMod = Terrain_Mods[TileType.HILLS];
            Obstruction = 0.9;
            AllowConstruction = false;
            Height = 3;
            Symbol = 'H';
        }
        public Hills(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Mountains : Tile
    {
        public Mountains() : base()
        {
            Name = "mountains";
            Type = TileType.MOUNTAINS;
            TerrainMod = Terrain_Mods[TileType.MOUNTAINS];
            Obstruction = 1;
            AllowConstruction = false;
            Height = 4;
            Symbol = 'M';
        }
        public Mountains(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Rocks : Tile
    {
        public Rocks() : base()
        {
            Name = "rocks";
            Type = TileType.ROCKS;
            TerrainMod = Terrain_Mods[TileType.ROCKS];
            Obstruction = 0.6;
            AllowConstruction = false;
            Height = 2;
            Symbol = 'O';
        }
        public Rocks(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Suburb : Cities
    {
        public Suburb() : base()
        {
            Name = "suburb";
            Type = TileType.SUBURB;
            TerrainMod = Terrain_Mods[TileType.SUBURB];
            Obstruction = 1;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'U';
            Population = 1000;
            ConstructionRange = new Attribute(1);
            Production = new Resources(500, 100, 50, 25, 10, 5, 0, 100, 10, 0);
            Durability = new Attribute(10000);
        }
        public Suburb(Point coords) : this() => CoOrds = coords;
    }
    public sealed class City : Cities
    {
        public City() : base()
        {
            Name = "city";
            Type = TileType.CITY;
            TerrainMod = Terrain_Mods[TileType.CITY];
            Obstruction = 1;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'C';
            Population = 2000;
            ConstructionRange = new Attribute(1);
            Production = new Resources(1000, 200, 100, 50, 20, 10, 0, 200, 20, 0);
            Durability = new Attribute(20000);
        }
        public City(Point coords) : this() => CoOrds = coords;
    }
    public sealed class Metropolis : Cities
    {
        public Metropolis() : base()
        {
            Name = "metropolis";
            Type = TileType.METROPOLIS;
            TerrainMod = Terrain_Mods[TileType.METROPOLIS];
            Obstruction = 1;
            AllowConstruction = false;
            Height = 1;
            Symbol = 'E';
            Population = 5000;
            ConstructionRange = new Attribute(2);
            Production = new Resources(2000, 400, 200, 100, 40, 20, 0, 400, 40, 0);
            Durability = new Attribute(40000);
        }
        public Metropolis(Point coords) : this() => CoOrds = coords;
    }

    #endregion

    #region Data

    public sealed class PlayerData
    {
        public List<Player> PlayersData { get; set; } = new List<Player>();
        public PlayerData()
        {
            PlayersData.AddRange(new Player[]
            {
                new Player()
                {
                    Name = "abc",
                    Color = PlayerColor.RED,
                    IsAI = false,
                    Resources = new Resources(99999, 99999, 99999, 99999, 99999, 99999, 99999, 99999, 99999, 0)
                },
                new Player()
                {
                    Name = "dummy", 
                    Color = PlayerColor.YELLOW,
                    IsAI = true,
                    Resources = new Resources(99999, 99999, 99999, 99999, 99999, 99999, 99999, 99999, 99999, 0)
                }
            });
        }

        public void Export()
        {
            string json = Regex.Replace(JsonSerializer.Serialize(PlayersData, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
            File.WriteAllText("playerdata.json", json);
        }
    }
    public sealed class BuildingData
    {
        public List<UnitBuilding> UnitBuildingData { get; set; } = new List<UnitBuilding>();
        public List<ResourcesBuilding> ResourcesBuildingsData { get; set; } = new List<ResourcesBuilding>();
        public List<Infrastructure> InfrastructuresData { get; set; } = new List<Infrastructure>();
        public List<TransmissionBuilding> TransmissionBuildingsData { get; set; } = new List<TransmissionBuilding>();
        public List<DefensiveBuilding> DefensiveBuildingsData { get; set; } = new List<DefensiveBuilding>();

        public BuildingData()
        {
            UnitBuildingData.AddRange(new UnitBuilding[]
            {
                new Barracks(),
                new Arsenal(),
                new Dockyard(),
                new Airfield()
            });
            ResourcesBuildingsData.AddRange(new ResourcesBuilding[]
            {
                new Foundry(),
                new Industries(),
                new AmmoFactory(),
                new Refinery(),
                new Quarry(),
                new PowerPlant()
            });
            InfrastructuresData.AddRange(new Infrastructure[]
            {
                new Road(),
                new Railway(),
                new Bridge(),
                new Depot(),
                new Outpost(),
            });
            TransmissionBuildingsData.AddRange(new TransmissionBuilding[]
            {
                new Watchtower(),
                new SignalTower(),
                new JammingTower(),
                new RadarTower()
            });
            DefensiveBuildingsData.AddRange(new DefensiveBuilding[]
            {
                new Trench(),
                new Foxhole(),
                new Pillbox(),
                new Bunker(),
                new Wires(),
                new TankTraps(),
                new Minefield()
            });
        }
        public void Export()
        {
            string json;
            foreach (UnitBuilding ub in UnitBuildingData) 
            {
                json = Regex.Replace(JsonSerializer.Serialize(ub, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\buildingdata\\unit\{ub.Name}.json", json);
            }
            foreach (ResourcesBuilding rb in ResourcesBuildingsData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(rb, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\buildingdata\resources\{rb.Name}.json", json);
            }
            foreach (Infrastructure i in InfrastructuresData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(i, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\buildingdata\infrastructures\{i.Name}.json", json);

            }
            foreach (TransmissionBuilding tb in TransmissionBuildingsData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(tb, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\buildingdata\transmission\{tb.Name}.json", json);

            }
            foreach (DefensiveBuilding db in DefensiveBuildingsData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(db, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\buildingdata\defensive\{db.Name}.json", json);

            }
        }
    }
    public sealed class TileData
    {
        public List<Tile> TilesData { get; set; } = new List<Tile>();
        public List<Cities> CitiesData { get; set; } = new List<Cities>();

        public TileData()
        {
            TilesData.AddRange(new Tile[]
            {
                new Boundary(),
                new Plains(),
                new Grassland(),
                new Forest(),
                new Jungle(),
                new Stream(),
                new River(),
                new Swamp(),
                new Desert(),
                new Hillock(),
                new Hills(),
                new Mountains(),
                new Rocks()
            });
            CitiesData.AddRange(new Cities[]
            {
                new Suburb(),
                new City(),
                new Metropolis()
            });
        }

        public void Export()
        {
            string json = Regex.Replace(JsonSerializer.Serialize(TilesData, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
            File.WriteAllText("tiledata.json", json);
            json = Regex.Replace(JsonSerializer.Serialize(CitiesData, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
            File.WriteAllText("citiesdata.json", json);
        }
    }
    public sealed class UnitData
    {
        public List<Personnel> PersonnelData { get; set; } = new List<Personnel>();
        public List<Artillery> ArtilleriesData { get; set; } = new List<Artillery>();
        public List<Vehicle> VehiclesData { get; set; } = new List<Vehicle>();
        public List<Vessel> VesselsData { get; set; } = new List<Vessel>();
        public List<Plane> PlanesData { get; set; } = new List<Plane>();

        public UnitData()
        {
            PersonnelData.AddRange(new Personnel[]
            {
                new Militia(),
                new Infantry(),
                new Assault(),
                new Support(),
                new Mountain(),
                new Engineer()
            });
            ArtilleriesData.AddRange(new Artillery[]
            {
                new Portable(),
                new DirectFire(),
                new AntiTank(),
                new AntiAircraft(),
                new HeavySupport(),
                new Railroad(),
                new CoastalGun()
            });
            VehiclesData.AddRange(new Vehicle[]
            {
                new MotorisedInfantry(),
                new Utility(),
                new Carrier(),
                new ArmouredCar(),
                new TankDestroyer(),
                new AssaultGun(),
                new LightTank(),
                new MediumTank(),
                new HeavyTank(),
                new ArmouredTrain()
            });
            VesselsData.AddRange(new Vessel[]
            {

            });
            PlanesData.AddRange(new Plane[]
            {

            });
        }
        public void Export()
        {
            string json;
            foreach (Personnel p in PersonnelData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(p, p.GetType(), new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", ""); ;
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\personneldata\{p.Name}.json", json);
            }
            foreach (Artillery a in ArtilleriesData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(a, a.GetType(), new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", ""); ;
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\artilleriesdata\{a.Name}.json", json);
            }
            foreach (Vehicle v in VehiclesData)
            {
                json = Regex.Replace(JsonSerializer.Serialize(v, v.GetType(), new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", ""); ;
                File.WriteAllText(@$"{Directory.GetCurrentDirectory()}\vehiclesdata\{v.Name}.json", json);
            }
        }
    }
    public sealed class CustomizableData
    {
        public List<Firearm> FirearmsData { get; set; } = new List<Firearm>();
        public List<Gun> GunsData { get; set; } = new List<Gun>();
        public List<Equippment> EquippmentData { get; set; } = new List<Equippment>();
        public List<Shell> ShellsData { get; set; } = new List<Shell>();

        public CustomizableData()
        {
            FirearmsData.AddRange(new Firearm[]
            {
                new Pistol(),
                new Revolver(),
                new BurstPistol(),
                new MachinePistol(),
                new Submachinegun(),
                new Carbine(),
                new Rifle(),
                new SemiAutoRifle(),
                new BattleRifle(),
                new AssaultRifle(),
                new ScopedRifle(),
                new Shotgun(),
                new SemiAutoCarbine(),
                new RocketLauncher(),
                new GrenadeLauncher(),
                new Mortar(),
                new InfantryGun(),
                new RecoillessRifle(),
                new AutomaticGrenadeLauncher(),
                new MultipleRocketLauncher(),
                new Molotov(),
                new AutomaticRifle(),
                new LightMachinegun(),
                new Grenade(),
                new RifleGrenade(),
                new Flamethrower(),
                new MountainGun()
            });
            GunsData.AddRange(new Gun[]
            {
                new C20mm(),
                new C37mm(),
                new C50mm(),
                new C75mm(),
                new C88mm(),
                new C128mm(),
                new C152mm(),
                new C203mm(),
                new C280mm(),
                new C305mm(),
                new C381mm(),
                new C480mm(),
                new C800mm(),
                new H75mm(),
                new H105mm(),
                new H122mm(),
                new H155mm(),
                new H203mm(),
                new H280mm()
            });
            ShellsData.AddRange(new Shell[]
            {
                new AP(),
                new HE()
            });
        }
        public void Export()
        {
            string json = JsonSerializer.Serialize(FirearmsData, new JsonSerializerOptions() { WriteIndented = true });
            File.WriteAllText("firearmsdata.json", json);
            json = JsonSerializer.Serialize(GunsData, new JsonSerializerOptions() { WriteIndented = true });
            File.WriteAllText("gunsdata.json", json);
            json = JsonSerializer.Serialize(ShellsData, new JsonSerializerOptions() { WriteIndented = true });
            File.WriteAllText("shellsdata.json", json);
        }
    }
    public sealed class MapData
    {
        public int Height { get; set; }
        public int Width { get; set; }
        [JsonIgnore]
        public string RoughMap { get; set; }

        public MapData(int width, int height, Tile[][] map)
        {
            Width = width;
            Height = height;

            StringBuilder sb = new();
            foreach (Tile[] ts in map)
            {
                foreach (Tile t in ts)
                {
                    sb.Append(t.Symbol);
                }
                sb.Append("\r\n");
            }
            sb.Append("\r\n");
            RoughMap = sb.ToString();
            sb.Clear();

            int size = width * height;
            IEnumerable<Tile> flatten = map.SelectMany(a => a);
            sb.Append($"Boundary: {flatten.Where(t => t.Symbol == 'B').Count()} / {size}\r\n");
            sb.Append($"Plains: {flatten.Where(t => t.Symbol == 'P').Count()} / {size}\r\n");
            sb.Append($"Grassland: {flatten.Where(t => t.Symbol == 'G').Count()} / {size}\r\n");
            sb.Append($"Forest: {flatten.Where(t => t.Symbol == 'F').Count()} / {size}\r\n");
            sb.Append($"Jungle: {flatten.Where(t => t.Symbol == 'J').Count()} / {size}\r\n");
            sb.Append($"Stream: {flatten.Where(t => t.Symbol == 'S').Count()} / {size}\r\n");
            sb.Append($"River: {flatten.Where(t => t.Symbol == 'R').Count()} / {size}\r\n");
            sb.Append($"Swamp: {flatten.Where(t => t.Symbol == 'W').Count()} / {size}\r\n");
            sb.Append($"Desert: {flatten.Where(t => t.Symbol == 'D').Count()} / {size}\r\n");
            sb.Append($"Hillock: {flatten.Where(t => t.Symbol == 'I').Count()} / {size}\r\n");
            sb.Append($"Hill: {flatten.Where(t => t.Symbol == 'H').Count()} / {size}\r\n");
            sb.Append($"Mountains: {flatten.Where(t => t.Symbol == 'M').Count()} / {size}\r\n");
            sb.Append($"Rocks: {flatten.Where(t => t.Symbol == 'O').Count()} / {size}\r\n");
            sb.Append($"Suburb: {flatten.Where(t => t.Symbol == 'U').Count()} / {size}\r\n");
            sb.Append($"City: {flatten.Where(t => t.Symbol == 'C').Count()} / {size}\r\n");
            sb.Append($"Metropolis: {flatten.Where(t => t.Symbol == 'E').Count()} / {size}\r\n");

            File.WriteAllText("mapstat.txt", RoughMap + sb.ToString());
        }
        public void Export()
        {
            string json = JsonSerializer.Serialize(this, new JsonSerializerOptions() { WriteIndented = true });
            File.WriteAllText("mapdata.json", json);
        }
    }

    #endregion

    #region Attributes

    public class Attribute
    {
        public double Value { get; set; }
        public Modifier Mod { get; set; } = new Modifier();

        public Attribute() { }
        public Attribute(double value, Modifier mod = null) => (Value, Mod) = (value, mod);

        public double ApplyMod()
        {
            return Mod?.Type switch
            {
                ModifierType.FIXED_VALUE => Value + Mod.Value,
                ModifierType.PERCENTAGE => Value * (1 + Mod.Value / 100),
                ModifierType.MULTIPLE => Value * Mod.Value,
                _ => Value
            };
        }

        public static double operator +(Attribute a, Attribute b) => a.ApplyMod() + b.ApplyMod();
        public static double operator -(Attribute a, Attribute b) => a.ApplyMod() - b.ApplyMod();
        public static double operator *(Attribute a, Attribute b) => a.ApplyMod() * b.ApplyMod();
        public static double operator /(Attribute a, Attribute b) => a.ApplyMod() / b.ApplyMod();
    }
    public class Resources
    {
        public Attribute Money { get; set; } = new Attribute();
        public Attribute Steel { get; set; } = new Attribute();
        public Attribute Supplies { get; set; } = new Attribute();
        public Attribute Cartridges { get; set; } = new Attribute();
        public Attribute Shells { get; set; } = new Attribute();
        public Attribute Fuel { get; set; } = new Attribute();
        public Attribute RareMetal { get; set; } = new Attribute();
        public Attribute Manpower { get; set; } = new Attribute();
        public Attribute Power { get; set; } = new Attribute();
        public Attribute Time { get; set; } = new Attribute();

        public Resources() { }
        public Resources(double money, double steel, double supplies, double cartridges, double shells, double fuel, double raremetal, double manpower, double power, double time)
            => (Money.Value, Steel.Value, Supplies.Value, Cartridges.Value, Shells.Value, Fuel.Value, RareMetal.Value, Manpower.Value, Power.Value, Time.Value)
            = (money, steel, supplies, cartridges, shells, fuel, raremetal, manpower, power, time);
        public Resources(Attribute money, Attribute steel, Attribute supplies, Attribute cartridges, Attribute shells, Attribute fuel, Attribute raremetal, Attribute manpower, Attribute power, Attribute time)
            => (Money, Steel, Supplies, Cartridges, Shells, Fuel, RareMetal, Manpower, Power, Time)
            = (money, steel, supplies, cartridges, shells, fuel, raremetal, manpower, power, time);
    }
    public class Cost
    {
        public Resources Base { get; set; } = new Resources();
        public Resources Research { get; set; } = new Resources();
        public Resources Repair { get; set; } = new Resources();
        public Resources Fortification { get; set; } = new Resources();
        public Resources Manufacture { get; set; } = new Resources();
        public Resources Maintenance { get; set; } = new Resources();
        public Resources Recycling { get; set; } = new Resources();
        public Modifier CostModifier { get; set; } = new Modifier();
    }
    public class Maneuverability
    {
        public Attribute Speed { get; set; } = new Attribute();
        public Attribute Mobility { get; set; } = new Attribute();
        public Attribute Size { get; set; } = new Attribute();
        public Attribute Weight { get; set; } = new Attribute();

        public Maneuverability() { }
        public Maneuverability(double speed, double mobility, double size, double weight)
            => (Speed.Value, Mobility.Value, Size.Value, Weight.Value)
            = (speed, mobility, size, weight);
    }
    public class Defense
    {
        public Attribute Strength { get; set; } = new Attribute();
        public Attribute Resistance { get; set; } = new Attribute();
        public Attribute Evasion { get; set; } = new Attribute();
        public Attribute Hardness { get; set; } = new Attribute();
        public Attribute Integrity { get; set; } = new Attribute();
        public Suppression Suppression { get; set; } = new Suppression();

        public Defense() { }
        public Defense(double strength, double resistance, double evasion, double hardness, double threshold, double resilience, double integrity)
            => (Strength.Value, Resistance.Value, Evasion.Value, Hardness.Value, Suppression.Threshold.Value, Suppression.Resilience.Value, Integrity.Value)
            = (strength, resistance, evasion, hardness, threshold, resilience, integrity);
    }
    public class Suppression
    {
        public Attribute Threshold { get; set; } = new Attribute();
        public Attribute Resilience { get; set; } = new Attribute();

        public Suppression() { }
        public Suppression(double threshold, double resilience) 
            => (Threshold.Value, Resilience.Value) 
            = (threshold, resilience);
    }
    public class Offense
    {
        public Handling Handling { get; set; } = new Handling();
        public Damage Damage { get; set; } = new Damage();
        public Accuracy Accuracy { get; set; } = new Accuracy();
        public AOE AOE { get; set; } = new AOE();
        public Attribute Suppression { get; set; } = new Attribute();
        public Attribute MinRange { get; set; } = new Attribute();
        public Attribute MaxRange { get; set; } = new Attribute();
        public bool IsDirectFire { get; set; }

        public Offense() { }
        public Offense(Handling handling, Damage damage, Accuracy accuracy, AOE aoe, double suppress, double min_range, double max_range, bool direct)
                   => (Handling, Damage, Accuracy, AOE, Suppression.Value, MinRange.Value, MaxRange.Value, IsDirectFire)
                    = (handling, damage, accuracy, aoe, suppress, min_range, max_range, direct);
    }
    public class Damage
    {
        public Attribute Soft { get; set; } = new Attribute();
        public Attribute Hard { get; set; } = new Attribute();
        public Attribute Destruction { get; set; } = new Attribute();
        public Attribute Deviation { get; set; } = new Attribute();
        public Attribute Dropoff { get; set; } = new Attribute();
        public Attribute Penetration { get; set; } = new Attribute();

        public Damage() { }
        public Damage(double soft, double hard, double destruction, double deviation, double dropoff)
            => (Soft.Value, Hard.Value, Destruction.Value, Deviation.Value, Dropoff.Value)
            = (soft, hard, destruction, deviation, dropoff);
        public Damage(double soft, double hard, double destruction, double deviation, double dropoff, double penetration)
            => (Soft.Value, Hard.Value, Destruction.Value, Deviation.Value, Dropoff.Value, Penetration.Value)
            = (soft, hard, destruction, deviation, dropoff, penetration);
    }
    public class Handling
    {
        public Attribute Cyclic { get; set; } = new Attribute();
        public Attribute Clip { get; set; } = new Attribute();
        public Attribute Reload { get; set; } = new Attribute();
        public Attribute Aim { get; set; } = new Attribute();
        public Attribute Salvo { get; set; } = new Attribute();
        public double ROF { get; init; }
        public double ROFSuppress { get; init; }

        public Handling() { }
        public Handling(double cyclic, double clip, double reload, double aim, double salvo)
            => (Cyclic.Value, Clip.Value, Reload.Value, Aim.Value, Salvo.Value, ROF, ROFSuppress)
            = (cyclic, clip, reload, aim, salvo,
               5 * cyclic * clip * salvo / (5 * clip + cyclic * salvo * (reload + aim)),
               5 * cyclic * clip * salvo / (5 * clip + cyclic * salvo * reload));
    }
    public class Accuracy
    {
        public Attribute Normal { get; set; } = new Attribute();
        public Attribute Suppress { get; set; } = new Attribute();
        public Attribute Deviation { get; set; } = new Attribute();

        public Accuracy() { }
        public Accuracy(double normal, double suppress, double deviation)
            => (Normal.Value, Suppress.Value, Deviation.Value)
            = (normal, suppress, deviation);
    }
    public class AOE
    {
        public Attribute BlastRadius { get; set; } = new Attribute();
        public Attribute SplashDecay { get; set; } = new Attribute();

        public AOE() { }
        public AOE(double blast_radius, double splash_decay) => (BlastRadius.Value, SplashDecay.Value) = (blast_radius, splash_decay);
    }
    public class Payload
    {
        public List<Unit> Units { get; set; } = new List<Unit>();
        public Resources Cargo { get; set; } = new Resources();
    }
    public class LoadLimit
    {
        public Attribute Size { get; set; } = new Attribute();
        public Attribute Weight { get; set; } = new Attribute();
        public Resources CargoCapacity { get; set; } = new Resources();

        public LoadLimit() { }
        public LoadLimit(double size, double weight, Resources cargo_cap)
            => (Size.Value, Weight.Value, CargoCapacity)
            = (size, weight, cargo_cap);
    }
    public class Scouting
    {
        public Attribute Reconnaissance { get; set; } = new Attribute();
        public Attribute Camouflage { get; set; } = new Attribute();
        public Attribute Detection { get; set; } = new Attribute();
        public Attribute Communication { get; set; } = new Attribute();

        public Scouting() { }
        public Scouting(double recon, double camo, double detect, double comm)
            => (Reconnaissance.Value, Camouflage.Value, Detection.Value, Communication.Value)
            = (recon, camo, detect, comm);
    }

    #endregion

    #region Buildings

    public abstract class Building
    {
        public enum BuildingStatus { None, UnderConstruction, Active, Destroyed }
        public string Name { get; set; }
        public Player Owner { get; set; }
        public BuildingStatus Status { get; set; } = BuildingStatus.None;
        public Point CoOrds { get; set; } = new Point();
        public double Level { get; set; } = 0;
        public double MaxLevel { get; set; }
        public double Size { get; set; }
        public Cost Cost { get; set; } = new Cost();
        public Attribute Durability { get; set; } = new Attribute();
        public Scouting Scouting { get; set; } = new Scouting();
        public bool DestroyTerrainOnBuilt { get; set; } = true;
        public double ConstructionTimeRemaining { get; set; }
    }
    public abstract class UnitBuilding : Building
    {
        public Attribute QueueCapacity { get; set; } = new Attribute(10, new Modifier(ModifierType.FIXED_VALUE, 2));
        public List<Unit> TrainingQueue { get; set; } = new List<Unit>();
        public double CurrentQueueTime { get; set; }
        public List<Unit> ReadyToDeploy { get; set; } = new List<Unit>();
        public Attribute DeployRange { get; set; } = new Attribute(1, new Modifier(ModifierType.FIXED_VALUE, 0.25));

        public UnitBuilding() : base() { }
    }
    public abstract class ResourcesBuilding : Building
    {
        public enum ResourceBuildingStatus { None, Operating, ProductionHalted }
        public ResourceBuildingStatus RBStatus { get; set; } = ResourceBuildingStatus.None;
        public Resources Production { get; set; } = new Resources();

    }
    public abstract class Infrastructure : Building
    {

    }
    public abstract class TransmissionBuilding : Building
    {
        public Attribute EffectiveRange { get; set; } = new Attribute(5, new Modifier(ModifierType.FIXED_VALUE, 0.5));
    }
    public abstract class DefensiveBuilding : Building
    {
        public Offense Offense { get; set; } = new Offense();
        public Defense Defense { get; set; } = new Defense();
    }

    public sealed class Barracks : UnitBuilding
    {
        public Barracks() : base()
        {
            Name = "barracks";
            Size = 40;
            Cost = new Cost()
            {
                Base = new Resources(1000, 500, 200, 50, 0, 20, 0, 200, 0, 3),
                Fortification = new Resources(500, 250, 100, 25, 0, 10, 0, 100, 1, 2),
                Repair = new Resources(200, 50, 40, 5, 0, 2, 0, 40, 0, 0),
                Maintenance = new Resources(100, 0, 20, 0, 0, 0, 0, 20, 5, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.1)
            };
            Durability = new Attribute(5000, new Modifier(ModifierType.FIXED_VALUE, 1000));
            MaxLevel = 12;
            Scouting = new Scouting() { Camouflage = new Attribute(2) };
        }
    }
    public sealed class Arsenal : UnitBuilding
    {
        public Arsenal() : base()
        {
            Name = "arsenal";
            Size = 40;
            Cost = new Cost()
            {
                Base = new Resources(1200, 600, 250, 60, 20, 30, 0, 250, 0, 4),
                Fortification = new Resources(600, 300, 125, 30, 10, 15, 0, 125, 2, 2),
                Repair = new Resources(240, 60, 50, 6, 1, 3, 0, 50, 0, 0),
                Maintenance = new Resources(120, 0, 25, 0, 0, 0, 0, 25, 6, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.1)
            };
            Durability = new Attribute(5000, new Modifier(ModifierType.FIXED_VALUE, 1000));
            MaxLevel = 12;
            Scouting = new Scouting() { Camouflage = new Attribute(2) };
        }
    }
    public sealed class Dockyard : UnitBuilding
    {
        public Dockyard() : base()
        {
            Name = "dockyard";
            Size = 40;
            Cost = new Cost()
            {
                Base = new Resources(1500, 800, 300, 80, 40, 60, 5, 400, 0, 5),
                Fortification = new Resources(750, 400, 150, 40, 20, 30, 0, 200, 3, 2),
                Repair = new Resources(300, 80, 60, 8, 2, 6, 0, 80, 0, 0),
                Maintenance = new Resources(150, 0, 30, 0, 0, 0, 0, 40, 9, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.1)
            };
            Durability = new Attribute(5000, new Modifier(ModifierType.FIXED_VALUE, 1000));
            MaxLevel = 12;
            Scouting = new Scouting() { Camouflage = new Attribute(2) };
        }
    }
    public sealed class Airfield : UnitBuilding
    {
        public Airfield() : base()
        {
            Name = "airfield";
            Size = 40;
            Cost = new Cost()
            {
                Base = new Resources(2000, 1000, 400, 100, 50, 100, 10, 500, 0, 6),
                Fortification = new Resources(1000, 500, 200, 50, 25, 50, 0, 250, 4, 2),
                Repair = new Resources(400, 100, 80, 10, 5, 10, 0, 100, 0, 0),
                Maintenance = new Resources(200, 0, 40, 0, 0, 0, 0, 50, 12, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.1)
            };
            Durability = new Attribute(5000, new Modifier(ModifierType.FIXED_VALUE, 1000));
            MaxLevel = 12;
            Scouting = new Scouting() { Camouflage = new Attribute(2) };
        }
    }

    public sealed class Foundry : ResourcesBuilding
    {
        public Foundry() : base()
        {
            Name = "foundry";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 0, 100, 0, 0, 10, 0, 100, 0, 2),
                Fortification = new Resources(250, 0, 50, 0, 0, 5, 0, 50, 1, 1),
                Repair = new Resources(100, 0, 20, 0, 0, 1, 0, 20, 0, 0),
                Maintenance = new Resources(50, 0, 10, 0, 0, 0, 0, 10, 3, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.05)
            };
            Durability = new Attribute(1500, new Modifier(ModifierType.FIXED_VALUE, 500));
            MaxLevel = 20;
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 100, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    }
    public sealed class Industries : ResourcesBuilding
    {
        public Industries() : base()
        {
            Name = "industries";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 250, 0, 0, 0, 10, 0, 100, 0, 2),
                Fortification = new Resources(250, 125, 0, 0, 0, 5, 0, 50, 1, 1),
                Repair = new Resources(100, 25, 0, 0, 0, 1, 0, 20, 0, 0),
                Maintenance = new Resources(50, 0, 0, 0, 0, 0, 0, 10, 3, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.05)
            };
            Durability = new Attribute(1500, new Modifier(ModifierType.FIXED_VALUE, 500));
            MaxLevel = 20;
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 0, 200, 0, 0, 0, 0, 0, 0, 0);
        }
    }
    public sealed class AmmoFactory : ResourcesBuilding
    {
        public bool ProduceCartridges { get; set; } = true;
        public AmmoFactory() : base()
        {
            Name = "ammo_factory";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 250, 100, 0, 0, 10, 0, 100, 0, 2),
                Fortification = new Resources(250, 125, 50, 0, 0, 5, 0, 50, 1, 1),
                Repair = new Resources(100, 25, 20, 0, 0, 1, 0, 20, 0, 0),
                Maintenance = new Resources(50, 25, 10, 0, 0, 0, 0, 10, 3, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.05)
            };
            Durability = new Attribute(1500, new Modifier(ModifierType.FIXED_VALUE, 500));
            MaxLevel = 20;
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 0, 0, 50, 20, 0, 0, 0, 0, 0);
        }
    }
    public sealed class Refinery : ResourcesBuilding
    {
        public Refinery() : base()
        {
            Name = "refinery";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 250, 100, 0, 0, 0, 0, 100, 0, 2),
                Fortification = new Resources(250, 125, 50, 0, 0, 0, 0, 50, 1, 1),
                Repair = new Resources(100, 25, 20, 0, 0, 0, 0, 20, 0, 0),
                Maintenance = new Resources(50, 0, 10, 0, 0, 0, 0, 10, 3, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.05)
            };
            Durability = new Attribute(1500, new Modifier(ModifierType.FIXED_VALUE, 500));
            MaxLevel = 20;
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 0, 0, 0, 0, 20, 0, 0, 0, 0);
        }
    }
    public sealed class Quarry : ResourcesBuilding
    {
        public Quarry() : base()
        {
            Name = "quarry";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 250, 100, 0, 0, 10, 0, 100, 0, 2),
                Fortification = new Resources(250, 125, 50, 0, 0, 5, 0, 50, 1, 1),
                Repair = new Resources(100, 25, 20, 0, 0, 1, 0, 20, 0, 0),
                Maintenance = new Resources(50, 0, 10, 0, 0, 0, 0, 10, 3, 0)
            };
            Durability = new Attribute(2000);
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 0, 0, 0, 0, 0, 2, 0, 0, 0);
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class PowerPlant : ResourcesBuilding
    {
        public PowerPlant() : base()
        {
            Name = "power_plant";
            Size = 25;
            Cost = new Cost()
            {
                Base = new Resources(500, 250, 100, 0, 0, 10, 0, 100, 0, 2),
                Fortification = new Resources(250, 125, 50, 0, 0, 5, 0, 50, 0, 1),
                Repair = new Resources(100, 25, 20, 0, 0, 1, 0, 20, 0, 0),
                Maintenance = new Resources(50, 0, 10, 0, 0, 0, 0, 10, 0, 0),
                CostModifier = new Modifier(ModifierType.PERCENTAGE, 0.075)
            };
            Durability = new Attribute(2000, new Modifier(ModifierType.FIXED_VALUE, 1000));
            MaxLevel = 5;
            Scouting = new Scouting() { Camouflage = new Attribute(1.5) };
            Production = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 20, 0);
        }
    }

    public sealed class Road : Infrastructure
    {
        public Road() : base()
        {
            Name = "road";
            Size = 0;
            Cost = new Cost()
            {
                Base = new Resources(50, 0, 5, 0, 0, 0, 0, 5, 0, 0.25),
                Fortification = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Repair = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Maintenance = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Durability = new Attribute(double.MaxValue);
            MaxLevel = 1;
            Scouting = new Scouting() { Camouflage = new Attribute(0) };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Railway : Infrastructure
    {
        public Railway() : base()
        {
            Name = "railway";
            Size = 0;
            Cost = new Cost()
            {
                Base = new Resources(150, 0, 10, 0, 0, 0, 0, 10, 0, 0.5),
                Fortification = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Repair = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Maintenance = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Durability = new Attribute(3000);
            MaxLevel = 1;
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Bridge : Infrastructure
    {
        public Bridge() : base()
        {
            Name = "bridge";
            Size = 15;
            Cost = new Cost()
            {
                Base = new Resources(500, 100, 20, 0, 0, 0, 0, 20, 0, 1),
                Fortification = new Resources(250, 50, 0, 0, 0, 0, 0, 0, 0, 0),
                Repair = new Resources(100, 10, 0, 0, 0, 0, 0, 0, 0, 0),
                Maintenance = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Durability = new Attribute(1250);
            MaxLevel = 1;
            Scouting = new Scouting() { Camouflage = new Attribute(0) };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Depot : Infrastructure
    {
        public Depot() : base()
        {
            Name = "depot";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            MaxLevel = 5;
            Scouting = new Scouting() { Camouflage = new Attribute() };
        }
    }
    public sealed class Outpost : Infrastructure
    {
        public Outpost() : base()
        {
            Name = "outpost";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
        }
    }

    public sealed class Watchtower : TransmissionBuilding
    {
        public Watchtower() : base()
        {
            Name = "watchtower";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class SignalTower : TransmissionBuilding
    {
        public SignalTower() : base()
        {
            Name = "signal_tower";
            Cost = new Cost()
            {
                Base = new Resources(1000, 1000, 0, 0, 0, 0, 0, 0, 0, 2)
            };
            Durability = new Attribute(2000);
            Scouting = new Scouting() { Camouflage = new Attribute(150) };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class JammingTower : TransmissionBuilding
    {
        public JammingTower() : base()
        {
            Name = "jamming_tower";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class RadarTower : TransmissionBuilding
    {
        public RadarTower() : base()
        {
            Name = "radar_tower";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }

    public sealed class Trench : DefensiveBuilding
    {
        public Trench() : base()
        {
            Name = "trench";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
        }
    }
    public sealed class Foxhole : DefensiveBuilding
    {
        public Foxhole() : base()
        {
            Name = "foxhole";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
        }
    }
    public sealed class Pillbox : DefensiveBuilding
    {
        public Pillbox() : base()
        {
            Name = "pillbox";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Bunker : DefensiveBuilding
    {
        public Bunker() : base()
        {
            Name = "bunker";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Wires : DefensiveBuilding
    {
        public Wires() : base()
        {
            Name = "wires";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class TankTraps : DefensiveBuilding
    {
        public TankTraps() : base()
        {
            Name = "tank_traps";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }
    public sealed class Minefield : DefensiveBuilding
    {
        public Minefield() : base()
        {
            Name = "minefield";
            Cost = new Cost()
            {

            };
            Durability = new Attribute();
            Scouting = new Scouting() { Camouflage = new Attribute() };
            DestroyTerrainOnBuilt = false;
        }
    }

    #endregion

    #region Units

    public abstract class Unit
    {
        public enum UnitStatus { None, InQueue, CanBeDeployed, Active, Moved, Fired, Wrecked, Destroyed }
        public string Name { get; set; }
        public Player Owner { get; set; }
        public Point Coords { get; set; } = new Point();
        public UnitStatus Status { get; set; } = UnitStatus.None;
        public Cost Cost { get; set; } = new Cost();
        public Maneuverability Maneuverability { get; set; } = new Maneuverability();
        public Defense Defense { get; set; } = new Defense();
        public Resources Consumption { get; set; } = new Resources();
        public Resources Carrying { get; set; } = new Resources();
        public Resources Capacity { get; set; } = new Resources();
        public Scouting Scouting { get; set; } = new Scouting();
        public Attribute Morale { get; set; } = new Attribute(100);

        public double CurrentSuppressionLevel { get; set; } = 0;
        public int LastSuppressedRound { get; set; } = 0;
        public bool IsSuppressed { get; set; } = false;
        public bool IsDisconnected { get; set; } = false;
        public double TrainingTimeRemaining { get; set; }
        public UnitBuilding TrainingGround { get; set; }

        public bool IsCommandSet { get; set; } = false;
    }
    public abstract class Personnel : Unit
    {
        public Firearm PrimaryFirearm { get; set; }
        public Firearm SecondaryFirearm { get; set; }
        public string DefaultPrimary { get; set; }
        public List<string> AvailableFirearms { get; set; } = new List<string>();
        public Attribute CaptureEfficiency { get; set; } = new Attribute();
    }
    public abstract class Artillery : Unit
    {
        public bool IsAssembled { get; set; } = false;
        public double AssembleTime { get; set; }
        public string DefaultGun { get; set; }
        public Gun Gun { get; set; }
        public Radio Radio { get; set; }
        public CannonBreech CannonBreech { get; set; }
    }
    public abstract class Vehicle : Unit
    {
        public string DefaultMainArmament { get; set; }
        public List<Gun> Guns { get; set; } = new List<Gun>();
        public List<MachineGun> MachineGuns { get; set; } = new List<MachineGun>();
        public Engine Engine { get; set; }
        public Suspension Suspension { get; set; }
        public Radio Radio { get; set; }
        public Periscope Periscope { get; set; }
        public FuelTank FuelTank { get; set; }
        public CannonBreech CannonBreech { get; set; }
        public AmmoRack AmmoRack { get; set; }
    }
    public abstract class Vessel : Unit
    {
        public List<string> DefaultMainArmaments { get; set; } = new List<string>();
        public List<string> DefaultSecondaryArmaments { get; set; } = new List<string>();
        public List<Gun> Guns { get; set; } = new List<Gun>();
        public List<MachineGun> MachineGuns { get; set; } = new List<MachineGun>();
        public Engine Engine { get; set; }
        public Radio Radio { get; set; }
        public Periscope Periscope { get; set; }
        public FuelTank FuelTank { get; set; }
        public CannonBreech CannonBreech { get; set; }
        public AmmoRack AmmoRack { get; set; }
        public Propeller Propeller { get; set; }
        public Rudder Rudder { get; set; }
        public Radar Radar { get; set; }
        public double Altitude { get; set; }
    }
    public abstract class Plane : Unit
    {
        public List<Gun> Guns { get; set; } = new List<Gun>();
        public List<MachineGun> MachineGuns { get; set; } = new List<MachineGun>();
        public Engine Engine { get; set; }
        public Radio Radio { get; set; }
        public FuelTank FuelTank { get; set; }
        public CannonBreech CannonBreech { get; set; }
        public AmmoRack AmmoRack { get; set; }
        public Propeller Propeller { get; set; }
        public Rudder Rudder { get; set; }
        public Wings Wings { get; set; }
        public LandingGear LandingGear { get; set; }
        public Radar Radar { get; set; }
        public double Altitude { get; set; }
    }

    public class Militia : Personnel
    {
        public Militia()
        {
            Name = "militia";
            DefaultPrimary = typeof(Pistol).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(Pistol).Name,
                typeof(Revolver).Name,
                typeof(BurstPistol).Name,
                typeof(MachinePistol).Name,
                typeof(Submachinegun).Name,
                typeof(Carbine).Name,
                typeof(Shotgun).Name,
                typeof(Molotov).Name
            };
            Cost = new Cost()
            {
                Base = new Resources(100, 2, 200, 10, 0, 0, 0, 150, 0, 0.25),
                Research = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(5, 42, 1, 0.3);
            Defense = new Defense(400, 0, 0.1, 0, 0.6, 0.08, 0);
            Consumption = new Resources(0, 0, 10, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 400, 20, 0, 0, 0, 0, 0, 0);
            Scouting = new Scouting(7, 32, 50, 5);
            CaptureEfficiency = new Attribute(25);
        }
    }
    public class Infantry : Personnel
    {
        public Infantry()
        {
            Name = "infantry";
            DefaultPrimary = typeof(Rifle).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(Rifle).Name,
                typeof(SemiAutoRifle).Name,
                typeof(BattleRifle).Name,
                typeof(AssaultRifle).Name,
                typeof(ScopedRifle).Name,
                typeof(AutomaticRifle).Name,
                typeof(LightMachinegun).Name,
                typeof(Grenade).Name,
                typeof(RifleGrenade).Name
            };
            Cost = new Cost()
            {
                Base = new Resources(300, 5, 250, 15, 0, 0, 0, 150, 0, 0.5),
                Research = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(4, 36, 1.2, 0.33);
            Defense = new Defense(750, 0, 0.08, 0, 0.66, 0.12, 0);
            Consumption = new Resources(0, 0, 12.5, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 500, 30, 0, 0, 0, 0, 0, 0);
            Scouting = new Scouting(6, 28, 45, 5);
            CaptureEfficiency = new Attribute(40);
        }
    }
    public class Assault : Personnel
    {
        public Assault()
        {
            Name = "assault";
            DefaultPrimary = typeof(Carbine).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(Carbine).Name,
                typeof(Submachinegun).Name,
                typeof(Shotgun).Name,
                typeof(SemiAutoCarbine).Name,
                typeof(AssaultRifle).Name,
                typeof(AutomaticRifle).Name,
                typeof(Grenade).Name,
                typeof(Flamethrower).Name
            };
            Cost = new Cost()
            {
                Base = new Resources(400, 8, 300, 20, 0, 0, 0, 150, 0, 0.5),
                Research = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(2, 50, 1.3, 0.36);
            Defense = new Defense(600, 0, 0.075, 0, 0.8, 0.15, 0);
            Consumption = new Resources(0, 0, 15, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 600, 40, 0, 0, 0, 0, 0, 0);
            Scouting = new Scouting(6, 26, 42, 5);
            CaptureEfficiency = new Attribute(50);
        }
    }
    public class Support : Personnel
    {
        public Support()
        {
            Name = "support";
            DefaultPrimary = typeof(RocketLauncher).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(RocketLauncher).Name,
                typeof(GrenadeLauncher).Name,
                typeof(Mortar).Name,
                typeof(InfantryGun).Name,
                typeof(RecoillessRifle).Name,
                typeof(AutomaticGrenadeLauncher).Name,
                typeof(MultipleRocketLauncher).Name
            };
            Cost = new Cost()
            {
                Base = new Resources(1000, 10, 400, 25, 0, 0, 0, 150, 0, 1),
                Research = new Resources(150, 50, 0, 0, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(2, 24, 1.5, 0.5);
            Defense = new Defense(900, 0, 0.06, 0.15, 0.7, 0.1, 0);
            Consumption = new Resources(0, 0, 20, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 800, 50, 10, 0, 0, 0, 0, 0);
            Scouting = new Scouting(6, 19, 40, 5);
            CaptureEfficiency = new Attribute(40);
        }
    }
    public class Mountain : Personnel
    {
        public Mountain()
        {
            Name = "mountain";
            DefaultPrimary = typeof(Carbine).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(Carbine).Name,
                typeof(Rifle).Name,
                typeof(SemiAutoRifle).Name,
                typeof(SemiAutoCarbine).Name,
                typeof(ScopedRifle).Name,
                typeof(BattleRifle).Name,
                typeof(AutomaticRifle).Name,
                typeof(LightMachinegun).Name,
                typeof(Mortar).Name,
                typeof(MountainGun).Name,
            }; 
            Cost = new Cost()
            {
                Base = new Resources(800, 15, 320, 12.5, 10, 0, 0, 150, 0, 0.75),
                Research = new Resources(250, 60, 0, 0, 0, 0, 0, 0, 0, 2.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(3, 30, 1.4, 0.4);
            Defense = new Defense(1000, 0, 0.07, 0.1, 0.75, 0.09, 0);
            Consumption = new Resources(0, 0, 16, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 640, 25, 20, 0, 0, 0, 0, 0);
            Scouting = new Scouting(6, 21, 37.5, 6);
            CaptureEfficiency = new Attribute(30);
        }
    }
    public class Engineer : Personnel
    {
        public Engineer()
        {
            Name = "engineer";
            DefaultPrimary = typeof(Submachinegun).Name;
            AvailableFirearms = new List<string>()
            {
                typeof(Submachinegun).Name,
                typeof(Flamethrower).Name,
                typeof(Carbine).Name,
                typeof(Shotgun).Name,
                typeof(Molotov).Name
            };
            Cost = new Cost()
            {
                Base = new Resources(250, 6, 280, 12.5, 0, 0, 0, 150, 0, 0.5),
                Research = new Resources(100, 25, 0, 0, 0, 0, 0, 0, 0, 3.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
            };
            Maneuverability = new Maneuverability(2, 40, 1.25, 0.25);
            Defense = new Defense(500, 0, 0.09, 0, 0.64, 0.08, 0);
            Consumption = new Resources(0, 0, 14, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 560, 25, 0, 0, 0, 0, 0, 0);
            Scouting = new Scouting(6, 22.5, 35, 5);
            CaptureEfficiency = new Attribute(20);
        }
    }

    public class Portable : Artillery
    {
        public Portable()
        {
            Name = "portable";
            Cost = new Cost()
            {
                Base = new Resources(750, 25, 50, 0, 7.5, 0, 0, 20, 0, 1.25),
                Research = new Resources(500, 100, 0, 0, 0, 0, 0.25, 0, 0, 3),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0)
            };
            Maneuverability = new Maneuverability(2, 32, 1.8, 2);
            Defense = new Defense(200, 20, 0.05, 0.2, 0.8, 0.075, 100);
            Consumption = new Resources(0, 0, 2.5, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 100, 0, 15, 0, 0, 0, 0, 0);
            Scouting = new Scouting(5, 16, 30, 6);
            DefaultGun = typeof(C37mm).Name;
            Gun = new C37mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }
    public class DirectFire : Artillery
    {
        public DirectFire()
        {
            Name = "direct_fire";
            Cost = new Cost()
            {
                Base = new Resources(900, 30, 80, 0, 10, 0, 0, 20, 0, 1.5),
                Research = new Resources(600, 108, 0, 0, 0, 0, 0.5, 0, 0, 3.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1, 0)
            };
            Maneuverability = new Maneuverability(2, 25, 2.2, 2.5);
            Defense = new Defense(200, 30, 0.025, 0.25, 0.84, 0.07, 125);
            Consumption = new Resources(0, 0, 4, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 160, 0, 20, 0, 0, 0, 0, 0);
            Scouting = new Scouting(5, 13, 27.5, 6);
            DefaultGun = typeof(C50mm).Name;
            Gun = new C50mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }
    public class AntiTank : Artillery
    {
        public AntiTank()
        {
            Name = "anti_tank";
            Cost = new Cost()
            {
                Base = new Resources(1000, 40, 80, 0, 12.5, 0, 0, 20, 0, 1.75),
                Research = new Resources(640, 125, 0, 0, 0, 0, 0.5, 0, 0, 4),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.5, 0)
            };
            Maneuverability = new Maneuverability(2, 20, 2, 3);
            Defense = new Defense(250, 30, 0.03, 0.3, 0.88, 0.064, 125);
            Consumption = new Resources(0, 0, 4, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 160, 0, 25, 0, 0, 0, 0, 0);
            Scouting = new Scouting(5, 14, 25, 7);
            DefaultGun = typeof(C88mm).Name;
            Gun = new C88mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }
    public class AntiAircraft : Artillery
    {
        public AntiAircraft()
        {
            Name = "anti_aircraft";
            Cost = new Cost()
            {
                Base = new Resources(1100, 45, 80, 0, 12.5, 0, 0, 20, 0, 2),
                Research = new Resources(660, 140, 0, 0, 0, 0, 0.5, 0, 0, 4),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.5, 0)
            };
            Maneuverability = new Maneuverability(2, 18, 2.5, 3.6);
            Defense = new Defense(250, 30, 0.03, 0.3, 0.88, 0.064, 125);
            Consumption = new Resources(0, 0, 4, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 160, 0, 25, 0, 0, 0, 0, 0);
            Scouting = new Scouting(5, 12, 25, 7);
            DefaultGun = typeof(C88mm).Name;
            Gun = new C88mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }
    public class HeavySupport : Artillery
    {
        public HeavySupport()
        {
            Name = "heavy_support";
            Cost = new Cost()
            {
                Base = new Resources(1250, 60, 60, 0, 15, 0, 0, 32, 0, 2.5),
                Research = new Resources(750, 150, 0, 0, 0, 0, 0.5, 0, 0, 6),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2, 0)
            };
            Maneuverability = new Maneuverability(0, 0, 3.2, 4.5);
            Defense = new Defense(300, 60, 0, 0.33, 0.9, 0.06, 150);
            Consumption = new Resources(0, 0, 3, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 120, 0, 30, 0, 0, 0, 0, 0);
            Scouting = new Scouting(4, 4, 24, 7);
            DefaultGun = typeof(C203mm).Name;
            Gun = new C203mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }
    public class SelfPropelled : Artillery
    {
        public SelfPropelled()
        {
            Name = "self_propelled";
            Cost = new Cost()
            {
                Base = new Resources(1600, 75, 40, 0, 16, 20, 0, 24, 0, 3),
                Research = new Resources(800, 180, 0, 0, 0, 0, 0.75, 0, 0, 7.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3, 0)
            };
            Maneuverability = new Maneuverability(3, 54, 3.5, 8);
            Defense = new Defense(450, 80, 0.04, 0.55, 1.2, 0, 175);
            Consumption = new Resources(0, 0, 2, 0, 0, 1, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 80, 0, 32, 50, 0, 0, 0, 0);
            Scouting = new Scouting(4, 7.5, 30, 7);
            DefaultGun = typeof(C128mm).Name;
            Gun = new C128mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 0;
        }
    }
    public class Railroad : Artillery
    {
        public Railroad()
        {
            Name = "railroad";
            Cost = new Cost()
            {
                Base = new Resources(3000, 200, 120, 0, 30, 30, 0, 40, 0, 6),
                Research = new Resources(2000, 400, 0, 0, 0, 0, 2, 0, 0, 12),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 7.5, 0)
            };
            Maneuverability = new Maneuverability(1, 10, 7, 25);
            Defense = new Defense(720, 100, 0, 0.4, 1.2, 0, 180);
            Consumption = new Resources(0, 0, 6, 0, 0, 1.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 240, 0, 60, 75, 0, 0, 0, 0);
            Scouting = new Scouting(2, 2.5, 15, 8);
            DefaultGun = typeof(C480mm).Name;
            Gun = new C480mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 2;
        }
    }
    public class CoastalGun : Artillery
    {
        public CoastalGun()
        {
            Name = "coastal_gun";
            Cost = new Cost()
            {
                Base = new Resources(1200, 100, 30, 0, 20, 0, 0, 32, 0, 2.75),
                Research = new Resources(700, 200, 0, 0, 0, 0, 0.5, 0, 0, 7),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2.5, 0)
            };
            Maneuverability = new Maneuverability(0, 0, 4, 11);
            Defense = new Defense(400, 50, 0, 0.33, 0.93, 0.056, 140);
            Consumption = new Resources(0, 0, 1.5, 0, 0, 0, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 60, 0, 40, 0, 0, 0, 0, 0);
            Scouting = new Scouting(4, 8, 32, 7);
            DefaultGun = typeof(C305mm).Name;
            Gun = new C305mm();
            Consumption.Shells = Gun.ShellConsumption;
            AssembleTime = 1;
        }
    }

    public class MotorisedInfantry : Vehicle
    {
        public MotorisedInfantry()
        {
            Name = "motorised_infantry";
            Cost = new Cost()
            {
                Base = new Resources(800, 125, 120, 50, 7.5, 20, 0, 100, 0, 3.25),
                Research = new Resources(1000, 225, 0, 0, 0, 0, 0.5, 0, 0, 5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3, 0)
            };
            Maneuverability = new Maneuverability(5, 72, 2.75, 5.5);
            Defense = new Defense(600, 75, 0.032, 0.5, 1.2, 0, 130);
            Consumption = new Resources(0, 0, 6, 0, 0, 1, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 240, 100, 15, 50, 0, 0, 0, 0);
            Scouting = new Scouting(4, 17.5, 25, 8);
            DefaultMainArmament = typeof(C37mm).Name;
            Guns.Add(new C37mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class Utility : Vehicle
    {
        public LoadLimit LoadLimit { get; set; } = new(0, 1, new Resources(0, 0, 1500, 400, 200, 250, 0, 0, 0, 0));
        public Utility()
        {
            Name = "utility";
            Cost = new Cost()
            {
                Base = new Resources(700, 70, 60, 40, 0, 10, 0, 12, 0, 2.5),
                Research = new Resources(900, 160, 0, 0, 0, 0, 0.5, 0, 0, 4.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2.5, 0)
            };
            Maneuverability = new Maneuverability(7, 96, 3, 3.2);
            Defense = new Defense(800, 125, 0.045, 0.45, 1.2, 0, 200);
            Consumption = new Resources(0, 0, 3, 0, 0, 0.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 120, 80, 0, 25, 0, 0, 0, 0);
            Scouting = new Scouting(4, 9, 22, 10);
            DefaultMainArmament = typeof(C20mm).Name;
            Guns.Add(new C20mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class Carrier : Vehicle
    {
        public LoadLimit LoadLimit { get; set; } = new(0, 3, new Resources(0, 0, 500, 100, 50, 0, 0, 0, 0, 0));
        public Carrier()
        {
            Name = "carrier";
            Cost = new Cost()
            {
                Base = new Resources(2250, 150, 80, 62.5, 10, 50, 0, 16, 0, 4.5),
                Research = new Resources(1750, 250, 0, 0, 0, 0, 2.5, 0, 0, 8),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 5, 0)
            };
            Maneuverability = new Maneuverability(5, 90, 2.9, 10);
            Defense = new Defense(1400, 225, 0.02, 0.9, 1.2, 0, 400);
            Consumption = new Resources(0, 0, 4, 0, 0, 2.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 160, 125, 20, 125, 0, 0, 0, 0);
            Scouting = new Scouting(4, 6, 28, 10);
            DefaultMainArmament = typeof(C75mm).Name;
            Guns.Add(new C75mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class ArmouredCar : Vehicle
    {
        public ArmouredCar()
        {
            Name = "armoured_car";
            Cost = new Cost()
            {
                Base = new Resources(2000, 140, 60, 62.5, 5, 40, 0, 20, 0, 3.5),
                Research = new Resources(1250, 240, 0, 0, 0, 0, 0.75, 0, 0, 5.25),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2.75, 0)
            };
            Maneuverability = new Maneuverability(4, 80, 2.8, 9);
            Defense = new Defense(900, 200, 0.03, 0.66, 1.2, 0, 300);
            Consumption = new Resources(0, 0, 3, 0, 0, 2, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 120, 125, 10, 100, 0, 0, 0, 0);
            Scouting = new Scouting(4, 12.5, 27, 8);
            DefaultMainArmament = typeof(C37mm).Name;
            Guns.Add(new C37mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class TankDestroyer : Vehicle
    {
        public TankDestroyer()
        {
            Name = "tank_destroyer";
            Cost = new Cost()
            {
                Base = new Resources(1750, 160, 40, 60, 20, 30, 0, 32, 0, 4),
                Research = new Resources(1300, 270, 0, 0, 0, 0, 1, 0, 0, 5.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3.33, 0)
            };
            Maneuverability = new Maneuverability(4, 64, 3.6, 10.5);
            Defense = new Defense(720, 150, 0.015, 0.75, 1.2, 0, 180);
            Consumption = new Resources(0, 0, 2, 0, 0, 1.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 80, 120, 40, 75, 0, 0, 0, 0);
            Scouting = new Scouting(3, 11, 25, 8);
            DefaultMainArmament = typeof(C128mm).Name;
            Guns.Add(new C128mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class AssaultGun : Vehicle
    {
        public AssaultGun()
        {
            Name = "assualt_gun";
            Cost = new Cost()
            {
                Base = new Resources(1800, 180, 40, 60, 25, 30, 0, 36, 0, 4),
                Research = new Resources(1500, 300, 0, 0, 0, 0, 1.5, 0, 0, 5.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3.33, 0)
            };
            Maneuverability = new Maneuverability(3, 56, 3.8, 12.5);
            Defense = new Defense(1100, 270, 0.015, 0.8, 1.2, 0, 250);
            Consumption = new Resources(0, 0, 2, 0, 0, 1.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 80, 120, 50, 75, 0, 0, 0, 0);
            Scouting = new Scouting(3, 16, 24, 8);
            DefaultMainArmament = typeof(H155mm).Name;
            Guns.Add(new H155mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class LightTank : Vehicle
    {
        public LightTank()
        {
            Name = "light_tank";
            Cost = new Cost()
            {
                Base = new Resources(2100, 175, 40, 70, 7.5, 50, 0, 24, 0, 3.75),
                Research = new Resources(1100, 280, 0, 0, 0, 0, 1.25, 0, 0, 6),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 4, 0)
            };
            Maneuverability = new Maneuverability(7, 75, 3.3, 12);
            Defense = new Defense(840, 250, 0.025, 0.7, 1.2, 0, 275);
            Consumption = new Resources(0, 0, 2, 0, 0, 2.5, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 80, 140, 15, 125, 0, 0, 0, 0);
            Scouting = new Scouting(4, 14, 30, 9);
            DefaultMainArmament = typeof(C50mm).Name;
            Guns.Add(new C50mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class MediumTank : Vehicle
    {
        public MediumTank()
        {
            Name = "medium_tank";
            Cost = new Cost()
            {
                Base = new Resources(2500, 200, 60, 60, 15, 80, 0, 28, 0, 4.5),
                Research = new Resources(1800, 320, 0, 0, 0, 0, 2, 0, 0, 7),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 5, 0)
            };
            Maneuverability = new Maneuverability(5, 62, 3.75, 14);
            Defense = new Defense(1200, 300, 0.015, 0.85, 1.2, 0, 450);
            Consumption = new Resources(0, 0, 3, 0, 0, 4, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 120, 120, 30, 200, 0, 0, 0, 0);
            Scouting = new Scouting(3, 9.5, 27, 9);
            DefaultMainArmament = typeof(C88mm).Name;
            Guns.Add(new C88mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class HeavyTank : Vehicle
    {
        public HeavyTank()
        {
            Name = "heavy_tank";
            Cost = new Cost()
            {
                Base = new Resources(3200, 250, 90, 50, 30, 120, 0, 32, 0, 5.25),
                Research = new Resources(2500, 360, 0, 0, 0, 0, 3, 0, 0, 8),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 6.67, 0)
            };
            Maneuverability = new Maneuverability(3, 48, 4.2, 16);
            Defense = new Defense(1800, 400, 0.005, 0.99, 1.2, 0, 500);
            Consumption = new Resources(0, 0, 4.5, 0, 0, 6, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 180, 100, 60, 300, 0, 0, 0, 0);
            Scouting = new Scouting(3, 4.5, 21, 9);
            DefaultMainArmament = typeof(C152mm).Name;
            Guns.Add(new C152mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }
    public class ArmouredTrain : Vehicle
    {
        public LoadLimit LoadLimit { get; set; } = new(0, 100, new Resources(0, 0, 3000, 800, 400, 1000, 0, 0, 0, 0));
        public ArmouredTrain()
        {
            Name = "armoured_train";
            Cost = new Cost()
            {
                Base = new Resources(3600, 225, 150, 150, 10, 60, 0, 80, 0, 8),
                Research = new Resources(2000, 350, 0, 0, 0, 0, 4, 0, 0, 10),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 8, 0)
            };
            Maneuverability = new Maneuverability(5, 60, 12, 32);
            Defense = new Defense(1500, 350, 0.001, 0.88, 1.2, 0, 425);
            Consumption = new Resources(0, 0, 7.5, 0, 0, 3, 0, 0, 0, 0);
            Capacity = new Resources(0, 0, 300, 300, 20, 150, 0, 0, 0, 0);
            Scouting = new Scouting(4, 3, 18, 10);
            DefaultMainArmament = typeof(C75mm).Name;
            Guns.Add(new C75mm());
            Consumption.Shells = Guns[0].ShellConsumption;
        }
    }

    public class Gunboat : Vessel
    {

    }
    public class Frigate : Vessel
    {

    }
    public class Destroyer : Vessel
    {

    }
    public class LightCruiser : Vessel
    {

    }
    public class Battlecruiser : Vessel
    {

    }
    public class Battelship : Vessel
    {

    }
    public class AircraftCarrier : Vessel
    {

    }
    public class Submarine : Vessel
    {

    }
    public class EscortCarrier : Vessel
    {

    }
    public class ReplenishmentOiler : Vessel
    {

    }

    public class Attacker : Plane
    {

    }
    public class Fighter : Plane
    {

    }
    public class Bomber : Plane
    {

    }
    public class TransportAircraft : Plane
    {

    }
    public class SurveillanceAircraft : Plane
    {

    }

    #endregion

    #region Technology

    public abstract class Technology
    {
        public string Name { get; set; }
        public Technology Prerequisite { get; set; }
        public Resources Cost { get; set; } = new Resources();
        public Modifier Effect { get; set; } = new Modifier();
    }
    public abstract class Customizable
    {
        public string Name { get; set; }
        public Cost Cost { get; set; } = new Cost();
    }

    #endregion

    #region Firearms

    public abstract class Firearm : Customizable
    {
        public enum Type
        {
            NONE = 0,
            PRIMARY = 1 << 0,
            SECONDARY = 1 << 1,
            BOTH = PRIMARY | SECONDARY
        }
        public Type FirearmType { get; set; }
        public Offense Offense { get; set; } = new Offense();
        public double AmmoWeight { get; set; }
        public Resources ConsumptionNormal { get; set; } = new Resources();
        public Resources ConsumptionSuppress { get; set; } = new Resources();
        public Attribute Noise { get; set; } = new Attribute();
        public Modifier CamoPenaltyMove { get; set; } = new Modifier();
        public Modifier CamoPenaltyFire { get; set; } = new Modifier();
        public Modifier MobilityPenalty { get; set; } = new Modifier();
    }

    public class Pistol : Firearm
    {
        public Pistol() : base()
        {
            Name = "pistol";
            Cost = new Cost()
            {
                Base = new Resources(10, 5, 0, 5, 0, 0, 0, 0, 0, 0.25),
                Research = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(10, 10, 1.5, 0.3, 1), new Damage(20, 2, 20, 0.08, 0.625),
                                  new Accuracy(0.7, 0.35, 0.05), new AOE(0, 0), 0.1, 0, 1, true);
            AmmoWeight = 1.28;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(159.8);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.02);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.15);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class Revolver : Firearm
    {
        public Revolver() : base()
        {
            Name = "revolver";
            Cost = new Cost()
            {
                Base = new Resources(15, 8, 0, 6, 0, 0, 0, 0, 0, 0.5),
                Research = new Resources(150, 25, 0, 25, 0, 0, 0, 0, 0, 1),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(20, 6, 2.3, 0.5, 1), new Damage(50, 5, 30, 0.15, 0.75),
                                  new Accuracy(0.5, 0.25, 0.15), new AOE(0, 0), 0.15, 0, 1, true);
            AmmoWeight = 2;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(164.3);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.02);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.25);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class BurstPistol : Firearm
    {
        public BurstPistol() : base()
        {
            Name = "burst_pistol";
            Cost = new Cost()
            {
                Base = new Resources(25, 13, 0, 3, 0, 0, 0, 0, 0, 0.5),
                Research = new Resources(300, 30, 0, 37, 0, 0, 0, 0, 0, 1),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.75, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(30, 19, 2.27, 0.4, 1), new Damage(30, 3, 15, 0.1, 0.7),
                                  new Accuracy(0.55, 0.275, 0.1), new AOE(0, 0), 0.3, 0, 1, true);
            AmmoWeight = 1.28;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(159.8);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.03);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.18);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class MachinePistol : Firearm
    {
        public MachinePistol() : base()
        {
            Name = "machine_pistol";
            Cost = new Cost()
            {
                Base = new Resources(40, 18, 0, 8, 0, 0, 0, 0, 0, 0.75),
                Research = new Resources(450, 50, 0, 60, 0, 0, 0, 0, 0, 1),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(75, 25, 2.25, 1, 1), new Damage(30, 3, 15, 0.12, 0.65),
                                  new Accuracy(0.6, 0.3, 0.13), new AOE(0, 0), 0.35, 0, 1, true);
            AmmoWeight = 1.28;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(159.8);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.03);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.2);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class Submachinegun : Firearm
    {
        public Submachinegun() : base()
        {
            Name = "submachinegun";
            Cost = new Cost()
            {
                Base = new Resources(75, 32, 0, 10, 0, 0, 0, 0, 0, 1),
                Research = new Resources(750, 60, 0, 75, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.25, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(80, 50, 3, 1, 1), new Damage(25, 2.5, 10, 0.1, 0.5),
                                  new Accuracy(0.65, 0.325, 0.05), new AOE(0, 0), 0.4, 0, 2, true);
            AmmoWeight = 0.31;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(161);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.05);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.16);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.1);
        }
    }
    public class Carbine : Firearm
    {
        public Carbine() : base()
        {
            Name = "carbine";
            Cost = new Cost()
            {
                Base = new Resources(100, 50, 0, 10, 0, 0, 0, 0, 0, 1.25),
                Research = new Resources(1125, 150, 0, 100, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(5, 15, 1.5, 1.5, 1), new Damage(80, 8, 25, 0.05, 0.36),
                                  new Accuracy(0.8, 0.4, 0.03), new AOE(0, 0), 0.2, 0, 3, true);
            AmmoWeight = 1.1;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(163.2);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.06);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.22);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.16);
        }
    }
    public class Rifle : Firearm
    {
        public Rifle() : base()
        {
            Name = "rifle";
            Cost = new Cost()
            {
                Base = new Resources(130, 56, 0, 13, 0, 0, 0, 0, 0, 1.25),
                Research = new Resources(1500, 175, 0, 125, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(4.17, 8, 2, 2, 1), new Damage(100, 10, 40, 0.05, 0.28),
                                  new Accuracy(0.85, 0.425, 0.03), new AOE(0, 0), 0.25, 0, 3, true);
            AmmoWeight = 2.2;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(156.2);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.26);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.18);
        }
    }
    public class SemiAutoRifle : Firearm
    {
        public SemiAutoRifle() : base()
        {
            Name = "semi-auto_rifle";
            Cost = new Cost()
            {
                Base = new Resources(160, 68, 0, 14, 0, 0, 0, 0, 0, 1.5),
                Research = new Resources(1688, 200, 0, 162, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.75, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(12, 10, 2, 1.5, 1), new Damage(90, 9, 35, 0.07, 0.33),
                                  new Accuracy(0.75, 0.375, 0.05), new AOE(0, 0), 0.3, 0, 3, true);
            AmmoWeight = 2.2;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(156.2);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.28);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.18);
        }
    }
    public class BattleRifle : Firearm
    {
        public BattleRifle() : base()
        {
            Name = "battle_rifle";
            Cost = new Cost()
            {
                Base = new Resources(200, 75, 0, 15, 0, 0, 0, 0, 0, 2),
                Research = new Resources(2063, 210, 0, 182, 0, 0, 0, 0, 0, 3),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(40, 20, 3.2, 1.66, 1), new Damage(120, 12, 50, 0.05, 0.3),
                                  new Accuracy(0.8, 0.4, 0.03), new AOE(0, 0), 0.45, 0, 3, true);
            AmmoWeight = 1.98;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(157.3);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.3);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.22);
        }
    }
    public class AssaultRifle : Firearm
    {
        public AssaultRifle() : base()
        {
            Name = "assault_rifle";
            Cost = new Cost()
            {
                Base = new Resources(180, 70, 0, 14, 0, 0, 0, 0, 0, 1.75),
                Research = new Resources(1875, 200, 0, 175, 0, 0, 0, 0, 0, 3),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(50, 30, 2.4, 2, 1), new Damage(95, 9.5, 45, 0.08, 0.35),
                                  new Accuracy(0.7, 0.35, 0.07), new AOE(0, 0), 0.45, 0, 3, true);
            AmmoWeight = 1.54;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(156.2);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.32);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.2);
        }
    }
    public class ScopedRifle : Firearm
    {
        public ScopedRifle() : base()
        {
            Name = "scoped_rifle";
            Cost = new Cost()
            {
                Base = new Resources(250, 100, 0, 20, 0, 0, 0, 0, 0, 3),
                Research = new Resources(2400, 260, 0, 210, 0, 0, 0, 0, 0, 4),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2.75, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(4, 5, 1.4, 3, 1), new Damage(300, 30, 55, 0.02, 0.2),
                                  new Accuracy(0.95, 0.475, 0.03), new AOE(0, 0), 0.6, 0, 6, true);
            AmmoWeight = 1.98;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(154.5);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.1);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.35);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.3);
        }
    }
    public class Shotgun : Firearm
    {
        public Shotgun() : base()
        {
            Name = "shotgun";
            Cost = new Cost()
            {
                Base = new Resources(90, 44, 0, 9, 0, 0, 0, 0, 0, 1),
                Research = new Resources(975, 125, 0, 82, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.25, 0)
            };
            FirearmType = Type.BOTH;
            Offense = new Offense(new Handling(6, 8, 2.8, 0.8, 1), new Damage(200, 20, 80, 0.2, 0.9),
                                  new Accuracy(0.5, 0.25, 0.2), new AOE(0, 0), 0.55, 0, 1, true);
            AmmoWeight = 4.92;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(151.5);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.07);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.4);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.13);
        }
    }
    public class SemiAutoCarbine : Firearm
    {
        public SemiAutoCarbine() : base()
        {
            Name = "semi-auto_carbine";
            Cost = new Cost()
            {
                Base = new Resources(125, 63, 0, 11, 0, 0, 0, 0, 0, 1.5),
                Research = new Resources(1515, 162, 0, 112, 0, 0, 0, 0, 0, 2),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.75, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(15, 20, 1.5, 1.5, 1), new Damage(70, 7, 25, 0.07, 0.4),
                                  new Accuracy(0.75, 0.375, 0.05), new AOE(0, 0), 0.3, 0, 3, true);
            AmmoWeight = 1.1;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(163.2);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.06);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.27);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.16);
        }
    }
    public class RocketLauncher : Firearm
    {
        public RocketLauncher() : base()
        {
            Name = "rocket_launcher";
            Cost = new Cost()
            {
                Base = new Resources(450, 150, 0, 0, 15, 0, 1, 0, 0, 4.5),
                Research = new Resources(4125, 400, 0, 0, 50, 0, 5, 0, 0, 6),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3.75, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(2.5, 1, 8, 5, 1), new Damage(1000, 500, 1000, 0.3, 0.166),
                                  new Accuracy(0.35, 0.175, 0.15), new AOE(0.15, 0.75), 0.25, 1, 4, false);
            AmmoWeight = 8.25;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(172.3);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.12);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.5);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.33);
        }
    }
    public class GrenadeLauncher : Firearm
    {
        public GrenadeLauncher() : base()
        {
            Name = "grenade_launcher";
            Cost = new Cost()
            {
                Base = new Resources(325, 112, 0, 0, 8, 0, 0.5, 0, 0, 3.25),
                Research = new Resources(3000, 290, 0, 0, 30, 0, 2, 0, 0, 5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(3, 1, 6, 4, 1), new Damage(500, 250, 500, 0.25, 0.14),
                                  new Accuracy(0.4, 0.2, 0.15), new AOE(0.1, 0.6), 0.2, 1, 4, false);
            AmmoWeight = 2.28;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(70);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.09);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.2);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.2);
        }
    }
    public class Mortar : Firearm
    {
        public Mortar() : base()
        {
            Name = "mortar";
            Cost = new Cost()
            {
                Base = new Resources(400, 131, 0, 0, 12, 0, 0.75, 0, 0, 4),
                Research = new Resources(3750, 360, 0, 0, 37, 0, 3, 0, 0, 5.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 3.5, 0)
            };
            FirearmType = Type.BOTH;
            Offense = new Offense(new Handling(2.5, 1, 1, 2.5, 1), new Damage(750, 375, 750, 0.2, 0.15),
                                  new Accuracy(0.3, 0.15, 0.15), new AOE(0.3, 0.5), 0.75, 1, 6, false);
            AmmoWeight = 3.5;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(174);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.15);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.46);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.38);
        }
    }
    public class InfantryGun : Firearm
    {
        public InfantryGun() : base()
        {
            Name = "infantry_gun";
            Cost = new Cost()
            {
                Base = new Resources(500, 156, 0, 0, 20, 0, 2, 0, 0, 5.25),
                Research = new Resources(4688, 420, 0, 0, 75, 0, 8, 0, 0, 8),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 4.25, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(3, 1, 5, 6, 1), new Damage(1250, 625, 1250, 0.25, 0.125),
                                  new Accuracy(0.45, 0.275, 0.1), new AOE(0.2, 0.45), 0.35, 1, 7, false);
            AmmoWeight = 6;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(177);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.18);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.62);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.45);
        }
    }
    public class RecoillessRifle : Firearm
    {
        public RecoillessRifle() : base()
        {
            Name = "recoilless_rifle";
            Cost = new Cost()
            {
                Base = new Resources(425, 138, 0, 0, 15, 0, 1.5, 0, 0, 3.5),
                Research = new Resources(3938, 375, 0, 0, 55, 0, 2.5, 0, 0, 6.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 4, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(1.5, 1, 4, 3.5, 1), new Damage(900, 450, 900, 0.2, 0.08),
                                  new Accuracy(0.5, 0.25, 0.13), new AOE(0.2, 0.4), 0.35, 1, 6, true);
            AmmoWeight = 14.8;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(168);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.14);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.52);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.35);
        }
    }
    public class AutomaticGrenadeLauncher : Firearm
    {
        public AutomaticGrenadeLauncher() : base()
        {
            Name = "auto_grenade_launcher";
            Cost = new Cost()
            {
                Base = new Resources(600, 175, 0, 0, 24, 0, 1.5, 0, 0, 5.75),
                Research = new Resources(5625, 450, 0, 0, 90, 0, 6, 0, 0, 6.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(7.5, 5, 12, 4, 1), new Damage(500, 250, 500, 0.2, 0.15),
                                  new Accuracy(0.33, 0.166, 0.17), new AOE(0.15, 0.6), 0.45, 1, 4, false);
            AmmoWeight = 2.28;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(80);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.09);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.25);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.28);
        }
    }
    public class MultipleRocketLauncher : Firearm
    {
        public MultipleRocketLauncher() : base()
        {
            Name = "multi_rocket_launcher";
            Cost = new Cost()
            {
                Base = new Resources(700, 200, 0, 0, 45, 0, 3, 0, 0, 6.5),
                Research = new Resources(6750, 500, 0, 0, 150, 0, 15, 0, 0, 9),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 6, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(2.5, 10, 20, 5, 5), new Damage(1000, 500, 1000, 0.27, 0.18),
                                  new Accuracy(0.3, 0.15, 0.18), new AOE(0.25, 0.65), 0.3, 1, 4, false);
            AmmoWeight = 8.25;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(172.3);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.16);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.55);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.5);
        }
    }
    public class Molotov : Firearm
    {
        public Molotov() : base()
        {
            Name = "molotov";
            Cost = new Cost()
            {
                Base = new Resources(5, 0, 0, 0, 0, 5, 0, 0, 0, 0.25),
                Research = new Resources(75, 0, 0, 0, 0, 40, 0, 0, 0, 1),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0)
            };
            FirearmType = Type.SECONDARY;
            Offense = new Offense(new Handling(1, 1, 2, 0, 1), new Damage(250, 25, 120, 0.1, 0),
                                  new Accuracy(0.8, 0.4, 0.05), new AOE(0, 0), 0.1, 0, 1, true);
            AmmoWeight = 0.75;
            ConsumptionNormal = new Resources(0, 0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0);
            Noise = new Attribute(40);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.3);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class AutomaticRifle : Firearm
    {
        public AutomaticRifle() : base()
        {
            Name = "auto_rifle";
            Cost = new Cost()
            {
                Base = new Resources(275, 88, 0, 18, 0, 0, 0, 0, 0, 2.5),
                Research = new Resources(2250, 275, 0, 100, 0, 0, 0, 0, 0, 3.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(70, 40, 2, 2, 1), new Damage(150, 15, 60, 0.05, 0.275),
                                  new Accuracy(0.75, 0.375, 0.05), new AOE(0, 0), 0.5, 0, 3, true);
            AmmoWeight = 1.54;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(165);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.38);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.2);
        }
    }
    public class LightMachinegun : Firearm
    {
        public LightMachinegun() : base()
        {
            Name = "light_machine_gun";
            Cost = new Cost()
            {
                Base = new Resources(300, 100, 0, 22, 0, 0, 0, 0, 0, 2.75),
                Research = new Resources(2625, 250, 0, 112, 0, 0, 0, 0, 0, 4.25),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 2.25, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(120, 200, 6, 4, 1), new Damage(125, 12.5, 30, 0.1, 0.2),
                                  new Accuracy(0.6, 0.3, 0.12), new AOE(0, 0), 0.8, 0, 4, true);
            AmmoWeight = 1.39;
            ConsumptionNormal = new Resources(0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0, 0);
            Noise = new Attribute(153);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.12);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.42);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.3);
        }
    }
    public class Grenade : Firearm
    {
        public Grenade() : base()
        {
            Name = "grenade";
            Cost = new Cost()
            {
                Base = new Resources(30, 10, 0, 0, 2, 0, 0.1, 0, 0, 0.25),
                Research = new Resources(125, 40, 0, 0, 13, 0, 0.5, 0, 0, 1.25),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(1, 1, 1, 0, 1), new Damage(400, 80, 200, 0.1, 0),
                                  new Accuracy(0.9, 0.45, 0.05), new AOE(0.1, 0.6), 0.15, 0, 1, false);
            AmmoWeight = 0.9;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(70);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.1);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0);
        }
    }
    public class RifleGrenade : Firearm
    {
        public RifleGrenade() : base()
        {
            Name = "rifle_grenade";
            Cost = new Cost()
            {
                Base = new Resources(60, 20, 0, 0, 4, 0, 0.2, 0, 0, 1.75),
                Research = new Resources(563, 80, 0, 0, 25, 0, 0.75, 0, 0, 2.75),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 1.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(2, 5, 3, 2, 5), new Damage(400, 80, 200, 0.1, 0),
                                  new Accuracy(0.75, 0.375, 0.1), new AOE(0.1, 0.6), 0.2, 0, 2, false);
            AmmoWeight = 0.59;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(100);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.08);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.12);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.21);
        }
    }
    public class Flamethrower : Firearm
    {
        public Flamethrower() : base()
        {
            Name = "flamethrower";
            Cost = new Cost()
            {
                Base = new Resources(200, 62, 0, 0, 0, 24, 1.25, 0, 0, 2),
                Research = new Resources(1875, 182, 0, 0, 0, 100, 3, 0, 0, 3.5),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 4, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(1, 50, 10, 0, 1), new Damage(300, 30, 150, 0.1, 0.6),
                                  new Accuracy(0.9, 0.45, 0.05), new AOE(0.05, 0.8), 0.25, 0, 1, true);
            AmmoWeight = 1.9;
            ConsumptionNormal = new Resources(0, 0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0);
            Noise = new Attribute(60);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.1);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.48);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.23);
        }
    }
    public class MountainGun : Firearm
    {
        public MountainGun() : base()
        {
            Name = "mountain_gun";
            Cost = new Cost()
            {
                Base = new Resources(625, 188, 0, 0, 36, 0, 2, 0, 0, 6),
                Research = new Resources(6000, 480, 0, 0, 80, 0, 12, 0, 0, 8),
                Manufacture = new Resources(0, 0, 0, 0, 0, 0, 0, 0, 5.5, 0)
            };
            FirearmType = Type.PRIMARY;
            Offense = new Offense(new Handling(3, 1, 5.5, 6, 1), new Damage(1500, 750, 1500, 0.25, 0.125),
                                  new Accuracy(0.55, 0.275, 0.1), new AOE(0.2, 0.35), 0.4, 1, 7, false);
            AmmoWeight = 6.35;
            ConsumptionNormal = new Resources(0, 0, 0, 0, Offense.Handling.ROF * AmmoWeight / 10, 0, 0, 0, 0, 0);
            ConsumptionSuppress = new Resources(0, 0, 0, 0, Offense.Handling.ROFSuppress * AmmoWeight / 10, 0, 0, 0, 0, 0);
            Noise = new Attribute(177);
            CamoPenaltyMove = new Modifier(ModifierType.PERCENTAGE, -0.18);
            CamoPenaltyFire = new Modifier(ModifierType.PERCENTAGE, -0.65);
            MobilityPenalty = new Modifier(ModifierType.PERCENTAGE, -0.45);
        }
    }

    #endregion

    #region Modules

    public abstract class Module : Customizable
    {
        public Attribute Integrity { get; set; } = new Attribute();
        public Attribute Weight { get; set; } = new Attribute();
    }
    public abstract class Gun : Module
    {
        public Offense Offense { get; set; } = new Offense();
        public Attribute Noise { get; set; } = new Attribute();
        public Attribute CamoPenaltyFire { get; set; } = new Attribute();
        public Attribute ShellConsumption { get; set; } = new Attribute();
        public List<string> CompatibleShells { get; set; } = new List<string>();
        public Shell CurrentShell { get; set; }
    }
    public abstract class Cannon : Gun
    {
        public Cannon() : base()
        {
            CompatibleShells = new List<string>() 
            { 
                typeof(AP).Name,
                typeof(HE).Name
            };
        }
    }
    public abstract class Howitzer : Gun
    {
        public Howitzer() : base()
        {
            CompatibleShells = new List<string>() { typeof(HE).Name };
        }
    }

    public sealed class C20mm : Cannon 
    {
        public C20mm()
        {
            Name = "cannon_20mm";
            Offense = new Offense(new Handling(5, 1, 2, 1, 1), new Damage(400, 400, 320, 0.1, 0, 80),
                                  new Accuracy(0.88, 0.88, 0.06), new AOE(0.1, 0.9), 0, 0, 6, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.4);
            ShellConsumption = new Attribute(0.13);
        }
    }
    public sealed class C37mm : Cannon
    {
        public C37mm()
        {
            Name = "cannon_37mm";
            Offense = new Offense(new Handling(4.5, 1, 2.5, 1.5, 1), new Damage(460, 460, 368, 0.1, 0, 100),
                                  new Accuracy(0.84, 0.84, 0.06), new AOE(0.15, 0.85), 0, 0, 6, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.45);
            ShellConsumption = new Attribute(0.29);
        }
    }
    public sealed class C50mm : Cannon
    {
        public C50mm()
        {
            Name = "cannon_50mm";
            Offense = new Offense(new Handling(3.33, 1, 3.2, 1.6, 1), new Damage(625, 625, 500, 0.1, 0, 160),
                                  new Accuracy(0.8, 0.8, 0.06), new AOE(0.2, 0.8), 0, 0, 7, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.5);
            ShellConsumption = new Attribute(1.42);
        }
    }
    public sealed class C75mm : Cannon
    {
        public C75mm()
        {
            Name = "cannon_75mm";
            Offense = new Offense(new Handling(3, 1, 4, 2, 1), new Damage(940, 940, 752, 0.1, 0, 225),
                                  new Accuracy(0.75, 0.75, 0.06), new AOE(0.25, 0.75), 0, 0, 7, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.56);
            ShellConsumption = new Attribute(1.95);
        }
    }
    public sealed class C88mm : Cannon
    {
        public C88mm()
        {
            Name = "cannon_88mm";
            Offense = new Offense(new Handling(2.5, 1, 4.5, 2.5, 1), new Damage(1100, 1100, 880, 0.1, 0, 250),
                                  new Accuracy(0.72, 0.72, 0.06), new AOE(0.33, 0.72), 0, 0, 8, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.58);
            ShellConsumption = new Attribute(2.24);
        }
    }
    public sealed class C128mm : Cannon
    {
        public C128mm()
        {
            Name = "cannon_128mm";
            Offense = new Offense(new Handling(2, 1, 6, 2.5, 1), new Damage(1600, 1600, 1280, 0.1, 0, 320),
                                  new Accuracy(0.7, 0.7, 0.06), new AOE(0.5, 0.66), 0, 0, 8, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.64);
            ShellConsumption = new Attribute(2.25);
        }
    }
    public sealed class C152mm : Cannon
    {
        public C152mm()
        {
            Name = "cannon_152mm";
            Offense = new Offense(new Handling(1.5, 1, 7.5, 3, 1), new Damage(1900, 1900, 1520, 0.1, 0, 400),
                                  new Accuracy(0.66, 0.66, 0.06), new AOE(0.6, 0.64), 0, 0, 9, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.68);
            ShellConsumption = new Attribute(1.94);
        }
    }
    public sealed class C203mm : Cannon
    {
        public C203mm()
        {
            Name = "cannon_203mm";
            Offense = new Offense(new Handling(1.33, 1, 8.4, 3, 1), new Damage(2540, 2540, 2032, 0.1, 0, 450),
                                  new Accuracy(0.64, 0.64, 0.06), new AOE(0.7, 0.6), 0, 0, 9, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.72);
            ShellConsumption = new Attribute(2.11);
        }
    }
    public sealed class C280mm : Cannon
    {
        public C280mm()
        {
            Name = "cannon_280mm";
            Offense = new Offense(new Handling(1, 1, 10, 4, 1), new Damage(3500, 3500, 2800, 0.1, 0, 500),
                                  new Accuracy(0.6, 0.6, 0.06), new AOE(0.75, 0.5), 0, 1, 10, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.8);
            ShellConsumption = new Attribute(1.95);
        }
    }
    public sealed class C305mm : Cannon
    {
        public C305mm()
        {
            Name = "cannon_305mm";
            Offense = new Offense(new Handling(0.8, 1, 12, 5, 1), new Damage(3800, 3800, 3040, 0.1, 0, 540),
                                  new Accuracy(0.56, 0.56, 0.06), new AOE(0.78, 0.48), 0, 1, 10, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.84);
            ShellConsumption = new Attribute(1.76);
        }
    }
    public sealed class C381mm : Cannon
    {
        public C381mm()
        {
            Name = "cannon_381mm";
            Offense = new Offense(new Handling(0.5, 1, 15, 7.5, 1), new Damage(4760, 4760, 3808, 0.1, 0, 600),
                                  new Accuracy(0.5, 0.5, 0.06), new AOE(0.85, 0.4), 0, 1, 11, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.9);
            ShellConsumption = new Attribute(1.44);
        }
    }
    public sealed class C480mm : Cannon
    {
        public C480mm()
        {
            Name = "cannon_480mm";
            Offense = new Offense(new Handling(0.2, 1, 21, 9, 1), new Damage(6000, 6000, 4800, 0.1, 0, 750),
                                  new Accuracy(0.44, 0.44, 0.06), new AOE(0.9, 0.33), 0, 2, 12, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.95);
            ShellConsumption = new Attribute(1.08);
        }
    }
    public sealed class C800mm : Cannon
    {
        public C800mm()
        {
            Name = "cannon_800mm";
            Offense = new Offense(new Handling(0.08, 1, 30, 20, 1), new Damage(10000, 10000, 8000, 0.1, 0, 1000),
                                  new Accuracy(0.4, 0.4, 0.06), new AOE(1, 0.15), 0, 3, 15, true);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.99);
            ShellConsumption = new Attribute(0.80);
        }
    }

    public sealed class H75mm : Howitzer
    {
        public H75mm()
        {
            Name = "howitzer_75mm";
            Offense = new Offense(new Handling(1.6, 1, 7.5, 3, 1), new Damage(1200, 900, 1800, 0.05, 0, 150), new Accuracy(0.7, 0.7, 0.08), new AOE(0.4, 0.6), 0, 1, 6, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.6);
            ShellConsumption = new Attribute(1.67);
        }
    }
    public sealed class H105mm : Howitzer
    {
        public H105mm()
        {
            Name = "howitzer_105mm";
            Offense = new Offense(new Handling(1.2, 1, 9, 4, 1), new Damage(1500, 1125, 2250, 0.05, 0, 200), new Accuracy(0.66, 0.66, 0.08), new AOE(0.5, 0.5), 0, 1, 5, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.65);
            ShellConsumption = new Attribute(1.57);
        }
    }
    public sealed class H122mm : Howitzer
    {
        public H122mm()
        {
            Name = "howitzer_122mm";
            Offense = new Offense(new Handling(1, 1, 10, 4.5, 1), new Damage(1600, 1200, 2400, 0.05, 0, 225),
                                  new Accuracy(0.64, 0.64, 0.08), new AOE(0.55, 0.45), 0, 1, 5, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.7);
            ShellConsumption = new Attribute(1.56);
        }
    }
    public sealed class H155mm : Howitzer
    {
        public H155mm()
        {
            Name = "howitzer_155mm";
            Offense = new Offense(new Handling(0.8, 1, 11, 5, 1), new Damage(2000, 1500, 3000, 0.05, 0, 250),
                                  new Accuracy(0.6, 0.6, 0.08), new AOE(0.6, 0.4), 0, 1, 5, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.75);
            ShellConsumption = new Attribute(1.41);
        }
    }
    public sealed class H203mm : Howitzer
    {
        public H203mm()
        {
            Name = "howitzer_203mm";
            Offense = new Offense(new Handling(0.5, 1, 12.5, 6, 1), new Damage(2400, 1800, 3600, 0.05, 0, 300),
                                  new Accuracy(0.52, 0.52, 0.08), new AOE(0.72, 0.32), 0, 1, 4, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.8);
            ShellConsumption = new Attribute(1.35);
        }
    }
    public sealed class H280mm : Howitzer
    {
        public H280mm()
        {
            Name = "howitzer_280mm";
            Offense = new Offense(new Handling(0.25, 1, 15, 7, 1), new Damage(3000, 2250, 4500, 0.05, 0, 400),
                                  new Accuracy(0.48, 0.48, 0.08), new AOE(0.8, 0.25), 0, 1, 4, false);
            Noise = new Attribute(180);
            CamoPenaltyFire = new Attribute(-0.85);
            ShellConsumption = new Attribute(1.08);
        }
    }

    public class MachineGun
    {
        public MachineGun()
        {

        }
    }
    public class Engine : Module
    {
        public Attribute Horsepower { get; set; } = new Attribute();
        public Attribute FuelConsumption { get; set; } = new Attribute();
        public Attribute CatchFireChance { get; set; } = new Attribute();
    }
    public class Suspension
    {

    }
    public class Radio : Module
    {
        public Attribute SignalStrength { get; set; } = new Attribute();
    }
    public class Periscope : Module
    {
        public Attribute ObservableRange { get; set; } = new Attribute();
    }
    public class FuelTank : Module
    {
        public Attribute Capacity { get; set; } = new Attribute();
        public Attribute Leakage { get; set; } = new Attribute();
    }
    public class CannonBreech : Module
    {
        public Attribute MisfireChance { get; set; } = new Attribute();
    }
    public class AmmoRack : Module
    {
        public Attribute Capacity { get; set; } = new Attribute();
    }
    public class TorpedoTubes : Module
    {
        public Attribute Capacity { get; set; } = new Attribute();
    }
    public class Sonar : Module
    {
        public Attribute Range { get; set; } = new Attribute();
    }
    public class Propeller : Module
    {
        public Attribute Thrust { get; set; } = new Attribute();
    }
    public class Rudder : Module
    {
        public Attribute Steering { get; set; } = new Attribute();
    }
    public class Wings : Module
    {

    }
    public class LandingGear : Module
    {

    }
    public class Radar : Module
    {
        public Attribute Range { get; set; } = new Attribute();
    }

    #endregion

    #region Equippment

    public abstract class Equippment : Customizable
    {

    }

    #endregion

    #region Shells

    public abstract class Shell : Customizable
    {
        public Modifier PenetrationCoefficient { get; set; } = new Modifier();
        public Modifier PenetrationDeviation { get; set; } = new Modifier();
        public Modifier AOEModifier { get; set; } = new Modifier();
        public Modifier SplashDecayModifier { get; set; } = new Modifier();
        public Modifier DropoffModifier { get; set; } = new Modifier();
    }

    public class AP : Shell
    {
        public AP()
        {
            PenetrationCoefficient = new Modifier(ModifierType.MULTIPLE, 1);
            PenetrationDeviation = new Modifier(ModifierType.FIXED_VALUE, 0.1);
            AOEModifier = new Modifier(ModifierType.MULTIPLE, 1);
            SplashDecayModifier = new Modifier(ModifierType.MULTIPLE, 1);
            DropoffModifier = new Modifier(ModifierType.MULTIPLE, 1);
        }
    }
    public class HE : Shell
    {
        public HE()
        {
            PenetrationCoefficient = new Modifier(ModifierType.MULTIPLE, 0.2);
            PenetrationDeviation = new Modifier(ModifierType.FIXED_VALUE, 0);
            AOEModifier = new Modifier(ModifierType.MULTIPLE, 1.25);
            SplashDecayModifier = new Modifier(ModifierType.MULTIPLE, 0.75);
            DropoffModifier = new Modifier(ModifierType.MULTIPLE, 0);
        }
    }

    #endregion

    #region Map

    public class Map
    {
        public int Height => 100;
        public int Width => 100;
        public Tile[][] GameMap { get; set; }
        public List<Cities> MapCities { get; set; } = new List<Cities>();
        private static Dictionary<string, double> Height_const => new()
        {
            ["sea"] = 0.3,
            ["land"] = 0.55,
            ["hillock"] = 0.6,
            ["hill"] = 0.65
        };
        private static Dictionary<string, double> Humidity_const => new()
        {
            ["desert"] = 0.35,
            ["plain"] = 0.45,
            ["grassland"] = 0.5,
            ["forest"] = 0.55,
            ["jungle"] = 0.6
        };

        private double[][] GenerateWhiteNoise(int width, int height)
        {
            Random random = new();
            double[][] noise = new double[width][];
            for (int i = 0; i < width; i++)
            {
                noise[i] = new double[height];
            }

            for (int i = 0; i < width; i++)
            {
                for (int j = 0; j < height; j++)
                {
                    noise[i][j] = (double)random.NextDouble() % 1;
                }
            }

            return noise;
        }
        private double[][] GenerateSmoothNoise(double[][] baseNoise, int octave)
        {
            int width = baseNoise.Length;
            int height = baseNoise[0].Length;

            double[][] smoothNoise = new double[width][];
            for (int i = 0; i < width; i++)
            {
                smoothNoise[i] = new double[height];
            }

            int samplePeriod = 1 << octave; // calculates 2 ^ k
            double sampleFrequency = 1.0f / samplePeriod;

            for (int i = 0; i < width; i++)
            {
                //calculate the horizontal sampling indices
                int sample_i0 = (i / samplePeriod) * samplePeriod;
                int sample_i1 = (sample_i0 + samplePeriod) % width; //wrap around
                double horizontal_blend = (i - sample_i0) * sampleFrequency;

                for (int j = 0; j < height; j++)
                {
                    //calculate the vertical sampling indices
                    int sample_j0 = (j / samplePeriod) * samplePeriod;
                    int sample_j1 = (sample_j0 + samplePeriod) % height; //wrap around
                    double vertical_blend = (j - sample_j0) * sampleFrequency;

                    //blend the top two corners
                    double top = Interpolate(baseNoise[sample_i0][sample_j0],
                       baseNoise[sample_i1][sample_j0], horizontal_blend);

                    //blend the bottom two corners
                    double bottom = Interpolate(baseNoise[sample_i0][sample_j1],
                       baseNoise[sample_i1][sample_j1], horizontal_blend);

                    //final blend
                    smoothNoise[i][j] = Interpolate(top, bottom, vertical_blend);
                }
            }

            return smoothNoise;
        }
        private double Interpolate(double x0, double x1, double alpha) => x0 * (1 - alpha) + alpha * x1;
        private double[][] GeneratePerlinNoise(double[][] baseNoise, int octaveCount)
        {
            int width = baseNoise.Length;
            int height = baseNoise[0].Length;

            double[][][] smoothNoise = new double[octaveCount][][]; //an array of 2D arrays containing

            double persistance = 0.7f;

            //generate smooth noise
            for (int i = 0; i < octaveCount; i++)
            {
                smoothNoise[i] = GenerateSmoothNoise(baseNoise, i);
            }

            double[][] perlinNoise = new double[width][];
            for (int i = 0; i < width; i++)
            {
                perlinNoise[i] = new double[height];
            }
            double amplitude = 1.0f;
            double totalAmplitude = 0.0f;

            //blend noise together
            for (int octave = octaveCount - 1; octave >= 0; octave--)
            {
                amplitude *= persistance;
                totalAmplitude += amplitude;

                for (int i = 0; i < width; i++)
                {
                    for (int j = 0; j < height; j++)
                    {
                        perlinNoise[i][j] += smoothNoise[octave][i][j] * amplitude;
                    }
                }
            }

            //normalisation
            for (int i = 0; i < width; i++)
            {
                for (int j = 0; j < height; j++)
                {
                    perlinNoise[i][j] /= totalAmplitude;
                }
            }

            return perlinNoise;
        }
        public void Generate()
        {
            double[][] map = GeneratePerlinNoise(GenerateWhiteNoise(Width, Height), 6);
            double[][] humidity_map = GeneratePerlinNoise(GenerateWhiteNoise(Width, Height), 6);

            IEnumerable<double> flattened = map.SelectMany(a => a);
            double minmax = flattened.Min() + flattened.Max();

            IEnumerable<double> h_flattened = humidity_map.SelectMany(a => a);
            double minmax_h = h_flattened.Min() + h_flattened.Max();

            GameMap = new Tile[Width][];
            for (int i = 0; i < Width; i++)
            {
                GameMap[i] = new Tile[Height];
                for (int j = 0; j < Height; j++)
                {
                    GameMap[i][j] =
                    (i == Width - 1 || j == Height - 1 || i == 0 || j == 0)
                    ? new Boundary(new Point(i, j))
                    : map[i][j] <= minmax * Height_const["sea"]
                        ? new Stream(new Point(i, j))
                        : (map[i][j] <= minmax * Height_const["land"]
                            ? (humidity_map[i][j] <= minmax_h * Humidity_const["desert"]
                                ? new Desert(new Point(i, j))
                                : (humidity_map[i][j] <= minmax_h * Humidity_const["plain"]
                                    ? new Plains(new Point(i, j))
                                    : (humidity_map[i][j] <= minmax_h * Humidity_const["grassland"]
                                        ? new Grassland(new Point(i, j))
                                        : (humidity_map[i][j] <= minmax_h * Humidity_const["forest"]
                                            ? new Forest(new Point(i, j))
                                            : (humidity_map[i][j] <= minmax_h * Humidity_const["jungle"]
                                                ? new Jungle(new Point(i, j))
                                                : new Swamp(new Point(i, j)))))))
                            : (map[i][j] <= minmax * Height_const["hillock"]
                                ? new Hillock(new Point(i, j))
                                : (map[i][j] <= minmax * Height_const["hill"]
                                    ? new Hills(new Point(i, j))
                                    : new Mountains(new Point(i, j)))));
                }
            }
            string json = Regex.Replace(JsonSerializer.Serialize(GameMap, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
            File.WriteAllText("map.json", json);
            MapData mapData = new(Width, Height, GameMap);
            mapData.Export();
        }

        // assign cities manually
        public Map()
        {
            MapCities.AddRange(new Cities[]
            {
                new Metropolis(new Point(17, 7)),
                new Metropolis(new Point(47, 77))
            });
        }
        public void ExportCities()
        {
            string json = Regex.Replace(JsonSerializer.Serialize(MapCities, new JsonSerializerOptions() { WriteIndented = true }), @"\r\n\s+""IsEmpty"": (?:true|false),", "");
            File.WriteAllText("mapcities.json", json);
        }
    }

    #endregion
}
